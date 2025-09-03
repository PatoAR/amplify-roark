import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteUser, getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../../../amplify/data/resource';
import { Card, Flex, Heading, Text, Button, Alert } from '@aws-amplify/ui-react';
import { isApiError, AuthError, ErrorContext } from '../../types/errors';
import { useTranslation } from '../../i18n';
import './DeleteAccountSettings.css';

const DeleteAccountSettings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const createErrorContext = (action: string): ErrorContext => ({
    component: 'DeleteAccountSettings',
    action,
    timestamp: new Date().toISOString(),
  });

  const handleBack = () => {
    navigate('/settings');
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setIsLoading(true);

    try {
      // Get current user info before deletion
      const currentUser = await getCurrentUser();
      const client = generateClient<Schema>();
      
      // Record the deleted email to prevent recreation
      try {
        await client.models.DeletedUserEmail.create({
          email: currentUser.username, // Email is stored as username
          deletedAt: new Date().toISOString(),
          originalUserId: currentUser.userId,
          subscriptionStatus: 'deleted',
          deletionReason: 'User initiated deletion'
        });
      } catch (recordError) {
        console.warn('Failed to record deleted email:', recordError);
        // Don't fail the deletion if recording fails
      }

      // Delete the user account
      await deleteUser();
      setSuccess(t('deleteAccount.accountDeleted'));
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err: unknown) {
      const errorContext = createErrorContext('deleteAccount');
      
      let authError: AuthError;
      
      if (isApiError(err)) {
        authError = {
          message: err.message || t('deleteAccount.failedToDelete'),
          code: 'INVALID_CREDENTIALS',
          details: errorContext,
        };
      } else {
        authError = {
          message: t('deleteAccount.unexpectedError'),
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
      <Flex
        className="settings-box"
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

        <Card>
          <Flex direction="column" gap="large">
            <Heading level={2}>{t('deleteAccount.title')}</Heading>
            
            <Alert variation="warning" isDismissible>
              <Text>
                <strong>{t('common.confirm')}:</strong> {t('deleteAccount.warning')}
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
                <Button
                  type="submit"
                  variation="destructive"
                  isLoading={isLoading}
                  loadingText={t('deleteAccount.deleting')}
                >
                  {t('deleteAccount.confirmDelete')}
                </Button>
              </Flex>
            </form>

            <Text fontSize="small" color="font.secondary">
              {t('deleteAccount.loseAccess')}
            </Text>
          </Flex>
        </Card>
      </Flex>
    </div>
  );
};

export default DeleteAccountSettings; 