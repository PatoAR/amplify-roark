import React from 'react';
import { 
  Card, 
  Flex, 
  Text, 
  Button, 
  Heading,
  Alert,
  Badge,
  Divider
} from '@aws-amplify/ui-react';
import { useTheme } from '@aws-amplify/ui-react';
import { useSubscriptionManager } from '../../hooks/useSubscriptionManager';
import { SubscriptionUpgradeModal } from '../SubscriptionUpgradeModal';
import './GracePeriodExpiredModal.css';

interface GracePeriodExpiredModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const GracePeriodExpiredModal: React.FC<GracePeriodExpiredModalProps> = ({
  isOpen,
  onClose
}) => {
  const { tokens } = useTheme();
  const {
    upgradeSubscription,
    isUpgrading,
    upgradeError,
  } = useSubscriptionManager();

  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);

  const handleInviteFriends = () => {
    window.location.href = '/settings/referral';
  };

  const handleUpgrade = async (planId: string) => {
    const result = await upgradeSubscription(planId);
    if (result.success) {
      setShowUpgradeModal(false);
      // Refresh the page to update subscription status
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="grace-expired-overlay" onClick={onClose} role="dialog" aria-modal="true">
        <Card
          className="grace-expired-modal-content"
          variation="elevated"
          onClick={(e) => e.stopPropagation()}
        >
          <Flex direction="column" gap={tokens.space.large}>
            {/* Header */}
            <Flex direction="column" gap={tokens.space.small} alignItems="center">
              <Heading level={3} textAlign="center" color="font.error">
                Access Expired
              </Heading>
              <Text fontSize="medium" color="font.secondary" textAlign="center">
                Your grace period has ended. Choose an option below to restore your access.
              </Text>
            </Flex>

            {/* Error Display */}
            {upgradeError && (
              <Alert variation="error" isDismissible>
                {upgradeError}
              </Alert>
            )}

            {/* Options */}
            <Flex direction="column" gap={tokens.space.medium}>
              <Heading level={4}>Choose Your Action</Heading>
              
              {/* Invite Friends Option */}
              <Card className="action-option-card" onClick={handleInviteFriends}>
                <Flex direction="column" gap={tokens.space.small}>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Heading level={5}>Invite Friends</Heading>
                    <Badge variation="success" size="small">Free</Badge>
                  </Flex>
                  <Text fontSize="small" color="font.secondary">
                    Earn free access by inviting friends to join. Each successful referral extends your access.
                  </Text>
                  <Flex gap={tokens.space.xs}>
                    <Text fontSize="small" color="font.success">✓</Text>
                    <Text fontSize="small" color="font.secondary">No cost required</Text>
                  </Flex>
                  <Flex gap={tokens.space.xs}>
                    <Text fontSize="small" color="font.success">✓</Text>
                    <Text fontSize="small" color="font.secondary">Unlimited referrals</Text>
                  </Flex>
                </Flex>
              </Card>

              <Divider />

              {/* Upgrade Option */}
              <Card className="action-option-card" onClick={() => setShowUpgradeModal(true)}>
                <Flex direction="column" gap={tokens.space.small}>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Heading level={5}>Upgrade to Paid</Heading>
                    <Badge variation="info" size="small">Premium</Badge>
                  </Flex>
                  <Text fontSize="small" color="font.secondary">
                    Get unlimited access with our premium subscription plans.
                  </Text>
                  <Flex gap={tokens.space.xs}>
                    <Text fontSize="small" color="font.success">✓</Text>
                    <Text fontSize="small" color="font.secondary">Unlimited access</Text>
                  </Flex>
                  <Flex gap={tokens.space.xs}>
                    <Text fontSize="small" color="font.success">✓</Text>
                    <Text fontSize="small" color="font.secondary">Priority support</Text>
                  </Flex>
                  <Flex gap={tokens.space.xs}>
                    <Text fontSize="small" color="font.success">✓</Text>
                    <Text fontSize="small" color="font.secondary">Advanced features</Text>
                  </Flex>
                </Flex>
              </Card>
            </Flex>

            {/* Footer */}
            <Flex direction="column" gap={tokens.space.small}>
              <Text fontSize="small" color="font.secondary" textAlign="center">
                Need help? Contact our support team for assistance.
              </Text>
              {onClose && (
                <Button
                  variation="link"
                  onClick={onClose}
                  className="close-button"
                >
                  Maybe Later
                </Button>
              )}
            </Flex>
          </Flex>
        </Card>
      </div>

      {/* Upgrade Modal */}
      <SubscriptionUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
        currentDaysRemaining={0}
        isInGracePeriod={false}
      />
    </>
  );
};

