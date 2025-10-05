import React, { useState } from 'react';
import {
  Card,
  Heading,
  Text,
  Button,
  Flex,
  View,
  Alert,
  Badge,
  useTheme,
} from '@aws-amplify/ui-react';
import { useReferral } from '../../hooks/useReferral';
import { useSubscriptionManager } from '../../hooks/useSubscriptionManager';
import { SubscriptionUpgradeModal } from '../SubscriptionUpgradeModal';
import { useTranslation } from '../../i18n';
import { isSubscriptionButtonEnabled } from '../../config/features';
import './Referral.css';

const Referral: React.FC = () => {
  const { tokens } = useTheme();
  const { t } = useTranslation();
  const {
    referralStats,
    isLoading,
    error,
    shareReferralLink,
    refreshData,
  } = useReferral();
  
  const {
    daysRemaining,
    isInGracePeriod,
    gracePeriodDaysRemaining,
    shouldShowWarning,
    shouldShowUpgradeModal,
    upgradeSubscription,
    isUpgrading,
    upgradeError,
  } = useSubscriptionManager();

  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string>('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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

  const handleUpgradeClick = () => {
    setShowUpgradeModal(true);
  };

  const handleUpgrade = async (planId: string) => {
    const result = await upgradeSubscription(planId);
    if (result.success) {
      setShowUpgradeModal(false);
      // Show success message
      setShareSuccess(t('referral.subscriptionUpgraded'));
      setTimeout(() => setShareSuccess(''), 5000);
    }
  };

  if (isLoading) {
    return (
      <Card className="referral-card">
        <Flex direction="column" alignItems="center" gap={tokens.space.medium}>
          <Text>{t('referral.loading')}</Text>
        </Flex>
      </Card>
    );
  }

  return (
    <>

      {/* Upgrade Modal - Only show if subscription buttons are enabled */}
      {isSubscriptionButtonEnabled() && (
        <SubscriptionUpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleUpgrade}
          currentDaysRemaining={daysRemaining}
          isInGracePeriod={isInGracePeriod}
        />
      )}

      <Card className="referral-card">
        <Flex direction="column" gap={tokens.space.large}>
          {/* Free Access Info Card */}
          <Card className="free-access-info">
            <Flex direction="column" gap={tokens.space.small}>
              <Heading level={5} marginBottom={tokens.space.medium}>
                {t('referral.freeAccessStatus')}
              </Heading>
              <Flex justifyContent="center" gap={tokens.space.large} wrap="wrap" alignItems="center">
                <View className={`days-remaining ${(daysRemaining || 0) > 30 ? 'high' : 'low'}`}>
                  <Text fontSize="large" fontWeight="bold" color="font.primary">
                    {isInGracePeriod ? gracePeriodDaysRemaining : daysRemaining || 0}
                  </Text>
                  <Text fontSize="small" color="font.secondary">
                    {isInGracePeriod ? t('referral.gracePeriodDays') : t('referral.daysRemaining')}
                  </Text>
                </View>
                <View className="expiration-info">
                  <Text fontSize="medium" fontWeight="semibold" color="font.primary">
                    {isInGracePeriod ? t('referral.gracePeriodUntil') : t('referral.freeAccessUntil')}
                  </Text>
                  <Text fontSize="medium" fontWeight="bold" color="font.primary">
                    {new Date(Date.now() + (isInGracePeriod ? gracePeriodDaysRemaining : daysRemaining || 0) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </Text>
                </View>
                {/* Upgrade Button - Only show if subscription buttons are enabled */}
                {isSubscriptionButtonEnabled() && (shouldShowWarning() || shouldShowUpgradeModal()) && (
                  <Button
                    variation="primary"
                    onClick={handleUpgradeClick}
                    isLoading={isUpgrading}
                    loadingText={t('common.processing')}
                    size="small"
                  >
                    {t('referral.upgradeNow')}
                  </Button>
                )}
              </Flex>
            </Flex>
          </Card>

        <View>
          <Heading level={4} className="referral-title">
            {t('referral.title')}
          </Heading>
          <Text fontSize="medium" color="font.secondary" marginTop={tokens.space.small} textAlign="center">
            {t('referral.subtitle')}
          </Text>
        </View>

        {error && (
          <Alert variation="error" isDismissible>
            {error}
          </Alert>
        )}

        {isSubscriptionButtonEnabled() && upgradeError && (
          <Alert variation="error" isDismissible>
            {upgradeError}
          </Alert>
        )}

        {shareSuccess && (
          <Alert variation="success" isDismissible>
            {shareSuccess}
          </Alert>
        )}

        {/* Share Options */}
        <Card className="share-options-section">
          <Heading level={5} marginBottom={tokens.space.medium}>
            {t('referral.shareTitle')}
          </Heading>
          <Flex gap={tokens.space.small} wrap="wrap">
            <Button
              variation="primary"
              onClick={handleShareWhatsApp}
              size="small"
              className="referral-action-button whatsapp"
            >
              {t('referral.whatsapp')}
            </Button>
            <Button
              variation="primary"
              onClick={handleShareEmail}
              size="small"
              className="referral-action-button email"
            >
              {t('referral.email')}
            </Button>
            <Button
              onClick={handleCopyLink}
              disabled={copied}
              size="small"
              className="referral-action-button copy"
            >
              {t('referral.copyLink')}
            </Button>
          </Flex>
        </Card>

        {/* How It Works - Moved up */}
        <Card className="how-it-works-section">
          <Heading level={5} marginBottom={tokens.space.medium}>
            {t('referral.howItWorks')}
          </Heading>
          <Flex direction="column" gap={tokens.space.small}>
            <Flex gap={tokens.space.small} alignItems="flex-start">
              <Badge variation="success" size="small">1</Badge>
              <Text>{t('referral.step1')}</Text>
            </Flex>
            <Flex gap={tokens.space.small} alignItems="flex-start">
              <Badge variation="success" size="small">2</Badge>
              <Text>{t('referral.step2')}</Text>
            </Flex>
            <Flex gap={tokens.space.small} alignItems="flex-start">
              <Badge variation="success" size="small">3</Badge>
              <Text>{t('referral.step3')}</Text>
            </Flex>
            <Flex gap={tokens.space.small} alignItems="flex-start">
              <Badge variation="success" size="small">4</Badge>
              <Text>{t('referral.step4')}</Text>
            </Flex>
          </Flex>
        </Card>


        {/* Referral Statistics */}
        <Card className="stats-section">
          <Flex justifyContent="space-between" alignItems="center" marginBottom={tokens.space.medium}>
            <Heading level={5}>
              {t('referral.statsTitle')}
            </Heading>
            <Button
              size="small"
              onClick={refreshData}
              isLoading={isLoading}
              loadingText={t('referral.refreshing')}
              className="refresh-pill"
            >
              {t('referral.refreshStats')}
            </Button>
          </Flex>
          <Flex justifyContent="center" gap={tokens.space.medium} wrap="wrap">
            <View className="stat-pill">
              <Text fontSize="small" color="font.secondary">
                {t('referral.successfulReferrals')}
              </Text>
              <Text fontSize="large" fontWeight="bold" color="font.primary">
                {referralStats.successfulReferrals}
              </Text>
            </View>
            <View className="stat-pill">
              <Text fontSize="small" color="font.secondary">
                {t('referral.monthsEarned')}
              </Text>
              <Text fontSize="large" fontWeight="bold" color="font.primary">
                {referralStats.earnedMonths}
              </Text>
            </View>
          </Flex>
        </Card>
      </Flex>
    </Card>
    </>
  );
};

export default Referral; 