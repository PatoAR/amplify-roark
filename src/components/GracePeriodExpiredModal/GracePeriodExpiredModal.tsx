import React from 'react';
import { 
  Card, 
  Flex, 
  Text, 
  Heading,
  Alert,
  Badge,
  Divider,
  Button
} from '@aws-amplify/ui-react';
import { useTheme } from '@aws-amplify/ui-react';
import { useSubscriptionManager } from '../../hooks/useSubscriptionManager';
import { SubscriptionUpgradeModal } from '../SubscriptionUpgradeModal';
import { useReferral } from '../../hooks/useReferral';
import { useTranslation } from '../../i18n';
import { isSubscriptionUpgradeEnabled } from '../../config/features';
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
  
  // Only use subscription manager if upgrades are enabled
  const subscriptionManager = isSubscriptionUpgradeEnabled() ? useSubscriptionManager() : null;
  const upgradeError = subscriptionManager?.upgradeError;

  const {
    shareReferralLink,
    isLoading: isReferralLoading,
    error: referralError,
  } = useReferral();

  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [shareSuccess, setShareSuccess] = React.useState<string>('');

  const handleCopyLink = async () => {
    try {
      await shareReferralLink('copy');
      setCopied(true);
      setShareSuccess(t('referral.linkCopied'));
      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => setShareSuccess(''), 3000);
    } catch (err) {
      console.error(t('referral.errorCopyLink'), err);
    }
  };

  const handleShareWhatsApp = async () => {
    try {
      await shareReferralLink('whatsapp');
      setShareSuccess(t('referral.openingWhatsApp'));
      setTimeout(() => setShareSuccess(''), 3000);
    } catch (err) {
      console.error(t('referral.errorWhatsApp'), err);
    }
  };

  const handleShareEmail = async () => {
    try {
      await shareReferralLink('email');
      setShareSuccess(t('referral.openingEmail'));
      setTimeout(() => setShareSuccess(''), 3000);
    } catch (err) {
      console.error(t('referral.errorEmail'), err);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (!subscriptionManager?.upgradeSubscription) {
      console.warn('Subscription upgrades are disabled');
      return;
    }
    
    const result = await subscriptionManager.upgradeSubscription(planId);
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

            {/* Referral Error Display */}
            {referralError && (
              <Alert variation="error" isDismissible>
                {referralError}
              </Alert>
            )}

            {/* Share Success Display */}
            {shareSuccess && (
              <Alert variation="success" isDismissible>
                {shareSuccess}
              </Alert>
            )}

            {/* Options */}
            <Flex direction="column" gap={tokens.space.medium}>
              {/* Invite Friends Option */}
              <Card className="action-option-card">
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
                  
                  {/* Referral Action Buttons */}
                  <Flex gap={tokens.space.small} marginTop={tokens.space.small} wrap="wrap">
                    <Button
                      variation="primary"
                      onClick={handleShareWhatsApp}
                      disabled={isReferralLoading}
                      size="small"
                      className="referral-action-button whatsapp"
                    >
                      {t('referral.whatsapp')}
                    </Button>
                    <Button
                      variation="primary"
                      onClick={handleShareEmail}
                      disabled={isReferralLoading}
                      size="small"
                      className="referral-action-button email"
                    >
                      {t('referral.email')}
                    </Button>
                    <Button
                      onClick={handleCopyLink}
                      disabled={copied || isReferralLoading}
                      size="small"
                      className="referral-action-button copy"
                    >
                      {copied ? t('referral.copied') : t('referral.copyLink')}
                    </Button>
                  </Flex>
                </Flex>
              </Card>

              {/* Upgrade Option - Only show if subscriptions are enabled */}
              {isSubscriptionUpgradeEnabled() && (
                <>
                  <Divider />

                  <Card className="action-option-card clickable" onClick={() => setShowUpgradeModal(true)}>
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
                </>
              )}
            </Flex>

            {/* Footer */}
            <Flex direction="column" gap={tokens.space.small}>
              <Text fontSize="small" color="font.secondary" textAlign="center">
                <span dangerouslySetInnerHTML={{ __html: t('graceExpired.needHelp') }} />
              </Text>
            </Flex>
          </Flex>
        </Card>
      </div>

      {/* Upgrade Modal - Only show if subscriptions are enabled */}
      {isSubscriptionUpgradeEnabled() && (
        <SubscriptionUpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleUpgrade}
          currentDaysRemaining={0}
          isInGracePeriod={false}
        />
      )}
    </>
  );
};

