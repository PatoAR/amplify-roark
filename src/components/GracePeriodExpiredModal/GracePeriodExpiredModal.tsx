import React from 'react';
import { 
  Card, 
  Flex, 
  Text, 
  Heading,
  Alert,
  Badge,
  Divider
} from '@aws-amplify/ui-react';
import { useTheme } from '@aws-amplify/ui-react';
import { useSubscriptionManager } from '../../hooks/useSubscriptionManager';
import { SubscriptionUpgradeModal } from '../SubscriptionUpgradeModal';
import { useTranslation } from '../../i18n';
import './GracePeriodExpiredModal.css';

interface GracePeriodExpiredModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const GracePeriodExpiredModal: React.FC<GracePeriodExpiredModalProps> = ({
  isOpen
}) => {
  const { tokens } = useTheme();
  const { t } = useTranslation();
  const {
    upgradeSubscription,
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
      <div className="grace-expired-overlay" role="dialog" aria-modal="true">
        <Card
          className="grace-expired-modal-content"
          variation="elevated"
          onClick={(e) => e.stopPropagation()}
        >
          <Flex direction="column" gap={tokens.space.large}>
            {/* Header */}
            <Flex direction="column" gap={tokens.space.small} alignItems="center">
              <Heading level={3} textAlign="center" color="font.error">
                {t('graceExpired.title')}
              </Heading>
              <Text fontSize="medium" color="font.secondary" textAlign="center">
                {t('graceExpired.message')}
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
              <Heading level={4}>{t('graceExpired.chooseAction')}</Heading>
              
              {/* Invite Friends Option */}
              <Card className="action-option-card" onClick={handleInviteFriends}>
                <Flex direction="column" gap={tokens.space.small}>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Heading level={5}>{t('graceExpired.inviteFriends')}</Heading>
                    <Badge variation="success" size="small">{t('graceExpired.free')}</Badge>
                  </Flex>
                  <Text fontSize="small" color="font.secondary">
                    {t('graceExpired.inviteFriendsDesc')}
                  </Text>
                  <Flex gap={tokens.space.xs}>
                    <Text fontSize="small" color="font.success">✓</Text>
                    <Text fontSize="small" color="font.secondary">{t('graceExpired.noCost')}</Text>
                  </Flex>
                  <Flex gap={tokens.space.xs}>
                    <Text fontSize="small" color="font.success">✓</Text>
                    <Text fontSize="small" color="font.secondary">{t('graceExpired.unlimitedReferrals')}</Text>
                  </Flex>
                </Flex>
              </Card>

              <Divider />

              {/* Upgrade Option */}
              <Card className="action-option-card" onClick={() => setShowUpgradeModal(true)}>
                <Flex direction="column" gap={tokens.space.small}>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Heading level={5}>{t('graceExpired.upgradeToPaid')}</Heading>
                    <Badge variation="info" size="small">{t('graceExpired.premium')}</Badge>
                  </Flex>
                  <Text fontSize="small" color="font.secondary">
                    {t('graceExpired.upgradeDesc')}
                  </Text>
                  <Flex gap={tokens.space.xs}>
                    <Text fontSize="small" color="font.success">✓</Text>
                    <Text fontSize="small" color="font.secondary">{t('graceExpired.unlimitedAccess')}</Text>
                  </Flex>
                  <Flex gap={tokens.space.xs}>
                    <Text fontSize="small" color="font.success">✓</Text>
                    <Text fontSize="small" color="font.secondary">{t('graceExpired.prioritySupport')}</Text>
                  </Flex>
                  <Flex gap={tokens.space.xs}>
                    <Text fontSize="small" color="font.success">✓</Text>
                    <Text fontSize="small" color="font.secondary">{t('graceExpired.advancedFeatures')}</Text>
                  </Flex>
                </Flex>
              </Card>
            </Flex>

            {/* Footer */}
            <Flex direction="column" gap={tokens.space.small}>
              <Text fontSize="small" color="font.secondary" textAlign="center">
                {t('graceExpired.needHelp')}
              </Text>
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

