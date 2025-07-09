import { useState } from 'react';
import { updatePassword } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Flex,
  Heading,
  PasswordField,
  View,
  Alert,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './PasswordSettings.css';

const PasswordSettings = () => {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error' | null;
    text: string;
  }>({
    type: null,
    text: '',
  });

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedbackMessage({ type: null, text: '' });

    try {
      await updatePassword({ oldPassword, newPassword });
      setFeedbackMessage({
        type: 'success',
        text: 'Password changed successfully.',
      });
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'An error occurred.',
      });
    }
  };

  const handleBack = () => {
    navigate('/settings');
  };

  return (
    <Flex
      className="password-settings-box"
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

      <Card className="password-card">
        <Flex direction="column" gap="1rem"> 
          <View className="card-header">
            <View className="card-icon">🔐</View>
            <Heading level={2} className="card-title">
              Change Password
            </Heading>
            <View className="card-subtitle">
              Update your account password to keep your account secure
            </View>
          </View>

          <form onSubmit={handleChangePassword}>
            <Flex direction="column" gap="1rem">
              <PasswordField
                label="Current Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                autoComplete="current-password"
                isRequired
              />
              <PasswordField
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                isRequired
              />
              <Button type="submit" variation="primary" className="submit-button">
                Update Password
              </Button>

              {feedbackMessage.type && feedbackMessage.text && (
                <Alert
                  variation={feedbackMessage.type}
                  isDismissible
                  hasIcon
                >
                  {feedbackMessage.text}
                </Alert>
              )}
            </Flex>
          </form>
        </Flex>
      </Card>
    </Flex>
  );
};

export default PasswordSettings; 