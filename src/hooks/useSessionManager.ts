import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useActivityTracking } from './useActivityTracking';

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
  const { startSession, endSession } = useActivityTracking();
  
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

  // Centralized logout function with improved error handling
  const performLogout = useCallback(async () => {
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

      // Clear localStorage (except UI preferences and inactivity flag)
      const keysToPreserve = ['theme', 'language', 'inactivity-logout'];
      const keysToRemove = Object.keys(localStorage).filter(
        key => !keysToPreserve.includes(key) && 
        (key.includes('user') || key.includes('session') || key.includes('auth'))
      );
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      // Call signOut
      await signOut();

      // Notify callback
      if (userId && options.onSessionEnd) {
        options.onSessionEnd(userId);
      }
    } catch (error) {
      console.error('Logout error', error);
      if (options.onAuthError) {
        options.onAuthError(error);
      }
    } finally {
      // Always reset logout flag to prevent blocking future logins
      isLoggingOutRef.current = false;
    }
  }, [endSession, signOut, options]);

  // Wrapper for startSession that checks logout state
  const safeStartSession = useCallback(async () => {
    if (!isLoggingOutRef.current) {
      return startSession();
    }
  }, [startSession]);

  // Start session when user becomes authenticated
  useEffect(() => {
    if (user?.userId && !sessionStateRef.current.isAuthenticated && !isLoggingOutRef.current) {
      sessionStateRef.current = {
        isAuthenticated: true,
        isSessionActive: true,
        userId: user.userId,
        sessionId: undefined,
      };

      // Update consolidated auth state
      setAuthState(prev => ({
        ...prev,
        authStatus: 'authenticated',
        isAuthenticated: true,
        isSessionActive: true,
        userId: user.userId,
      }));

      // Start activity tracking
      safeStartSession().then(() => {
        if (sessionStateRef.current.sessionId) {
          setAuthState(prev => ({
            ...prev,
            sessionId: sessionStateRef.current.sessionId,
          }));
        }
      });

      if (options.onSessionStart) {
        options.onSessionStart(user.userId);
      }
    }
  }, [user?.userId, safeStartSession, options]);

  // Handle logout when authStatus changes
  useEffect(() => {
    if (authStatus === 'unauthenticated' && sessionStateRef.current.isAuthenticated && !isLoggingOutRef.current) {
      performLogout();
    }
  }, [authStatus, performLogout]);

  // Update authStatus in consolidated state
  useEffect(() => {
    setAuthState(prev => ({
      ...prev,
      authStatus,
    }));
  }, [authStatus]);

  // Add browser close cleanup
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Mark session as ending to prevent new operations
      isLoggingOutRef.current = true;
      
      // Store cleanup flag for next session
      localStorage.setItem('session-cleanup-needed', 'true');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Check for cleanup needed on mount
  useEffect(() => {
    const needsCleanup = localStorage.getItem('session-cleanup-needed');
    if (needsCleanup === 'true') {
      localStorage.removeItem('session-cleanup-needed');
      // Perform any necessary cleanup here
      console.log('Performing session cleanup from previous session');
    }
  }, []);

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