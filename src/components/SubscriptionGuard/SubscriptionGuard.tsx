import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSubscriptionManager } from '../../hooks/useSubscriptionManager';
import { SubscriptionUpgradeModal } from '../SubscriptionUpgradeModal';
import { isSubscriptionUpgradeEnabled } from '../../config/features';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requireFullAccess?: boolean;
  fallbackPath?: string;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  children,
  requireFullAccess = false,
  fallbackPath = '/referral'
}) => {
  const {
    canAccessContent,
    canCreateContent,
    isExpired,
    isInGracePeriod,
    shouldShowUpgradeModal,
    upgradeSubscription,
    daysRemaining
  } = useSubscriptionManager();

  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);

  // Check if user needs to upgrade
  React.useEffect(() => {
    if (shouldShowUpgradeModal() && !showUpgradeModal) {
      setShowUpgradeModal(true);
    }
  }, [shouldShowUpgradeModal, showUpgradeModal]);

  const handleUpgrade = async (planId: string) => {
    const result = await upgradeSubscription(planId);
    if (result.success) {
      setShowUpgradeModal(false);
    }
  };

  // If user is completely expired and can't access content
  if (isExpired && !canAccessContent) {
    return <Navigate to={fallbackPath} replace />;
  }

  // If user needs full access but only has limited access
  if (requireFullAccess && !canCreateContent) {
    return (
      <>
        <Navigate to={fallbackPath} replace />
        {isSubscriptionUpgradeEnabled() && (
          <SubscriptionUpgradeModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
            onUpgrade={handleUpgrade}
            currentDaysRemaining={daysRemaining}
            isInGracePeriod={isInGracePeriod}
          />
        )}
      </>
    );
  }

  return (
    <>
      {children}
      {isSubscriptionUpgradeEnabled() && (
        <SubscriptionUpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleUpgrade}
          currentDaysRemaining={daysRemaining}
          isInGracePeriod={isInGracePeriod}
        />
      )}
    </>
  );
};
