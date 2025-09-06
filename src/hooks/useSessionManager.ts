import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useActivityTracking } from './useActivityTracking';

interface SessionState {
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
  const sessionStateRef = useRef<SessionState>({
    isAuthenticated: false,
    isSessionActive: false,
  });
  
  const [isAuthenticatedState, setIsAuthenticatedState] = useState<boolean>(false);
  const [isSessionActiveState, setIsSessionActiveState] = useState<boolean>(false);
  const [userIdState, setUserIdState] = useState<string | undefined>(undefined);
  const [sessionIdState, setSessionIdState] = useState<string | undefined>(undefined);
  const isLoggingOutRef = useRef<boolean>(false);

  // Centralized logout function
  const performLogout = useCallback(async () => {
    const userId = sessionStateRef.current.userId;

    try {
      isLoggingOutRef.current = true;

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

      // Small delay to ensure state is cleared
      await new Promise(resolve => setTimeout(resolve, 100));

      // Clear localStorage (except UI preferences)
      const keysToPreserve = ['theme', 'language'];
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
      if (authStatus === 'unauthenticated') {
        isLoggingOutRef.current = false;
      }
    }
  }, [endSession, signOut, options, authStatus]);

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

      setIsAuthenticatedState(true);
      setIsSessionActiveState(true);
      setUserIdState(user.userId);

      // Start activity tracking
      safeStartSession().then(() => {
        if (sessionStateRef.current.sessionId) {
          setSessionIdState(sessionStateRef.current.sessionId);
        }
      });

      if (options.onSessionStart) {
        options.onSessionStart(user.userId);
      }
    }
  }, [user?.userId, safeStartSession, options]);

  // Handle logout
  useEffect(() => {
    if (authStatus === 'unauthenticated' && sessionStateRef.current.isAuthenticated && !isLoggingOutRef.current) {
      performLogout();
    }
  }, [authStatus, performLogout]);

  return {
    isAuthenticated: isAuthenticatedState,
    isSessionActive: isSessionActiveState,
    userId: userIdState,
    sessionId: sessionIdState,
    logout: performLogout,
  };
}; 