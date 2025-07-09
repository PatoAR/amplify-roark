import { useState } from 'react';
import { deleteUser } from 'aws-amplify/auth';
import { Card, Flex, Heading, Text, PasswordField, Button, Alert } from '@aws-amplify/ui-react';
import { isApiError, AuthError, ErrorContext } from '../../types/errors';
import './DeleteAccountSettings.css';

const DeleteAccountSettings = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const createErrorContext = (action: string): ErrorContext => ({
    component: 'DeleteAccountSettings',
    action,
    timestamp: new Date().toISOString(),
  });

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password) {
      setError('Please enter your password to confirm account deletion');
      return;
    }

    setIsLoading(true);

    try {
      await deleteUser();
      setSuccess('Account deleted successfully. You will be redirected to the login page.');
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err: unknown) {
      const errorContext = createErrorContext('deleteAccount');
      
      let authError: AuthError;
      
      if (isApiError(err)) {
        authError = {
          message: err.message || 'Failed to delete account',
          code: 'INVALID_CREDENTIALS',
          details: errorContext,
        };
      } else {
        authError = {
          message: 'An unexpected error occurred while deleting account',
          code: 'INVALID_CREDENTIALS',
          details: errorContext,
        };
      }
      
      console.error('Account deletion error:', err, errorContext);
      setError(authError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="delete-account-settings">
      <Card>
        <Flex direction="column" gap="large">
          <Heading level={2}>Delete Account</Heading>
          
          <Alert variation="warning" isDismissible>
            <Text>
              <strong>Warning:</strong> This action cannot be undone. All your data, preferences, and account information will be permanently deleted.
            </Text>
          </Alert>

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

          <form onSubmit={handleDeleteAccount}>
            <Flex direction="column" gap="medium">
              <PasswordField
                label="Confirm Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password to confirm"
                isRequired
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variation="destructive"
                isLoading={isLoading}
                loadingText="Deleting account..."
              >
                Delete Account
              </Button>
            </Flex>
          </form>

          <Text fontSize="small" color="font.secondary">
            By deleting your account, you will lose access to all your personalized news feeds, preferences, and referral benefits.
          </Text>
        </Flex>
      </Card>
    </div>
  );
};

export default DeleteAccountSettings; 