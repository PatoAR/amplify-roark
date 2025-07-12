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
  Divider,
  useTheme,
} from '@aws-amplify/ui-react';
import { useReferral } from '../../hooks/useReferral';
import { useTranslation } from '../../i18n';
import './Referral.css';

const Referral: React.FC = () => {
  const { tokens } = useTheme();
  const { t } = useTranslation();
  const {
    referralCode,
    referralStats,
    isLoading,
    error,
    shareReferralLink,
    refreshData,
  } = useReferral();

  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string>('');

  const handleCopyLink = async () => {
    try {
      await shareReferralLink('copy');
      setCopied(true);
      setShareSuccess(t('referral.linkCopied'));
      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => setShareSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShareWhatsApp = async () => {
    try {
      await shareReferralLink('whatsapp');
      setShareSuccess(t('referral.openingWhatsApp'));
      setTimeout(() => setShareSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to share via WhatsApp:', err);
    }
  };

  const handleShareEmail = async () => {
    try {
      await shareReferralLink('email');
      setShareSuccess(t('referral.openingEmail'));
      setTimeout(() => setShareSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to share via email:', err);
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
    <Card className="referral-card">
      <Flex direction="column" gap={tokens.space.large}>
        <View>
          <Heading level={4} className="referral-title">
            {t('referral.title')}
          </Heading>
          <Text className="referral-subtitle">
            {t('referral.subtitle')}
          </Text>
        </View>

        {error && (
          <Alert variation="error" isDismissible>
            {error}
          </Alert>
        )}

        {shareSuccess && (
          <Alert variation="success" isDismissible>
            {shareSuccess}
          </Alert>
        )}

        {/* Referral Code Section */}
        <Card className="referral-code-section">
          <Flex direction="column" gap={tokens.space.medium}>
            <Heading level={5}>{t('referral.yourCode')}</Heading>
            <Flex alignItems="center" gap={tokens.space.small}>
              <Badge variation="info" size="large" className="referral-code-badge">
                {referralCode || t('common.loading')}
              </Badge>
              <Button
                size="small"
                variation="link"
                onClick={handleCopyLink}
                disabled={copied}
              >
                {copied ? t('referral.copied') : t('referral.copyCode')}
              </Button>
            </Flex>
            <Text fontSize="small" color="font.secondary">
              {t('referral.shareCodeHint')}
            </Text>
          </Flex>
        </Card>

        {/* Share Options */}
        <Card className="share-options-section">
          <Heading level={5} marginBottom={tokens.space.small}>
            {t('referral.shareTitle')}
          </Heading>
          <Flex gap={tokens.space.small} wrap="wrap">
            <Button
              variation="primary"
              onClick={handleShareWhatsApp}
              className="share-button whatsapp"
            >
              {t('referral.whatsapp')}
            </Button>
            <Button
              variation="primary"
              onClick={handleShareEmail}
              className="share-button email"
            >
              {t('referral.email')}
            </Button>
            <Button
              onClick={handleCopyLink}
              disabled={copied}
              className="share-button copy"
            >
              {t('referral.copyLink')}
            </Button>
          </Flex>
        </Card>

        {/* Referral Statistics */}
        <Card className="stats-section">
          <Heading level={5} marginBottom={tokens.space.medium}>
            {t('referral.statsTitle')}
          </Heading>
          <Flex gap={tokens.space.large} wrap="wrap">
            <View className="stat-item">
              <Text fontSize="large" fontWeight="bold" color="font.primary">
                {referralStats.successfulReferrals}
              </Text>
              <Text fontSize="small" color="font.secondary">
                {t('referral.successfulReferrals')}
              </Text>
            </View>
            <View className="stat-item">
              <Text fontSize="large" fontWeight="bold" color="font.primary">
                {referralStats.earnedMonths}
              </Text>
              <Text fontSize="small" color="font.secondary">
                {t('referral.monthsEarned')}
              </Text>
            </View>
            <View className="stat-item">
              <Text fontSize="large" fontWeight="bold" color="font.primary">
                {referralStats.totalReferrals}
              </Text>
              <Text fontSize="small" color="font.secondary">
                {t('referral.totalReferrals')}
              </Text>
            </View>
          </Flex>
        </Card>

        {/* How It Works */}
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

        <Divider />

        {/* Refresh Button */}
        <Button
          onClick={refreshData}
          isLoading={isLoading}
          loadingText={t('referral.refreshing')}
        >
          {t('referral.refreshStats')}
        </Button>
      </Flex>
    </Card>
  );
};

export default Referral; 