import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { signUp } from 'aws-amplify/auth';
import { Card, Flex, Heading, Text, TextField, PasswordField, Button, Alert, View, useTheme } from '@aws-amplify/ui-react';
import { useReferral } from '../../hooks/useReferral';
import { UserAttributes, SignUpOptions, validateEmail, validatePassword, validateUserAttributes } from '../../types/auth';
import { isApiError, AuthError, ErrorContext } from '../../types/errors';
import './CustomSignUp.css';

interface CustomSignUpProps {
  onSuccess?: () => void;
}

const CustomSignUp: React.FC<CustomSignUpProps> = ({ onSuccess }) => {
  const { tokens } = useTheme();
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
        ? '✅ Valid referral code! You\'ll get 3 months of free access.'
        : '❌ Invalid referral code. You can still sign up for 3 months free.'
      );
    } catch (err) {
      setReferralValid(false);
      setReferralMessage('❌ Error validating referral code.');
    }
  };

  const handleReferralCodeChange = async (value: string) => {
    setReferralCode(value);
    if (value.length >= 3) {
      try {
        const result = await validateReferralCode(value);
        setReferralValid(result.valid);
        setReferralMessage(result.valid 
          ? '✅ Valid referral code! You\'ll get 3 months of free access.'
          : '❌ Invalid referral code. You can still sign up for 3 months free.'
        );
      } catch (err) {
        setReferralValid(false);
        setReferralMessage('❌ Error validating referral code.');
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
      setError('Please enter a valid email address');
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(`Password requirements: ${passwordValidation.errors.join(', ')}`);
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
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
        // We'll need to get the referrer ID from the validation result
        const validationResult = await validateReferralCode(referralCode);
        if (validationResult.referrerId) {
          userAttributes['custom:referrerId'] = validationResult.referrerId;
        }
      }

      // Validate user attributes before sending
      if (!validateUserAttributes(userAttributes)) {
        const errorContext = createErrorContext('validateUserAttributes');
        const authError: AuthError = {
          message: 'Invalid user attributes',
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

      setSuccess('Account created successfully! Please check your email to verify your account.');
      onSuccess?.();
    } catch (err: unknown) {
      const errorContext = createErrorContext('signUp');
      
      let authError: AuthError;
      
      if (isApiError(err)) {
        authError = {
          message: err.message || 'An error occurred during sign up',
          code: 'INVALID_CREDENTIALS',
          details: errorContext,
        };
      } else {
        authError = {
          message: 'An unexpected error occurred during sign up',
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
              Join Perkins News Service
            </Heading>
            <Text className="signup-subtitle">
              Get 3 months of free access to personalized business news
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
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                isRequired
                autoComplete="email"
              />

              <PasswordField
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                isRequired
                autoComplete="new-password"
              />

              <PasswordField
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                isRequired
                autoComplete="new-password"
              />

              <TextField
                label="Referral Code (Optional)"
                value={referralCode}
                onChange={(e) => handleReferralCodeChange(e.target.value)}
                placeholder="Enter referral code if you have one"
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
                loadingText="Creating account..."
                isFullWidth
              >
                Create Account
              </Button>
            </Flex>
          </form>

          <View textAlign="center">
            <Text fontSize="small" color="font.secondary">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </Flex>
      </Card>
    </View>
  );
};

export default CustomSignUp; 