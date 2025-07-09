import { useNavigate } from 'react-router-dom';
import {
  Flex,
  Heading,
  View,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './ReferralSettings.css';
import Referral from '../../components/Referral/Referral';

const ReferralSettings = () => {
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
        <button
          onClick={handleBack}
          className="back-button"
        >
          ← Back to Settings
        </button>
      </Flex>

      <View className="referral-content">
        <View className="content-header">
          <View className="content-icon">🎁</View>
          <Heading level={2} className="content-title">
            Invite Friends
          </Heading>
          <View className="content-subtitle">
            Share your referral code and earn free months for each successful referral
          </View>
        </View>

        <Referral />
      </View>
    </Flex>
  );
};

export default ReferralSettings; 