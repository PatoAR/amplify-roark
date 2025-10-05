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
  const justLoggedOutRef = useRef<boolean>(false);
  const optionsRef = useRef<UseSessionManagerOptions>(options);
  const lastProcessedAuthStateRef = useRef<string>('');
  const startSessionRef = useRef(startSession);
  const effectExecutionRef = useRef<boolean>(false);
  
  // Update refs when functions change
  useEffect(() => {
    optionsRef.current = options;
    startSessionRef.current = startSession;
  }, [options, startSession]);

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

      // Clear localStorage (preserve inactivity flag only for inactivity logouts)
      const keysToPreserve = ['theme', 'language'];
      if (isInactivityLogout) {
        keysToPreserve.push('inactivity-logout');
      }
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
      if (optionsRef.current.onAuthError) {
        optionsRef.current.onAuthError(error);
      }
    } finally {
      // Always reset logout flag to prevent blocking future logins
      isLoggingOutRef.current = false;
    }
  }, [endSession, signOut]);

  // Start session when user becomes authenticated
  useEffect(() => {
    const currentAuthState = `${user?.userId}-${authStatus}-${sessionStateRef.current.isAuthenticated}`;
    
    // Skip if we've already processed this exact state or if effect is already executing
    if (currentAuthState === lastProcessedAuthStateRef.current || effectExecutionRef.current) {
      return;
    }
    
    // Mark effect as executing and update processed state
    effectExecutionRef.current = true;
    lastProcessedAuthStateRef.current = currentAuthState;
    
    console.log('[SessionManager] Session start effect triggered:', {
      hasUser: !!user?.userId,
      userId: user?.userId,
      isAuthenticated: sessionStateRef.current.isAuthenticated,
      isLoggingOut: isLoggingOutRef.current,
      justLoggedOut: justLoggedOutRef.current,
      authStatus,
      shouldStart: user?.userId && 
                   !sessionStateRef.current.isAuthenticated && 
                   !isLoggingOutRef.current && 
                   authStatus === 'authenticated' &&
                   !justLoggedOutRef.current
    });

    // Only start session if:
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
      console.log('[SessionManager] Starting session for user:', user.userId);
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

      // Start activity tracking (using ref to avoid dependency issues)
      if (!isLoggingOutRef.current) {
        startSessionRef.current().then(() => {
          if (sessionStateRef.current.sessionId) {
            setAuthState(prev => ({
              ...prev,
              sessionId: sessionStateRef.current.sessionId,
            }));
          }
        });
      }

      if (optionsRef.current.onSessionStart) {
        optionsRef.current.onSessionStart(user.userId);
      }
    }
    
    // Reset execution flag after effect completes
    effectExecutionRef.current = false;
  }, [user?.userId, authStatus]);

  // Handle logout when authStatus changes
  useEffect(() => {
    const shouldLogout = authStatus === 'unauthenticated' && sessionStateRef.current.isAuthenticated && !isLoggingOutRef.current;
    
    // Only log and process if there's an actual change that requires action
    if (shouldLogout || (authStatus === 'unauthenticated' && sessionStateRef.current.isAuthenticated)) {
      console.log('[SessionManager] Logout effect triggered:', {
        authStatus,
        isAuthenticated: sessionStateRef.current.isAuthenticated,
        isLoggingOut: isLoggingOutRef.current,
        shouldLogout
      });

      if (shouldLogout) {
        console.log('[SessionManager] Performing logout');
        performLogout();
      }
    }
  }, [authStatus]);

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