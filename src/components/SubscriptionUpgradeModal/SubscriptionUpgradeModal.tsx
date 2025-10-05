import React, { useState } from 'react';
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
import { useTranslation } from '../../i18n';
import { isSubscriptionUpgradeEnabled } from '../../config/features';
import { useReferral } from '../../hooks/useReferral';
import './SubscriptionUpgradeModal.css';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
  discount?: number;
}

interface SubscriptionUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (planId: string) => void;
  currentDaysRemaining: number;
  isInGracePeriod?: boolean;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'perkins-monthly',
    name: 'Perkins',
    price: 0.99,
    period: 'monthly',
    features: [
      'Unlimited access to all content',
      'Full analytics dashboard',
      'Priority support',
      'Mobile app access'
    ]
  },
  {
    id: 'perkins-yearly',
    name: 'Perkins',
    price: 9.50,
    period: 'yearly',
    features: [
      'Unlimited access to all content',
      'Full analytics dashboard',
      'Priority support',
      'Mobile app access',
      '20% savings'
    ],
    popular: true,
    discount: 20
  }
];

export const SubscriptionUpgradeModal: React.FC<SubscriptionUpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  currentDaysRemaining,
  isInGracePeriod = false
}) => {
  const { tokens } = useTheme();
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<string>('perkins-yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string>('');
  
  const {
    shareReferralLink,
    isLoading: isReferralLoading,
    error: referralError,
  } = useReferral();

  // If subscriptions are disabled, show referral-focused content
  if (!isSubscriptionUpgradeEnabled()) {
    return <ReferralFocusedModal 
      isOpen={isOpen}
      onClose={onClose}
      currentDaysRemaining={currentDaysRemaining}
      isInGracePeriod={isInGracePeriod}
      shareReferralLink={shareReferralLink}
      copied={copied}
      setCopied={setCopied}
      shareSuccess={shareSuccess}
      setShareSuccess={setShareSuccess}
      isReferralLoading={isReferralLoading}
      referralError={referralError}
    />;
  }

  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      await onUpgrade(selectedPlan);
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const getPlanPeriod = (period: 'monthly' | 'yearly') => {
    return period === 'monthly' ? '/month' : '/year';
  };

  return (
    <>
      {isOpen && (
        <div className="dialog-overlay" onClick={onClose} role="dialog" aria-modal="true">
          <Card
            className="subscription-upgrade-modal-content"
            variation="elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <Flex direction="column" gap={tokens.space.large}>
              {/* Header */}
              <Flex direction="column" gap={tokens.space.small} alignItems="center">
                <Heading level={3} textAlign="center">
                  {isInGracePeriod ? t('subscription.continueAccess') : t('subscription.chooseAccessMethod')}
                </Heading>
                <Text fontSize="medium" color="font.secondary" textAlign="center">
                  {isInGracePeriod 
                    ? t('subscription.trialEnded')
                    : t('subscription.daysRemaining').replace('{days}', currentDaysRemaining.toString())
                  }
                </Text>
              </Flex>

              {/* Referral Alternative Alert */}
              <Alert variation="info" isDismissible>
                <Text fontSize="small">
                  🎁 <strong>{t('subscription.keepItFree')}</strong> {t('subscription.keepItFreeText')}
                </Text>
              </Alert>


              {/* Plans Grid */}
              <Flex direction="column" gap={tokens.space.medium}>
                <Heading level={4}>{t('subscription.choosePlan')}</Heading>
                <Flex direction="row" gap={tokens.space.medium} wrap="wrap" justifyContent="center">
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <Card 
                      key={plan.id}
                      className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                      onClick={() => setSelectedPlan(plan.id)}
                      style={{ cursor: 'pointer', minWidth: '280px', flex: '1' }}
                    >
                      <Flex direction="column" gap={tokens.space.small}>
                        {/* Plan Header */}
                        <Flex direction="column" gap={tokens.space.xs}>
                          <Flex justifyContent="space-between" alignItems="center">
                            <Heading level={5}>{plan.name}</Heading>
                            {plan.popular && (
                              <Badge variation="success" size="small">{t('subscription.mostPopular')}</Badge>
                            )}
                          </Flex>
                          <Flex alignItems="baseline" gap={tokens.space.xs}>
                            <Text fontSize="xxl" fontWeight="bold" color="font.primary">
                              {formatPrice(plan.price)}
                            </Text>
                            <Text fontSize="medium" color="font.secondary">
                              {getPlanPeriod(plan.period)}
                            </Text>
                          </Flex>
                          {plan.discount && (
                            <Text fontSize="small" color="font.success">
                              {t('subscription.saveWithAnnual').replace('{discount}', plan.discount.toString())}
                            </Text>
                          )}
                        </Flex>

                        <Divider />

                        {/* Features */}
                        <Flex direction="column" gap={tokens.space.xs}>
                          {plan.features.map((feature, index) => (
                            <Flex key={index} alignItems="center" gap={tokens.space.xs}>
                              <Text fontSize="small" color="font.success">✓</Text>
                              <Text fontSize="small" color="font.secondary">
                                {feature}
                              </Text>
                            </Flex>
                          ))}
                        </Flex>
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              </Flex>

              {/* Action Buttons */}
              <Flex direction="column" gap={tokens.space.medium}>
                <Flex gap={tokens.space.medium} justifyContent="center">
                  <Button
                    variation="primary"
                    size="large"
                    onClick={handleUpgrade}
                    isLoading={isProcessing}
                    loadingText={t('subscription.processing')}
                    className="upgrade-button"
                  >
                    {isInGracePeriod ? t('subscription.continueAccess') : t('subscription.upgradeNow')}
                  </Button>
                  <Button
                    variation="link"
                    onClick={onClose}
                    disabled={isProcessing}
                  >
                    {t('subscription.maybeLater')}
                  </Button>
                </Flex>
                
                <Text fontSize="small" color="font.secondary" textAlign="center">
                  {t('subscription.moneyBackGuarantee')}
                </Text>
              </Flex>
            </Flex>
          </Card>
        </div>
      )}
    </>
  );
};

// Referral-focused modal component for when subscriptions are disabled
interface ReferralFocusedModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDaysRemaining: number;
  isInGracePeriod: boolean;
  shareReferralLink: (method: 'copy' | 'whatsapp' | 'email') => Promise<void>;
  copied: boolean;
  setCopied: (copied: boolean) => void;
  shareSuccess: string;
  setShareSuccess: (message: string) => void;
  isReferralLoading: boolean;
  referralError: string | null;
}

const ReferralFocusedModal: React.FC<ReferralFocusedModalProps> = ({
  isOpen,
  onClose,
  currentDaysRemaining,
  isInGracePeriod,
  shareReferralLink,
  copied,
  setCopied,
  shareSuccess,
  setShareSuccess,
  isReferralLoading,
  referralError
}) => {
  const { tokens } = useTheme();
  const { t } = useTranslation();

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

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <Card
        className="subscription-upgrade-modal-content"
        variation="elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <Flex direction="column" gap={tokens.space.large}>
          {/* Header */}
          <Flex direction="column" gap={tokens.space.small} alignItems="center">
            <Heading level={3} textAlign="center">
              {t('referral.extendAccess')}
            </Heading>
            <Text fontSize="medium" color="font.secondary" textAlign="center">
              {isInGracePeriod 
                ? t('referral.trialEndedExtend')
                : t('referral.daysRemainingExtend').replace('{days}', currentDaysRemaining.toString())
              }
            </Text>
          </Flex>

          {/* Referral Info Alert */}
          <Alert variation="info" isDismissible>
            <Text fontSize="small">
              🎁 <strong>{t('referral.keepItFree')}</strong> {t('referral.keepItFreeText')}
            </Text>
          </Alert>

          {/* Error Display */}
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

          {/* Share Options */}
          <Flex direction="column" gap={tokens.space.medium}>
            <Heading level={4}>{t('referral.shareTitle')}</Heading>
            <Flex gap={tokens.space.medium} wrap="wrap" justifyContent="center">
              <Button
                variation="primary"
                onClick={handleShareWhatsApp}
                disabled={isReferralLoading}
                className="share-button whatsapp"
              >
                {t('referral.whatsapp')}
              </Button>
              <Button
                variation="primary"
                onClick={handleShareEmail}
                disabled={isReferralLoading}
                className="share-button email"
              >
                {t('referral.email')}
              </Button>
              <Button
                onClick={handleCopyLink}
                disabled={copied || isReferralLoading}
                className="share-button copy"
              >
                {copied ? t('referral.copied') : t('referral.copyLink')}
              </Button>
            </Flex>
          </Flex>

          {/* How It Works */}
          <Flex direction="column" gap={tokens.space.medium}>
            <Heading level={4}>{t('referral.howItWorks')}</Heading>
            <Flex direction="column" gap={tokens.space.small}>
              <Flex gap={tokens.space.small} alignItems="flex-start">
                <Badge variation="success" size="small">1</Badge>
                <Text fontSize="small">{t('referral.step1')}</Text>
              </Flex>
              <Flex gap={tokens.space.small} alignItems="flex-start">
                <Badge variation="success" size="small">2</Badge>
                <Text fontSize="small">{t('referral.step2')}</Text>
              </Flex>
              <Flex gap={tokens.space.small} alignItems="flex-start">
                <Badge variation="success" size="small">3</Badge>
                <Text fontSize="small">{t('referral.step3')}</Text>
              </Flex>
              <Flex gap={tokens.space.small} alignItems="flex-start">
                <Badge variation="success" size="small">4</Badge>
                <Text fontSize="small">{t('referral.step4')}</Text>
              </Flex>
            </Flex>
          </Flex>

          {/* Action Buttons */}
          <Flex direction="column" gap={tokens.space.medium}>
            <Flex gap={tokens.space.medium} justifyContent="center">
              <Button
                variation="link"
                onClick={onClose}
              >
                {t('referral.close')}
              </Button>
            </Flex>
            
            <Text fontSize="small" color="font.secondary" textAlign="center">
              {t('referral.unlimitedReferrals')}
            </Text>
          </Flex>
        </Flex>
      </Card>
    </div>
  );
};
