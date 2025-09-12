import React, { useState, useCallback } from 'react';
import { generateClient } from 'aws-amplify/api';
import { useSession } from '../context/SessionContext';
import { useSubscriptionStatus } from './useSubscriptionStatus';
import { type Schema } from '../../amplify/data/resource';

interface SubscriptionUpgradeResult {
  success: boolean;
  message: string;
  subscriptionId?: string;
  error?: string;
}

export function useSubscriptionManager() {
  const { userId, isAuthenticated } = useSession();
  const subscriptionStatus = useSubscriptionStatus();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [lastLoggedStatus, setLastLoggedStatus] = useState<string>('');

  // Only log when status actually changes to reduce console noise
  React.useEffect(() => {
    const currentStatus = `${subscriptionStatus.daysRemaining}-${subscriptionStatus.isInGracePeriod}-${subscriptionStatus.isExpired}`;
    if (currentStatus !== lastLoggedStatus) {
      // Only log if we have meaningful data (not initial/loading state)
      if (subscriptionStatus.daysRemaining > 0 || subscriptionStatus.isExpired || subscriptionStatus.isInGracePeriod) {
        console.log('[SubscriptionManager] Status changed:', JSON.stringify({
          daysRemaining: subscriptionStatus.daysRemaining,
          isInGracePeriod: subscriptionStatus.isInGracePeriod,
          isExpired: subscriptionStatus.isExpired,
          shouldShow: subscriptionStatus.isInGracePeriod || subscriptionStatus.daysRemaining <= 30 || subscriptionStatus.isExpired
        }));
      }
      setLastLoggedStatus(currentStatus);
    }
  }, [subscriptionStatus.daysRemaining, subscriptionStatus.isInGracePeriod, subscriptionStatus.isExpired, lastLoggedStatus]);

  const upgradeSubscription = useCallback(async (planId: string): Promise<SubscriptionUpgradeResult> => {
    if (!isAuthenticated || !userId) {
      return {
        success: false,
        message: 'User not authenticated',
      };
    }

    setIsUpgrading(true);
    setUpgradeError(null);

    try {
      const client = generateClient<Schema>();
      
      // Call the subscription manager function
      const result = await client.functions.subscriptionManager.invoke({
        planId,
        userId,
      });

      const response = result.payload as SubscriptionUpgradeResult;
      
      if (response.success) {
        // Refresh subscription status
        window.location.reload(); // Simple refresh for now
      } else {
        setUpgradeError(response.message || 'Upgrade failed');
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setUpgradeError(errorMessage);
      
      return {
        success: false,
        message: 'Failed to upgrade subscription',
        error: errorMessage,
      };
    } finally {
      setIsUpgrading(false);
    }
  }, [userId, isAuthenticated]);

  const shouldShowWarning = useCallback(() => {
    // Show warning if:
    // - In grace period
    // - Less than 30 days remaining (gentle notification)
    // - Expired
    return subscriptionStatus.isInGracePeriod || subscriptionStatus.daysRemaining <= 30 || subscriptionStatus.isExpired;
  }, [subscriptionStatus]);

  const shouldShowUpgradeModal = useCallback(() => {
    // Show upgrade modal if:
    // - In grace period
    // - Less than 3 days remaining
    // - Expired
    return subscriptionStatus.isInGracePeriod || subscriptionStatus.daysRemaining <= 3 || subscriptionStatus.isExpired;
  }, [subscriptionStatus]);

  return {
    ...subscriptionStatus,
    upgradeSubscription,
    isUpgrading,
    upgradeError,
    shouldShowWarning,
    shouldShowUpgradeModal,
  };
}
