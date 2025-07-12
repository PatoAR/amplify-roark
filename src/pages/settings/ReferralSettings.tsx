import { useNavigate } from 'react-router-dom';
import {
  Button,
  Flex,
  View,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useTranslation } from '../../i18n';
import './ReferralSettings.css';
import Referral from '../../components/Referral/Referral';

const ReferralSettings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/settings');
  };

  return (
    <Flex
      className="referral-settings-box"
      direction="column"
      gap="1rem"
    >
      <Flex alignItems="center" gap="1rem" className="page-header">
        <Button
          variation="link"
          onClick={handleBack}
          className="back-button"
        >
          {t('settings.backToSettings')}
        </Button>
      </Flex>
      <View className="referral-content">
        <Referral />
      </View>
    </Flex>
  );
};

export default ReferralSettings; 