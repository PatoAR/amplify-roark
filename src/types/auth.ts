// Authentication specific types

export interface UserAttributes {
  email: string;
  'custom:referralCode'?: string;
  'custom:referrerId'?: string;
  [key: string]: string | undefined;
}

export interface SignUpOptions {
  username: string;
  password: string;
  options: {
    userAttributes: UserAttributes;
    clientMetadata?: Record<string, string>;
  };
}

export interface SignInOptions {
  username: string;
  password: string;
}

export interface PasswordChangeOptions {
  oldPassword: string;
  newPassword: string;
}

export interface PasswordResetOptions {
  username: string;
}

export interface ConfirmSignUpOptions {
  username: string;
  confirmationCode: string;
}

export interface ResendConfirmationOptions {
  username: string;
}

// Validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateUserAttributes = (attributes: unknown): attributes is UserAttributes => {
  if (typeof attributes !== 'object' || attributes === null) {
    return false;
  }
  
  const attrs = attributes as Record<string, unknown>;
  
  // Email is required
  if (typeof attrs.email !== 'string' || !validateEmail(attrs.email)) {
    return false;
  }
  
  // Optional fields should be strings if present
  if (attrs['custom:referralCode'] !== undefined && typeof attrs['custom:referralCode'] !== 'string') {
    return false;
  }
  
  if (attrs['custom:referrerId'] !== undefined && typeof attrs['custom:referrerId'] !== 'string') {
    return false;
  }
  
  return true;
}; 