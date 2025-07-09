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
import './Referral.css';

const Referral: React.FC = () => {
  const { tokens } = useTheme();
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
      setShareSuccess('Referral link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => setShareSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShareWhatsApp = async () => {
    try {
      await shareReferralLink('whatsapp');
      setShareSuccess('Opening WhatsApp...');
      setTimeout(() => setShareSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to share via WhatsApp:', err);
    }
  };

  const handleShareEmail = async () => {
    try {
      await shareReferralLink('email');
      setShareSuccess('Opening email client...');
      setTimeout(() => setShareSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to share via email:', err);
    }
  };



  if (isLoading) {
    return (
      <Card className="referral-card">
        <Flex direction="column" alignItems="center" gap={tokens.space.medium}>
          <Text>Loading referral information...</Text>
        </Flex>
      </Card>
    );
  }

  return (
    <Card className="referral-card">
      <Flex direction="column" gap={tokens.space.large}>
        <View>
          <Heading level={4} className="referral-title">
            🎁 Invite Friends & Earn Free Months
          </Heading>
          <Text className="referral-subtitle">
            Share your referral code with friends and get 3 additional months of free access for each successful referral!
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
            <Heading level={5}>Your Referral Code</Heading>
            <Flex alignItems="center" gap={tokens.space.small}>
              <Badge variation="info" size="large" className="referral-code-badge">
                {referralCode || 'Loading...'}
              </Badge>
              <Button
                size="small"
                variation="link"
                onClick={handleCopyLink}
                disabled={copied}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </Flex>
            <Text fontSize="small" color="font.secondary">
              Share this code with friends to earn free months
            </Text>
          </Flex>
        </Card>

        {/* Share Options */}
        <Card className="share-options-section">
          <Heading level={5} marginBottom={tokens.space.small}>
            Share Your Referral Link
          </Heading>
          <Flex gap={tokens.space.small} wrap="wrap">
            <Button
              variation="primary"
              onClick={handleShareWhatsApp}
              className="share-button whatsapp"
            >
              📱 WhatsApp
            </Button>
            <Button
              variation="primary"
              onClick={handleShareEmail}
              className="share-button email"
            >
              📧 Email
            </Button>
            <Button
              onClick={handleCopyLink}
              disabled={copied}
              className="share-button copy"
            >
              📋 Copy Link
            </Button>
          </Flex>
        </Card>

        {/* Referral Statistics */}
        <Card className="stats-section">
          <Heading level={5} marginBottom={tokens.space.medium}>
            Your Referral Stats
          </Heading>
          <Flex gap={tokens.space.large} wrap="wrap">
            <View className="stat-item">
              <Text fontSize="large" fontWeight="bold" color="font.primary">
                {referralStats.successfulReferrals}
              </Text>
              <Text fontSize="small" color="font.secondary">
                Successful Referrals
              </Text>
            </View>
            <View className="stat-item">
              <Text fontSize="large" fontWeight="bold" color="font.primary">
                {referralStats.earnedMonths}
              </Text>
              <Text fontSize="small" color="font.secondary">
                Months Earned
              </Text>
            </View>
            <View className="stat-item">
              <Text fontSize="large" fontWeight="bold" color="font.primary">
                {referralStats.totalReferrals}
              </Text>
              <Text fontSize="small" color="font.secondary">
                Total Referrals
              </Text>
            </View>
          </Flex>
        </Card>

        {/* How It Works */}
        <Card className="how-it-works-section">
          <Heading level={5} marginBottom={tokens.space.medium}>
            How It Works
          </Heading>
          <Flex direction="column" gap={tokens.space.small}>
            <Flex gap={tokens.space.small} alignItems="flex-start">
              <Badge variation="success" size="small">1</Badge>
              <Text>Share your referral code with friends via WhatsApp, email, or copy the link</Text>
            </Flex>
            <Flex gap={tokens.space.small} alignItems="flex-start">
              <Badge variation="success" size="small">2</Badge>
              <Text>When they sign up using your code, they get 3 months of free access</Text>
            </Flex>
            <Flex gap={tokens.space.small} alignItems="flex-start">
              <Badge variation="success" size="small">3</Badge>
              <Text>You earn 3 additional months of free access for each successful referral</Text>
            </Flex>
            <Flex gap={tokens.space.small} alignItems="flex-start">
              <Badge variation="success" size="small">4</Badge>
              <Text>Track your progress and earnings in the stats above</Text>
            </Flex>
          </Flex>
        </Card>

        <Divider />

        {/* Refresh Button */}
        <Button
          onClick={refreshData}
          isLoading={isLoading}
          loadingText="Refreshing..."
        >
          Refresh Stats
        </Button>
      </Flex>
    </Card>
  );
};

export default Referral; 