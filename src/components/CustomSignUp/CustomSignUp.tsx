import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { signUp } from 'aws-amplify/auth';
import { Card, Flex, Heading, Text, TextField, PasswordField, Button, Alert, View, useTheme, Image } from '@aws-amplify/ui-react';
import { UserAttributes, SignUpOptions, validateEmail, validatePassword, validateUserAttributes } from '../../types/auth';
import { isApiError, AuthError, ErrorContext } from '../../types/errors';
import { useTranslation } from '../../i18n';
import perkinsLogo from '../../assets/BaseLogo_v1.png';
import './CustomSignUp.css';

interface CustomSignUpProps {
  onSuccess?: () => void;
}

const CustomSignUp: React.FC<CustomSignUpProps> = ({ onSuccess }) => {
  const { tokens } = useTheme();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const [referralMessage, setReferralMessage] = useState<string>('');
  const [validationResult, setValidationResult] = useState<{ valid: boolean; referrerId?: string } | null>(null);
  const [referralCodeFromUrl, setReferralCodeFromUrl] = useState<boolean>(false);
  const navigate = useNavigate();

  // Check for referral code in URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      setReferralCodeFromUrl(true);
      validateReferralCodeFromUrl(refCode);
    }
  }, [searchParams]);

  // Simplified referral validation for the standalone component
  const validateReferralCodeFromUrl = async (code: string) => {
    try {
      // For now, assume the referral code is valid if it exists
      // This will be validated on the backend during signup
      setValidationResult({ valid: true, referrerId: 'pending' });
      setReferralValid(true);
      setReferralMessage(t('signup.validReferralCode') || 'Valid referral code detected!');
      
      console.log(`Referral link accessed: ${code}`);
    } catch (err) {
      setReferralValid(false);
      setReferralMessage(t('signup.errorValidatingCode') || 'Error validating referral code');
    }
  };

  const handleReferralCodeChange = async (value: string) => {
    setReferralCode(value);
    setReferralCodeFromUrl(false); // Reset flag when user manually enters code
    if (value.length >= 3) {
      // For now, assume valid if length is sufficient
      // Backend will validate during signup
      setValidationResult({ valid: true, referrerId: 'pending' });
      setReferralValid(true);
      setReferralMessage(t('signup.validReferralCode') || 'Referral code looks valid');
    } else {
      setReferralValid(null);
      setReferralMessage('');
      setValidationResult(null);
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
      setError(t('signup.validEmail') || 'Please enter a valid email address');
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(`${t('password.requirements') || 'Password requirements'}: ${passwordValidation.errors.join(', ')}`);
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      setError(t('signup.passwordsDontMatch') || 'Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare user attributes with proper typing
      const userAttributes: UserAttributes = {
        email,
      };

      // Add referral information if code is present
      if (referralCode) {
        userAttributes['custom:referralCode'] = referralCode;
        // The backend will validate and process the referral code
        userAttributes['custom:referrerId'] = 'pending';
      }

      // Validate user attributes before sending
      if (!validateUserAttributes(userAttributes)) {
        const errorContext = createErrorContext('validateUserAttributes');
        const authError: AuthError = {
          message: t('signup.invalidUserAttributes') || 'Invalid user attributes',
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

      setSuccess(t('signup.accountCreated') || 'Account created successfully!');
      onSuccess?.();
    } catch (err: unknown) {
      const errorContext = createErrorContext('signUp');
      
      let authError: AuthError;
      
      if (isApiError(err)) {
        authError = {
          message: err.message || t('signup.errorDuringSignup') || 'Error during signup',
          code: 'INVALID_CREDENTIALS',
          details: errorContext,
        };
      } else {
        authError = {
          message: t('signup.unexpectedError') || 'An unexpected error occurred',
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
          <View textAlign="center" padding={tokens.space.large}>
            <Image
              alt="Perkins Business Intelligence"
              src={perkinsLogo}
              className="auth-logo"
            />
          </View>
          
          <View textAlign="center">
            <Heading level={3} className="signup-title">
              {t('signup.title') || 'Create Account'}
            </Heading>
            <Text className="signup-subtitle">
              {t('signup.subtitle') || 'Sign up with your referral code'}
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
                label={t('signup.email') || 'Email'}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('signup.enterEmail') || 'Enter your email'}
                isRequired
                autoComplete="email"
              />

              <PasswordField
                label={t('signup.password') || 'Password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('signup.createPassword') || 'Create a password'}
                isRequired
                autoComplete="new-password"
              />

              <PasswordField
                label={t('signup.confirmPassword') || 'Confirm Password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('signup.confirmPasswordPlaceholder') || 'Confirm your password'}
                isRequired
                autoComplete="new-password"
              />

              <TextField
                label={t('signup.referralCode') || 'Referral Code'}
                value={referralCode}
                onChange={(e) => handleReferralCodeChange(e.target.value)}
                placeholder={t('signup.enterReferralCode') || 'Enter referral code'}
                autoComplete="off"
                readOnly={referralCodeFromUrl}
              />
              
              {referralCodeFromUrl && (
                <Text fontSize="small" color="font.secondary">
                  {t('signup.referralCodeFromLink') || 'Referral code from your invitation link'}
                </Text>
              )}

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
                loadingText={t('signup.creatingAccount') || 'Creating Account...'}
                isFullWidth
              >
                {t('signup.createAccount') || 'Create Account'}
              </Button>
            </Flex>
          </form>

          <View textAlign="center">
            <Text fontSize="small" color="font.secondary">
              {t('signup.termsAgreement') || 'By creating an account, you agree to our terms of service'}
            </Text>
          </View>

          <View textAlign="center">
            <Button
              variation="link"
              onClick={() => {
                // Navigate back to the root without referral code
                navigate('/', { replace: true });
              }}
              size="small"
            >
              {t('signup.backToSignIn') || 'Back to Sign In'}
            </Button>
          </View>
        </Flex>
      </Card>
    </View>
  );
};

export default CustomSignUp; 