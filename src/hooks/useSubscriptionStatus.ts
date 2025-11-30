import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { useSession } from '../context/SessionContext';
import { type Schema } from '../../amplify/data/resource';
import { listUserSubscriptions } from '../graphql/queries';

export interface SubscriptionStatus {
  status: 'active' | 'expired' | 'grace_period' | 'trial';
  daysRemaining: number;
  isExpired: boolean;
  isInGracePeriod: boolean;
  gracePeriodDaysRemaining: number;
  canAccessContent: boolean;
  canCreateContent: boolean;
  trialEndDate?: string;
  subscriptionType?: string;
  isLoading: boolean;
  hasError: boolean;
}

const GRACE_PERIOD_DAYS = 14;

export function useSubscriptionStatus(): SubscriptionStatus {
  const { userId, isAuthenticated } = useSession();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    status: 'trial',
    daysRemaining: 0,
    isExpired: false,
    isInGracePeriod: false,
    gracePeriodDaysRemaining: 0,
    canAccessContent: true,
    canCreateContent: true,
    isLoading: true,
    hasError: false,
  });

  useEffect(() => {
    // Only proceed if user is authenticated and we have a userId
    if (!isAuthenticated || !userId) {
      // Don't set expired status immediately - wait for authentication to complete
      // This prevents the modal from showing prematurely
      return;
    }

    const fetchSubscriptionStatus = async (): Promise<{ items: any[] } | null> => {
      try {
        const client = generateClient<Schema>();
        const result = await client.graphql({
          query: listUserSubscriptions,
          variables: { filter: { owner: { eq: userId } } }
        }) as any;
        
        return { items: result.data?.listUserSubscriptions?.items || [] };
      } catch (error) {
        console.error('Error fetching subscription status:', error);
        
        // Check if it's an authentication error
        if (error instanceof Error && error.message.includes('NoSignedUser')) {
          // Authentication error - return null to stop retries
          return null;
        }
        
        // For other errors, throw to trigger retry logic
        throw error;
      }
    };

    const processSubscriptionData = (items: any[]) => {
      if (items.length === 0) {
        return null; // Signal that retry is needed
      }

      const subscription = items[0];
      const trialEndDate = subscription.trialEndDate;
      
      if (!trialEndDate) {
        // No trial end date - treat as expired (no retry needed)
        setSubscriptionStatus({
          status: 'expired',
          daysRemaining: 0,
          isExpired: true,
          isInGracePeriod: false,
          gracePeriodDaysRemaining: 0,
          canAccessContent: false,
          canCreateContent: false,
          isLoading: false,
          hasError: false,
        });
        return true; // Signal success (no retry needed)
      }

      const endDate = new Date(trialEndDate);
      const now = new Date();
      const diffInDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let status: SubscriptionStatus['status'];
      let isExpired = false;
      let isInGracePeriod = false;
      let gracePeriodDaysRemaining = 0;
      let canAccessContent = true;
      let canCreateContent = true;

      if (diffInDays > 0) {
        // Still in trial period
        status = 'trial';
      } else if (diffInDays >= -GRACE_PERIOD_DAYS) {
        // In grace period
        status = 'grace_period';
        isInGracePeriod = true;
        gracePeriodDaysRemaining = GRACE_PERIOD_DAYS + diffInDays;
        canCreateContent = false; // Limited functionality in grace period
      } else {
        // Fully expired
        status = 'expired';
        isExpired = true;
        canAccessContent = false;
        canCreateContent = false;
      }
      
      setSubscriptionStatus(prev => {
        // Only update if the status actually changed
        const newStatus = {
          status,
          daysRemaining: Math.max(0, diffInDays),
          isExpired,
          isInGracePeriod,
          gracePeriodDaysRemaining,
          canAccessContent,
          canCreateContent,
          trialEndDate,
          subscriptionType: subscription.subscriptionType,
          isLoading: false,
          hasError: false,
        };
        
        // Check if anything actually changed
        if (prev.status === newStatus.status && 
            prev.daysRemaining === newStatus.daysRemaining &&
            prev.isExpired === newStatus.isExpired &&
            prev.isInGracePeriod === newStatus.isInGracePeriod) {
          return prev;
        }
        
        return newStatus;
      });
      
      return true; // Signal success
    };

    const fetchWithRetry = async () => {
      setSubscriptionStatus(prev => ({ ...prev, isLoading: true, hasError: false }));
      
      // Add a small delay to ensure authentication is fully complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Retry delays: 500ms, 1s, 2s, 4s (exponential backoff)
      const retryDelays = [500, 1000, 2000, 4000];
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= retryDelays.length; attempt++) {
        try {
          const result = await fetchSubscriptionStatus();
          
          // If authentication error, stop retrying
          if (result === null) {
            return;
          }
          
          const processed = processSubscriptionData(result.items);
          
          // If subscription found and processed successfully, we're done
          if (processed === true) {
            return;
          }
          
          // If no subscription found and we have retries left, wait and retry
          if (processed === null && attempt < retryDelays.length) {
            await new Promise(resolve => setTimeout(resolve, retryDelays[attempt]));
            continue;
          }
          
          // If no subscription found and no retries left, mark as expired
          if (processed === null) {
            setSubscriptionStatus({
              status: 'expired',
              daysRemaining: 0,
              isExpired: true,
              isInGracePeriod: false,
              gracePeriodDaysRemaining: 0,
              canAccessContent: false,
              canCreateContent: false,
              isLoading: false,
              hasError: false,
            });
            return;
          }
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error');
          
          // If authentication error, stop retrying
          if (lastError.message.includes('NoSignedUser')) {
            return;
          }
          
          // If we have retries left, wait and retry
          if (attempt < retryDelays.length) {
            await new Promise(resolve => setTimeout(resolve, retryDelays[attempt]));
            continue;
          }
          
          // If all retries exhausted, set error state
          setSubscriptionStatus(prev => ({
            ...prev,
            isLoading: false,
            hasError: true,
          }));
          return;
        }
      }
    };

    fetchWithRetry();
  }, [userId, isAuthenticated]);

  return subscriptionStatus;
}
