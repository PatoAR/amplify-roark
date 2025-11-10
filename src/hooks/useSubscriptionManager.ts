import React, { useState, useCallback } from 'react';
import { useSession } from '../context/SessionContext';
import { useSubscriptionStatus } from './useSubscriptionStatus';
import { isSubscriptionUpgradeEnabled } from '../config/features';

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
      setLastLoggedStatus(currentStatus);
    }
  }, [subscriptionStatus.daysRemaining, subscriptionStatus.isInGracePeriod, subscriptionStatus.isExpired, lastLoggedStatus]);

  const upgradeSubscription = useCallback(async (planId: string): Promise<SubscriptionUpgradeResult> => {
    // If subscription upgrades are disabled, return a message indicating this
    if (!isSubscriptionUpgradeEnabled()) {
      return {
        success: false,
        message: 'Subscription upgrades are currently disabled. Please use referrals to extend your access.',
      };
    }

    if (!isAuthenticated || !userId) {
      return {
        success: false,
        message: 'User not authenticated',
      };
    }

    setIsUpgrading(true);
    setUpgradeError(null);

    try {
      // Call the subscription manager function via HTTP
      const response = await fetch('/api/subscription-manager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as SubscriptionUpgradeResult;
      
      if (result.success) {
        // Refresh subscription status
        window.location.reload(); // Simple refresh for now
      } else {
        setUpgradeError(result.message || 'Upgrade failed');
      }

      return result;
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
    // If subscription upgrades are disabled, never show upgrade modal
    if (!isSubscriptionUpgradeEnabled()) {
      return false;
    }
    
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
