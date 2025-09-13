import React from 'react';
import { 
  Alert, 
  Flex, 
  Text, 
  Button
} from '@aws-amplify/ui-react';
import { useTheme } from '@aws-amplify/ui-react';
import { useTranslation } from '../../i18n';
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
  const { t } = useTranslation();

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
            {t('gracePeriod.title')}
          </Text>
          <Text fontSize="small">
            {t('gracePeriod.message').replace('{days}', gracePeriodDaysRemaining.toString())}
          </Text>
        </Flex>
        
        <Button
          variation="primary"
          size="small"
          onClick={onActNow}
          className="act-now-button"
        >
          {t('gracePeriod.actNow')}
        </Button>
      </Flex>
    </Alert>
  );
};

