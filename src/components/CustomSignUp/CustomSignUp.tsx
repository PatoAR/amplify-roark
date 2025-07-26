import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { signUp } from 'aws-amplify/auth';
import { Card, Flex, Heading, Text, TextField, PasswordField, Button, Alert, View, useTheme } from '@aws-amplify/ui-react';
import { useReferral } from '../../hooks/useReferral';
import { UserAttributes, SignUpOptions, validateEmail, validatePassword, validateUserAttributes } from '../../types/auth';
import { isApiError, AuthError, ErrorContext } from '../../types/errors';
import { useTranslation } from '../../i18n';
import './CustomSignUp.css';

interface CustomSignUpProps {
  onSuccess?: () => void;
}

const CustomSignUp: React.FC<CustomSignUpProps> = ({ onSuccess }) => {
  const { tokens } = useTheme();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { validateReferralCode } = useReferral();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const [referralMessage, setReferralMessage] = useState('');

  // Check for referral code in URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      validateReferralCodeFromUrl(refCode);
    }
  }, [searchParams]);

  const validateReferralCodeFromUrl = async (code: string) => {
    try {
      const result = await validateReferralCode(code);
      setReferralValid(result.valid);
      setReferralMessage(result.valid 
        ? t('signup.validReferralCode')
        : t('signup.invalidReferralCode')
      );
    } catch (err) {
      setReferralValid(false);
      setReferralMessage(t('signup.errorValidatingCode'));
    }
  };

  const handleReferralCodeChange = async (value: string) => {
    setReferralCode(value);
    if (value.length >= 3) {
      try {
        const result = await validateReferralCode(value);
        setReferralValid(result.valid);
        setReferralMessage(result.valid 
          ? t('signup.validReferralCode')
          : t('signup.invalidReferralCode')
        );
      } catch (err) {
        setReferralValid(false);
        setReferralMessage(t('signup.errorValidatingCode'));
      }
    } else {
      setReferralValid(null);
      setReferralMessage('');
    }
  };

  const createErrorContext = (action: string): ErrorContext => ({
    component: 'CustomSignUp',
    action,
    timestamp: new Date().toISOString(),
    additionalData: { email, referralCode },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate email
    if (!validateEmail(email)) {
      setError(t('signup.validEmail'));
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(`${t('password.requirements')} ${passwordValidation.errors.join(', ')}`);
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      setError(t('signup.passwordsDontMatch'));
      return;
    }

    setIsLoading(true);

    try {
      // Prepare user attributes with proper typing
      const userAttributes: UserAttributes = {
        email,
      };

      // Add referral information if code is valid
      if (referralCode && referralValid) {
        userAttributes['custom:referralCode'] = referralCode;
        // Get the referrer ID from the validation result
        const validationResult = await validateReferralCode(referralCode);
        if (validationResult.valid && validationResult.referrerId) {
          userAttributes['custom:referrerId'] = validationResult.referrerId;
        } else {
          // If validation fails during signup, clear the referral code
          delete userAttributes['custom:referralCode'];
          setError(t('signup.invalidReferralCode'));
          return;
        }
      }

      // Validate user attributes before sending
      if (!validateUserAttributes(userAttributes)) {
        const errorContext = createErrorContext('validateUserAttributes');
        const authError: AuthError = {
          message: t('signup.invalidUserAttributes'),
          code: 'INVALID_EMAIL',
          details: errorContext,
        };
        throw authError;
      }

      const signUpOptions: SignUpOptions = {
        username: email,
        password,
        options: {
          userAttributes,
        },
      };

      await signUp(signUpOptions);

      setSuccess(t('signup.accountCreated'));
      onSuccess?.();
    } catch (err: unknown) {
      const errorContext = createErrorContext('signUp');
      
      let authError: AuthError;
      
      if (isApiError(err)) {
        authError = {
          message: err.message || t('signup.errorDuringSignup'),
          code: 'INVALID_CREDENTIALS',
          details: errorContext,
        };
      } else {
        authError = {
          message: t('signup.unexpectedError'),
          code: 'INVALID_CREDENTIALS',
          details: errorContext,
        };
      }
      
      console.error('Sign up error:', err, errorContext);
      setError(authError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="custom-signup-container">
      <Card className="signup-card">
        <Flex direction="column" gap={tokens.space.large}>
          <View textAlign="center">
            <Heading level={3} className="signup-title">
              {t('signup.title')}
            </Heading>
            <Text className="signup-subtitle">
              {t('signup.subtitle')}
            </Text>
          </View>

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
            <Flex direction="column" gap={tokens.space.medium}>
              <TextField
                label={t('signup.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('signup.enterEmail')}
                isRequired
                autoComplete="email"
              />

              <PasswordField
                label={t('signup.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('signup.createPassword')}
                isRequired
                autoComplete="new-password"
              />

              <PasswordField
                label={t('signup.confirmPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('signup.confirmPasswordPlaceholder')}
                isRequired
                autoComplete="new-password"
              />

              <TextField
                label={t('signup.referralCode')}
                value={referralCode}
                onChange={(e) => handleReferralCodeChange(e.target.value)}
                placeholder={t('signup.enterReferralCode')}
                autoComplete="off"
              />

              {referralMessage && (
                <Alert
                  variation={referralValid ? 'success' : 'warning'}
                  isDismissible
                >
                  {referralMessage}
                </Alert>
              )}

              <Button
                type="submit"
                variation="primary"
                isLoading={isLoading}
                loadingText={t('signup.creatingAccount')}
                isFullWidth
              >
                {t('signup.createAccount')}
              </Button>
            </Flex>
          </form>

          <View textAlign="center">
            <Text fontSize="small" color="font.secondary">
              {t('signup.termsAgreement')}
            </Text>
          </View>
        </Flex>
      </Card>
    </View>
  );
};

export default CustomSignUp; 