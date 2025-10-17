import React from 'react';
import { 
  Alert, 
  Flex, 
  Text
} from '@aws-amplify/ui-react';
import { useTheme } from '@aws-amplify/ui-react';
import { useTranslation } from '../../i18n';
import './InactivityLogoutBanner.css';

interface InactivityLogoutBannerProps {
  onDismiss: () => void;
}

export const InactivityLogoutBanner: React.FC<InactivityLogoutBannerProps> = ({
  onDismiss
}) => {
  const { tokens } = useTheme();
  const { t } = useTranslation();

  return (
    <Alert 
      variation="info" 
      isDismissible={true}
      onDismiss={onDismiss}
      className="inactivity-logout-banner"
    >
      <Flex direction="row" justifyContent="space-between" alignItems="center" wrap="wrap" gap={tokens.space.small}>
        <Flex direction="column" gap={tokens.space.xs} flex="1" minWidth="300px">
          <Text fontSize="medium" fontWeight="semibold">
            {t('inactivity.logoutTitle')}
          </Text>
          <Text fontSize="small">
            {t('inactivity.logoutMessage')}
          </Text>
        </Flex>
      </Flex>
    </Alert>
  );
};
