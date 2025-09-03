import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from 'aws-amplify/auth';
import { Card, Flex, Heading, Text, PasswordField, Button, Alert } from '@aws-amplify/ui-react';
import { validatePassword } from '../../types/auth';
import { isApiError, AuthError, ErrorContext } from '../../types/errors';
import { useTranslation } from '../../i18n';
import './PasswordSettings.css';

const PasswordSettings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const createErrorContext = (action: string): ErrorContext => ({
    component: 'PasswordSettings',
    action,
    timestamp: new Date().toISOString(),
  });

  const handleBack = () => {
    navigate('/settings');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setError(`${t('password.requirements')} ${passwordValidation.errors.join(', ')}`);
      return;
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      setError(t('password.passwordsDontMatch'));
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword({
        oldPassword: currentPassword,
        newPassword: newPassword,
      });

      // Redirect to settings page with success message
      navigate('/settings?success=password-changed');
    } catch (err: unknown) {
      const errorContext = createErrorContext('changePassword');
      
      let authError: AuthError;
      
      if (isApiError(err)) {
        authError = {
          message: err.message || t('password.failedToChange'),
          code: 'PASSWORD_MISMATCH',
          details: errorContext,
        };
      } else {
        authError = {
          message: t('password.unexpectedError'),
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
            <Heading level={2}>{t('password.title')}</Heading>
            
            {error && (
              <Alert variation="error" isDismissible>
                {error}
              </Alert>
            )}


            <form onSubmit={handleSubmit}>
              <Flex direction="column" gap="medium">
                <PasswordField
                  label={t('password.currentPassword')}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t('password.enterCurrentPassword')}
                  isRequired
                  autoComplete="current-password"
                />

                <PasswordField
                  label={t('password.newPassword')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('password.enterNewPassword')}
                  isRequired
                  autoComplete="new-password"
                />

                <PasswordField
                  label={t('password.confirmNewPassword')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('password.confirmNewPasswordPlaceholder')}
                  isRequired
                  autoComplete="new-password"
                />

                <Button
                  type="submit"
                  variation="primary"
                  isLoading={isLoading}
                  loadingText={t('password.changing')}
                >
                  {t('password.updatePassword')}
                </Button>
              </Flex>
            </form>

            <Text fontSize="small" color="font.secondary">
              {t('password.requirementsText')}
            </Text>
          </Flex>
        </Card>
      </Flex>
    </div>
  );
};

export default PasswordSettings; 