import { useState } from 'react';
import { deleteUser, updatePassword } from 'aws-amplify/auth';
import {
  Button,
  Card,
  Flex,
  Heading,
  PasswordField,
  View,
  useTheme,
  Alert,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './UserSettings.css';
import Referral from '../../components/Referral';

const UserSettings = () => {
  const { tokens } = useTheme();
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

  const [activeTab, setActiveTab] = useState<'account' | 'referral'>('account');

  return (
    <Flex
      className="settings-box"
      direction="column"
      gap="1rem"
    >
      {/* Tab Navigation */}
      <Flex gap="0" className="settings-tabs">
        <Button
          variation={activeTab === 'account' ? 'primary' : undefined}
          onClick={() => setActiveTab('account')}
          className="tab-button"
        >
          Account Settings
        </Button>
        <Button
          variation={activeTab === 'referral' ? 'primary' : undefined}
          onClick={() => setActiveTab('referral')}
          className="tab-button"
        >
          🎁 Invite Friends
        </Button>
      </Flex>

      {/* Account Settings Tab */}
      {activeTab === 'account' && (
        <Flex direction="column" gap="1rem">
          <Card className="password-card">
            <Heading level={4} className="password-title">
              Change Password
            </Heading>
            <form onSubmit={handleChangePassword}>
              <Flex direction="column" gap={tokens.space.small}>
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
                <Button type="submit" variation="primary">
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
          </Card>

          <Card className="danger-zone-card">
            <Heading level={4} className="danger-title">
              Danger Zone
            </Heading>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              marginTop={tokens.space.small}
            >
              <View>
                <p className="danger-subtitle">Delete this account</p>
                <p className="danger-text">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
              </View>
              <Button variation="destructive" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </Flex>
          </Card>
        </Flex>
      )}

      {/* Referral Tab */}
      {activeTab === 'referral' && (
        <Referral />
      )}
    </Flex>
  );
};

export default UserSettings;
