import { useState } from 'react';
import { updatePassword } from 'aws-amplify/auth';
import { Card, Flex, Heading, Text, PasswordField, Button, Alert } from '@aws-amplify/ui-react';
import { validatePassword } from '../../types/auth';
import { isApiError, AuthError, ErrorContext } from '../../types/errors';
import './PasswordSettings.css';

const PasswordSettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const createErrorContext = (action: string): ErrorContext => ({
    component: 'PasswordSettings',
    action,
    timestamp: new Date().toISOString(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setError(`Password requirements: ${passwordValidation.errors.join(', ')}`);
      return;
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword({
        oldPassword: currentPassword,
        newPassword: newPassword,
      });

      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const errorContext = createErrorContext('changePassword');
      
      let authError: AuthError;
      
      if (isApiError(err)) {
        authError = {
          message: err.message || 'Failed to change password',
          code: 'PASSWORD_MISMATCH',
          details: errorContext,
        };
      } else {
        authError = {
          message: 'An unexpected error occurred while changing password',
          code: 'PASSWORD_MISMATCH',
          details: errorContext,
        };
      }
      
      console.error('Password change error:', err, errorContext);
      setError(authError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="password-settings">
      <Card>
        <Flex direction="column" gap="large">
          <Heading level={2}>Change Password</Heading>
          
          {error && (
            <Alert variation="error" isDismissible>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variation="success" isDismissible>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="medium">
              <PasswordField
                label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                isRequired
                autoComplete="current-password"
              />

              <PasswordField
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                isRequired
                autoComplete="new-password"
              />

              <PasswordField
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                isRequired
                autoComplete="new-password"
              />

              <Button
                type="submit"
                variation="primary"
                isLoading={isLoading}
                loadingText="Changing password..."
              >
                Change Password
              </Button>
            </Flex>
          </form>

          <Text fontSize="small" color="font.secondary">
            Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.
          </Text>
        </Flex>
      </Card>
    </div>
  );
};

export default PasswordSettings; 