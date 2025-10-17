import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { signUp, confirmSignUp, resendSignUpCode, signIn } from 'aws-amplify/auth';
import { 
  Card, 
  Flex, 
  Heading, 
  Text, 
  TextField, 
  PasswordField, 
  Button, 
  Alert, 
  View, 
  useTheme, 
  Image,
  Badge,
  Divider
} from '@aws-amplify/ui-react';
import { UserAttributes, SignUpOptions, validateEmail, validatePassword, validateUserAttributes } from '../../types/auth';
import { isApiError, AuthError, ErrorContext } from '../../types/errors';
import { useTranslation } from '../../i18n';
import { useEmailValidation } from '../../hooks/useEmailValidation';
import perkinsLogo from '/PerkinsLogo_Base_Transp.png';
import '@aws-amplify/ui-react/styles.css';
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
  const [referralCodeFromUrl, setReferralCodeFromUrl] = useState<boolean>(false);
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();

  // Email validation hook
  const { isEmailBlocked, blockReason, checkEmail } = useEmailValidation();

  // Check for referral code in URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      setReferralCodeFromUrl(true);
    }
  }, [searchParams]);

  const handleReferralCodeChange = async (value: string) => {
    setReferralCode(value);
    setReferralCodeFromUrl(false);
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

    // Check if email was previously deleted
    const isEmailAllowed = await checkEmail(email);
    if (!isEmailAllowed) {
      setError(blockReason || 'This email cannot be used for account creation.');
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
      const userAttributes: UserAttributes = { email };

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
          clientMetadata: referralCode ? { referralCode, referrerId: 'pending' } : undefined,
        },
      };

      await signUp(signUpOptions);
      
      setSuccess(
        t('signup.accountCreated') ||
          'Account created successfully! Please check your email to verify your account.'
      );
      setIsVerificationStep(true);
      onSuccess?.();
    } catch (err: unknown) {
      const errorContext = createErrorContext('signUp');
      
      let authError: AuthError;
      
      if (isApiError(err)) {
        if (err.message?.includes('Attributes did not conform to the schema')) {
          authError = {
            message: 'Referral code validation error. Please try again or contact support.',
            code: 'INVALID_CREDENTIALS',
            details: errorContext,
          };
        } else if (err.message?.includes('custom:referralCode')) {
          authError = {
            message: 'Referral code format is invalid. Please check your code and try again.',
            code: 'INVALID_CREDENTIALS',
            details: errorContext,
          };
        } else {
          authError = {
            message: err.message || t('signup.errorDuringSignup') || 'Error during signup',
            code: 'INVALID_CREDENTIALS',
            details: errorContext,
          };
        }
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

  const handleConfirmVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsVerifying(true);
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: verificationCode,
        options: {
          clientMetadata: referralCode ? { referralCode, referrerId: 'pending' } : undefined,
        },
      });
      // Auto sign-in to mirror Authenticator behavior
      try {
        await signIn({ username: email, password });
        window.location.replace('/');
      } catch (signInErr: unknown) {
        setSuccess(t('verify.success') || 'Email verified. You can now sign in.');
        if (isApiError(signInErr) && signInErr.message) {
          setError(signInErr.message);
        }
        navigate('/', { replace: true });
      }
    } catch (err: unknown) {
      let message = t('verify.errorGeneric') || 'Verification failed. Please try again.';
      if (isApiError(err)) {
        const raw = err.message || '';
        if (/CodeMismatch/i.test(raw)) {
          message = t('verify.errorInvalid') || 'Invalid verification code.';
        } else if (/ExpiredCode/i.test(raw)) {
          message = t('verify.errorExpired') || 'Verification code has expired.';
        } else if (/UserNotFound/i.test(raw)) {
          message = t('verify.errorUser') || 'User not found.';
        } else {
          message = raw;
        }
      }
      setError(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('');
    setIsResending(true);
    try {
      await resendSignUpCode({ username: email });
      setSuccess(t('verify.sent') || 'Verification code resent.');
    } catch (err: unknown) {
      let message = t('verify.errorResend') || 'Failed to resend code.';
      if (isApiError(err)) {
        message = err.message || message;
      }
      setError(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View className="amplify-authenticator">
      <Card>
        <Flex direction="column" gap={tokens.space.large}>
          {/* Header */}
          <View textAlign="center">
            <Image
              alt="Perkins Business Intelligence"
              src={perkinsLogo}
              height="80px"
              marginBottom={tokens.space.medium}
            />
            <Heading level={5}>
              {isVerificationStep 
                ? (t('verify.title') || 'Verify your email')
                : (t('signup.title') || 'Create Account')
              }
            </Heading>
            <Text fontSize={tokens.fontSizes.small} color={tokens.colors.neutral[60]}>
              {isVerificationStep 
                ? `${t('verify.subtitle') || 'Enter the verification code sent to'} ${email}`
                : (t('signup.subtitle') || 'Sign up with your referral code')
              }
            </Text>
          </View>

          {/* Error and Success Messages */}
          {error && (
            <Alert variation="error">
              {error}
            </Alert>
          )}

          {success && !isVerificationStep && (
            <Alert variation="success">
              {success}
            </Alert>
          )}

          {/* Verification Step */}
          {isVerificationStep ? (
            <form onSubmit={handleConfirmVerification}>
              <Flex direction="column" gap={tokens.space.large}>
                <TextField
                  label={t('verify.codeLabel') || 'Verification Code'}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder={t('verify.codePlaceholder') || '6-digit code'}
                  isRequired
                  autoComplete="one-time-code"
                />

                <Button
                  type="submit"
                  variation="primary"
                  isLoading={isVerifying}
                  loadingText={t('verify.submitting') || 'Verifying...'}
                  isFullWidth
                >
                  {t('verify.submit') || 'Verify Email'}
                </Button>

                <Button
                  type="button"
                  variation="link"
                  onClick={handleResendCode}
                  isLoading={isResending}
                  isFullWidth
                >
                  {t('verify.resend') || 'Resend code'}
                </Button>
              </Flex>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleSubmit}>
              <Flex direction="column" gap={tokens.space.large}>
                <TextField
                  label={t('signup.email') || 'Email'}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('signup.enterEmail') || 'Enter your email'}
                  isRequired
                  autoComplete="email"
                  hasError={isEmailBlocked}
                  errorMessage={isEmailBlocked ? blockReason : undefined}
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

                {/* Referral Code Section */}
                <View>
                  <Flex alignItems="center" gap={tokens.space.small} marginBottom={tokens.space.xs}>
                    <Text fontSize={tokens.fontSizes.small} fontWeight={tokens.fontWeights.semibold}>
                      {t('signup.referralCode') || 'Referral Code'}
                    </Text>
                    {referralCodeFromUrl && (
                      <Badge variation="success" size="small">
                        Auto-filled
                      </Badge>
                    )}
                  </Flex>
                  
                  <TextField
                    label=""
                    value={referralCode}
                    onChange={(e) => handleReferralCodeChange(e.target.value)}
                    placeholder={t('signup.enterReferralCode') || 'Enter referral code'}
                    autoComplete="off"
                    readOnly={referralCodeFromUrl}
                    className={referralCodeFromUrl ? 'referral-code-readonly' : ''}
                  />
                  
                  {referralCodeFromUrl && (
                    <Text fontSize={tokens.fontSizes.xs} color={tokens.colors.neutral[60]} marginTop={tokens.space.xs}>
                      {t('signup.referralCodeFromLink') || 'Referral code from your invitation link'}
                    </Text>
                  )}
                </View>

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
          )}

          {/* Footer */}
          <Divider />
          <Text fontSize={tokens.fontSizes.xs} textAlign="center" color={tokens.colors.neutral[60]}>
            {t('signup.termsAgreement') || 'By creating an account, you agree to our terms of service'}
          </Text>
        </Flex>
      </Card>
    </View>
  );
};

export default CustomSignUp; 