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
    id: 'basic-monthly',
    name: 'Basic',
    price: 9.99,
    period: 'monthly',
    features: [
      'Unlimited access to all content',
      'Full analytics dashboard',
      'Priority support',
      'Mobile app access'
    ]
  },
  {
    id: 'basic-yearly',
    name: 'Basic',
    price: 95.99,
    period: 'yearly',
    features: [
      'Unlimited access to all content',
      'Full analytics dashboard',
      'Priority support',
      'Mobile app access',
      '20% savings'
    ],
    discount: 20
  },
  {
    id: 'pro-monthly',
    name: 'Pro',
    price: 19.99,
    period: 'monthly',
    features: [
      'Everything in Basic',
      'Advanced analytics',
      'Custom reports',
      'API access',
      'Team collaboration tools'
    ],
    popular: true
  },
  {
    id: 'pro-yearly',
    name: 'Pro',
    price: 191.99,
    period: 'yearly',
    features: [
      'Everything in Basic',
      'Advanced analytics',
      'Custom reports',
      'API access',
      'Team collaboration tools',
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
  const [selectedPlan, setSelectedPlan] = useState<string>('pro-monthly');
  const [isProcessing, setIsProcessing] = useState(false);

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
                  {isInGracePeriod ? 'Continue Your Access' : 'Choose Your Access Method'}
                </Heading>
                <Text fontSize="medium" color="font.secondary" textAlign="center">
                  {isInGracePeriod 
                    ? `Your free trial has ended. Keep Perkins free through referrals, or subscribe for unlimited access.`
                    : `You have ${currentDaysRemaining} days remaining. Keep Perkins free through referrals, or subscribe for unlimited access.`
                  }
                </Text>
              </Flex>

              {/* Referral Alternative Alert */}
              <Alert variation="info" isDismissible>
                <Text fontSize="small">
                  🎁 <strong>Keep it Free:</strong> Prefer to keep Perkins free? Invite friends instead and earn 3 months free for each successful referral!
                </Text>
              </Alert>

              {/* Special Offer Alert */}
              <Alert variation="info" isDismissible>
                <Text fontSize="small">
                  🎉 <strong>Limited Time:</strong> Get 50% off your first month with any plan!
                </Text>
              </Alert>

              {/* Plans Grid */}
              <Flex direction="column" gap={tokens.space.medium}>
                <Heading level={4}>Choose Your Plan</Heading>
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
                              <Badge variation="success" size="small">Most Popular</Badge>
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
                              Save {plan.discount}% with annual billing
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
                    loadingText="Processing..."
                    className="upgrade-button"
                  >
                    {isInGracePeriod ? 'Continue Access' : 'Upgrade Now'}
                  </Button>
                  <Button
                    variation="link"
                    onClick={onClose}
                    disabled={isProcessing}
                  >
                    Maybe Later
                  </Button>
                </Flex>
                
                <Text fontSize="small" color="font.secondary" textAlign="center">
                  All plans include a 30-day money-back guarantee. Cancel anytime.
                </Text>
              </Flex>
            </Flex>
          </Card>
        </div>
      )}
    </>
  );
};
