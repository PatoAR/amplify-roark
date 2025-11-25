import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useActivityTracking } from './useActivityTracking';
import { SessionService } from '../utils/sessionService';

interface SessionState {
  isAuthenticated: boolean;
  isSessionActive: boolean;
  userId?: string;
  sessionId?: string;
}

// Consolidated authentication state interface
interface AuthState {
  authStatus: 'configuring' | 'authenticated' | 'unauthenticated';
  isAuthenticated: boolean;
  isSessionActive: boolean;
  userId?: string;
  sessionId?: string;
}

interface UseSessionManagerOptions {
  onSessionStart?: (userId: string) => void;
  onSessionEnd?: (userId: string) => void;
  onAuthError?: (error: unknown) => void;
}

export const useSessionManager = (options: UseSessionManagerOptions = {}) => {
  const { user, authStatus, signOut } = useAuthenticator();
  const { startSession, endSession, restoreSession } = useActivityTracking();
  
  // Consolidated state management
  const [authState, setAuthState] = useState<AuthState>({
    authStatus: 'configuring',
    isAuthenticated: false,
    isSessionActive: false,
  });
  
  const sessionStateRef = useRef<SessionState>({
    isAuthenticated: false,
    isSessionActive: false,
  });
  const isLoggingOutRef = useRef<boolean>(false);
  const justLoggedOutRef = useRef<boolean>(false);
  const optionsRef = useRef<UseSessionManagerOptions>(options);
  const lastProcessedAuthStateRef = useRef<string>('');
  const startSessionRef = useRef(startSession);
  const restoreSessionRef = useRef(restoreSession);
  const effectExecutionRef = useRef<boolean>(false);
  const restorationAttemptedRef = useRef<boolean>(false);
  
  // Update refs when functions change
  useEffect(() => {
    optionsRef.current = options;
    startSessionRef.current = startSession;
    restoreSessionRef.current = restoreSession;
  }, [options, startSession, restoreSession]);

  // Centralized logout function with improved error handling
  const performLogout = useCallback(async (isInactivityLogout = false) => {
    const userId = sessionStateRef.current.userId;

    try {
      isLoggingOutRef.current = true;

      // Update auth state immediately to prevent race conditions
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        isSessionActive: false,
        userId: undefined,
        sessionId: undefined,
      }));

      // End activity tracking session
      if (sessionStateRef.current.isSessionActive) {
        await endSession();
      }

      // Clear session state
      sessionStateRef.current = {
        isAuthenticated: false,
        isSessionActive: false,
        userId: undefined,
        sessionId: undefined,
      };

      // Clear ALL article read states (clean up all sessions)
      SessionService.clearAllArticleReadStates();

      // Clear localStorage - comprehensive cleanup
      const keysToPreserve = [
        'theme', 
        'userLanguage',  // User's language preference
        'session-cleanup-needed',  // Cleanup flag for next session
        'perkins-optimal-usage-modal-hidden'  // User UI preference
      ];
      if (isInactivityLogout) {
        keysToPreserve.push('inactivity-logout');
      }
      
      // Remove all localStorage keys except those we want to preserve
      Object.keys(localStorage).forEach(key => {
        // Preserve specific app preferences
        if (keysToPreserve.includes(key)) {
          return; // Skip preserved keys
        }
        
        // Clear AWS Amplify/Cognito keys (CognitoIdentityServiceProvider.*)
        // Clear amplify-* prefixed keys
        // Clear any user/session/auth related keys
        // Clear roark_* keys (session-related, but not preserved preferences)
        // Note: SessionService keys are cleared by SessionService.endSession()
        if (
          key.startsWith('CognitoIdentityServiceProvider') ||
          key.startsWith('amplify') ||
          key.startsWith('roark_') ||
          (key.includes('auth') && !keysToPreserve.includes(key)) ||
          key.includes('token')
        ) {
          localStorage.removeItem(key);
        }
      });

      // Also clear sessionStorage (except preserved keys)
      Object.keys(sessionStorage).forEach(key => {
        if (!keysToPreserve.includes(key)) {
          sessionStorage.removeItem(key);
        }
      });

      // Call signOut with global option to invalidate tokens on all devices
      // This ensures tokens are revoked server-side as well
      await signOut({ global: true });

      // Notify callback
      if (userId && optionsRef.current.onSessionEnd) {
        optionsRef.current.onSessionEnd(userId);
      }

      // Set flag to prevent immediate session restart
      justLoggedOutRef.current = true;
      // Clear the flag after a short delay to allow future logins
      setTimeout(() => {
        justLoggedOutRef.current = false;
      }, 1000);
    } catch (error) {
      console.error('Logout error', error);
      
      // If global signOut fails, try local signOut as fallback
      try {
        await signOut();
      } catch (fallbackError) {
        console.error('Fallback signOut also failed', fallbackError);
      }
      
      if (optionsRef.current.onAuthError) {
        optionsRef.current.onAuthError(error);
      }
    } finally {
      // Always reset logout flag to prevent blocking future logins
      isLoggingOutRef.current = false;
    }
  }, [endSession, signOut]);

  // Restore or start session when user becomes authenticated
  useEffect(() => {
    const currentAuthState = `${user?.userId}-${authStatus}-${sessionStateRef.current.isAuthenticated}`;
    
    // Skip if we've already processed this exact state or if effect is already executing
    if (currentAuthState === lastProcessedAuthStateRef.current || effectExecutionRef.current) {
      return;
    }
    
    // Mark effect as executing and update processed state
    effectExecutionRef.current = true;
    lastProcessedAuthStateRef.current = currentAuthState;

    // Only process if:
    // 1. User exists and has userId
    // 2. We're not currently authenticated
    // 3. We're not in the middle of logging out
    // 4. Auth status is actually authenticated (prevents race condition during logout)
    // 5. We haven't just logged out (prevents immediate restart)
    if (user?.userId && 
        !sessionStateRef.current.isAuthenticated && 
        !isLoggingOutRef.current && 
        authStatus === 'authenticated' &&
        !justLoggedOutRef.current) {
      
      // Try to restore existing session first (only once per mount)
      const attemptRestore = async () => {
        if (!restorationAttemptedRef.current) {
          restorationAttemptedRef.current = true;
          const restored = await restoreSessionRef.current();
          
          if (restored) {
            // Session was restored
            const currentSession = SessionService.getCurrentSession();
            if (currentSession) {
              sessionStateRef.current = {
                isAuthenticated: true,
                isSessionActive: true,
                userId: user.userId,
                sessionId: currentSession.sessionId,
              };

              setAuthState(prev => ({
                ...prev,
                authStatus: 'authenticated',
                isAuthenticated: true,
                isSessionActive: true,
                userId: user.userId,
                sessionId: currentSession.sessionId,
              }));

              if (optionsRef.current.onSessionStart) {
                optionsRef.current.onSessionStart(user.userId);
              }
              effectExecutionRef.current = false;
              return;
            }
          }
        }

        // No valid session to restore, start a new one
        sessionStateRef.current = {
          isAuthenticated: true,
          isSessionActive: true,
          userId: user.userId,
          sessionId: undefined,
        };

        setAuthState(prev => ({
          ...prev,
          authStatus: 'authenticated',
          isAuthenticated: true,
          isSessionActive: true,
          userId: user.userId,
        }));

        // Start activity tracking (using ref to avoid dependency issues)
        if (!isLoggingOutRef.current) {
          startSessionRef.current().then(() => {
            const currentSession = SessionService.getCurrentSession();
            if (currentSession) {
              sessionStateRef.current.sessionId = currentSession.sessionId;
              setAuthState(prev => ({
                ...prev,
                sessionId: currentSession.sessionId,
              }));
            }
          });
        }

        if (optionsRef.current.onSessionStart) {
          optionsRef.current.onSessionStart(user.userId);
        }
        effectExecutionRef.current = false;
      };

      attemptRestore();
    } else {
      effectExecutionRef.current = false;
    }
  }, [user?.userId, authStatus]);

  // Handle logout when authStatus changes
  useEffect(() => {
    const shouldLogout = authStatus === 'unauthenticated' && sessionStateRef.current.isAuthenticated && !isLoggingOutRef.current;
    
    // Only process if there's an actual change that requires action
    if (shouldLogout || (authStatus === 'unauthenticated' && sessionStateRef.current.isAuthenticated)) {
      if (shouldLogout) {
        performLogout();
      }
    }
  }, [authStatus, performLogout]);

  // Update authStatus in consolidated state
  useEffect(() => {
    setAuthState(prev => ({
      ...prev,
      authStatus,
    }));
  }, [authStatus]);

  // Reset restoration flag when user logs out
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      restorationAttemptedRef.current = false;
    }
  }, [authStatus]);

  return {
    // Consolidated authentication state
    authStatus: authState.authStatus,
    isAuthenticated: authState.isAuthenticated,
    isSessionActive: authState.isSessionActive,
    userId: authState.userId,
    sessionId: authState.sessionId,
    logout: performLogout,
  };
}; 