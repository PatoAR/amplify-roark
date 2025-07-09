import { deleteUser } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Flex,
  Heading,
  View,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './DeleteAccountSettings.css';

const DeleteAccountSettings = () => {
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure? Deleting your account cannot be undone.')) {
      try {
        await deleteUser();
        alert('Account deleted successfully.');
        window.location.href = '/';
      } catch (err: any) {
        alert(`Error: ${err.message}`);
        window.location.href = '/';
      }
    }
  };

  const handleBack = () => {
    navigate('/settings');
  };

  return (
    <Flex
      className="delete-account-settings-box"
      direction="column"
      gap="1rem"
    >
      <Flex alignItems="center" gap="1rem" className="page-header">
        <Button
          variation="link"
          onClick={handleBack}
          className="back-button"
        >
          ← Back to Settings
        </Button>
      </Flex>

      <Card className="delete-account-card">
        <Flex direction="column" gap="1rem">
          <View className="card-header">
            <View className="card-icon">🗑️</View>
            <Heading level={2} className="card-title">
              Delete Account
            </Heading>
            <View className="card-subtitle">
              This action cannot be undone. All your data will be permanently deleted.
            </View>
          </View>

          <View className="warning-section">
            <View className="warning-icon">⚠️</View>
            <Heading level={4} className="warning-title">
              Warning
            </Heading>
            <View className="warning-text">
              <p>Once you delete your account:</p>
              <ul>
                <li>All your data will be permanently removed</li>
                <li>Your referral codes will be invalidated</li>
                <li>You will lose access to all services</li>
                <li>This action cannot be reversed</li>
              </ul>
            </View>
          </View>

          <View className="action-section">
            <Button 
              variation="destructive" 
              onClick={handleDeleteAccount}
              className="delete-button"
            >
              Delete My Account
            </Button>
          </View>
        </Flex>
      </Card>
    </Flex>
  );
};

export default DeleteAccountSettings; 