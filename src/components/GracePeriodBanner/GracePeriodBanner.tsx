import React from 'react';
import { 
  Alert, 
  Flex, 
  Text, 
  Button
} from '@aws-amplify/ui-react';
import { useTheme } from '@aws-amplify/ui-react';
import './GracePeriodBanner.css';

interface GracePeriodBannerProps {
  gracePeriodDaysRemaining: number;
  onActNow: () => void;
  onDismiss?: () => void;
}

export const GracePeriodBanner: React.FC<GracePeriodBannerProps> = ({
  gracePeriodDaysRemaining,
  onActNow,
  onDismiss
}) => {
  const { tokens } = useTheme();

  return (
    <Alert 
      variation="warning" 
      isDismissible={!!onDismiss}
      onDismiss={onDismiss}
      className="grace-period-banner"
    >
      <Flex direction="row" justifyContent="space-between" alignItems="center" wrap="wrap" gap={tokens.space.small}>
        <Flex direction="column" gap={tokens.space.xs} flex="1" minWidth="300px">
          <Text fontSize="medium" fontWeight="semibold">
            Grace Period Active
          </Text>
          <Text fontSize="small">
            Your earned free days have been used. You have {gracePeriodDaysRemaining} days of limited access remaining. 
            Keep Perkins free by inviting friends, or subscribe for unlimited access.
          </Text>
        </Flex>
        
        <Button
          variation="primary"
          size="small"
          onClick={onActNow}
          className="act-now-button"
        >
          Act Now
        </Button>
      </Flex>
    </Alert>
  );
};

