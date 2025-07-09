// Centralized error types for the application

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface AuthError extends ApiError {
  code: 'INVALID_CREDENTIALS' | 'USER_NOT_FOUND' | 'USER_NOT_CONFIRMED' | 'PASSWORD_MISMATCH' | 'INVALID_EMAIL' | 'WEAK_PASSWORD';
}

export interface ReferralError extends ApiError {
  code: 'INVALID_CODE' | 'CODE_EXPIRED' | 'ALREADY_USED' | 'SELF_REFERRAL';
}

export interface ActivityTrackingError extends ApiError {
  code: 'SESSION_EXPIRED' | 'TRACKING_DISABLED' | 'INVALID_EVENT';
}

export interface NetworkError extends ApiError {
  code: 'NETWORK_ERROR' | 'TIMEOUT' | 'CONNECTION_FAILED';
}

export interface DatabaseError extends ApiError {
  code: 'QUERY_FAILED' | 'CONNECTION_ERROR' | 'TRANSACTION_FAILED';
}

// Generic error handler type
export type ErrorHandler = (error: unknown) => void;

// Error context for better debugging
export interface ErrorContext {
  component: string;
  action: string;
  userId?: string;
  sessionId?: string;
  timestamp: string;
  additionalData?: Record<string, unknown>;
  [key: string]: unknown; // Index signature for flexibility
}

// Utility function to create typed errors
export const createError = (
  message: string,
  code?: string,
  statusCode?: number,
  details?: Record<string, unknown>
): ApiError => ({
  message,
  code,
  statusCode,
  details,
});

// Utility function to check if an error is of a specific type
export const isApiError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'message' in error;
};

export const isAuthError = (error: unknown): error is AuthError => {
  return isApiError(error) && 'code' in error && typeof (error as AuthError).code === 'string';
};

export const isNetworkError = (error: unknown): error is NetworkError => {
  return isApiError(error) && 'code' in error && typeof (error as NetworkError).code === 'string';
}; 