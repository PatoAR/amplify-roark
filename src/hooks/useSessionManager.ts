import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useActivityTracking } from './useActivityTracking';
import { ErrorContext } from '../types/errors';

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
  const { isTracking, startSession, endSession, trackPageView, trackPreferenceUpdate, trackReferralActivity, trackArticleClick } = useActivityTracking();
  const sessionStateRef = useRef<SessionState>({
    isAuthenticated: false,
    isSessionActive: false,
  });
  // Reactive state mirrors for consumers to re-render
  const [isAuthenticatedState, setIsAuthenticatedState] = useState<boolean>(false);
  const [isSessionActiveState, setIsSessionActiveState] = useState<boolean>(false);
  const [userIdState, setUserIdState] = useState<string | undefined>(undefined);
  const [sessionIdState, setSessionIdState] = useState<string | undefined>(undefined);
  const isLoggingOutRef = useRef<boolean>(false);

  // Create error context for debugging
  const createErrorContext = useCallback((action: string): ErrorContext => ({
    component: 'useSessionManager',
    action,
    userId: user?.userId,
    sessionId: sessionStateRef.current.sessionId,
    timestamp: new Date().toISOString(),
  }), [user?.userId]);

  // Centralized logout function
  const performLogout = useCallback(async () => {
    const errorContext = createErrorContext('performLogout');
    const userId = sessionStateRef.current.userId;

    try {
      // Centralized logout
      isLoggingOutRef.current = true;

      // 1. End activity tracking session
      if (sessionStateRef.current.isSessionActive) {
        await endSession();
        // Activity session ended
      }

      // 2. Clear session state immediately
      sessionStateRef.current = {
        isAuthenticated: false,
        isSessionActive: false,
        userId: undefined,
        sessionId: undefined,
      };

      // 3. Clear localStorage (except for non-sensitive data)
      const keysToPreserve = ['theme', 'language']; // Preserve UI preferences
      const keysToRemove = Object.keys(localStorage).filter(
        key => !keysToPreserve.includes(key) && 
        (key.includes('user') || key.includes('session') || key.includes('auth') || key.includes('news'))
      );
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      // Cleared localStorage

      // 4. Call signOut
      await signOut();

      // 5. Notify callback
      if (userId && options.onSessionEnd) {
        options.onSessionEnd(userId);
      }
    } catch (error) {
      console.error('Logout error', error, errorContext);
      if (options.onAuthError) {
        options.onAuthError(error);
      }
    } finally {
      // Reset logout flag when authStatus becomes 'unauthenticated'
      if (authStatus === 'unauthenticated') {
        isLoggingOutRef.current = false;
      }
    }
  }, [endSession, signOut, options, createErrorContext, authStatus]);

  // Start session when user becomes authenticated
  useEffect(() => {
    const errorContext = createErrorContext('sessionStart');

    // Prevent session re-initialization during or just after logout
    if (isLoggingOutRef.current) {
      return;
    }

    if (authStatus === 'authenticated' && user?.userId) {
      // Only start session if not already active and not in the middle of logout
      if (!sessionStateRef.current.isSessionActive && !isLoggingOutRef.current) {
        // Starting session for authenticated user
        
        // Set session state immediately to prevent multiple starts
        sessionStateRef.current = {
          isAuthenticated: true,
          isSessionActive: true,
          userId: user.userId,
          sessionId: sessionStateRef.current.sessionId,
        };
        setIsAuthenticatedState(true);
        setIsSessionActiveState(true);
        setUserIdState(user.userId);
        setSessionIdState(sessionStateRef.current.sessionId);
        
        startSession().then(() => {
          // Session started
          
          if (options.onSessionStart) {
            options.onSessionStart(user.userId);
          }
        }).catch((error) => {
           console.error('Failed to start session', error, errorContext);
          // Reset session state on error
          sessionStateRef.current = {
            isAuthenticated: false,
            isSessionActive: false,
            userId: undefined,
            sessionId: undefined,
          };
          setIsAuthenticatedState(false);
          setIsSessionActiveState(false);
          setUserIdState(undefined);
          setSessionIdState(undefined);
          if (options.onAuthError) {
            options.onAuthError(error);
          }
        });
      }
    } else if (authStatus === 'unauthenticated') {
      // User is not authenticated, ensure session is ended
      if (sessionStateRef.current.isSessionActive) {
        // User not authenticated, ending session
        performLogout();
      }
    }
  }, [authStatus, user?.userId, startSession, performLogout, options, createErrorContext]);

  // Reset logout flag when auth state is unauthenticated
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      isLoggingOutRef.current = false;
    }
  }, [authStatus]);

  // Handle authentication errors - authStatus can be 'authenticated', 'unauthenticated', or 'configuring'
  useEffect(() => {
    // Only end session if user is actually logging out, not during temporary auth state changes
    if (authStatus === 'unauthenticated' && sessionStateRef.current.isSessionActive && isLoggingOutRef.current) {
      const errorContext = createErrorContext('authError');
      console.error('User became unauthenticated while session was active', errorContext);
      
      if (options.onAuthError) {
        options.onAuthError(new Error('User authentication lost'));
      }
      
      // Perform logout when user becomes unauthenticated
      performLogout();
    } else if (authStatus === 'unauthenticated' && sessionStateRef.current.isSessionActive) {
       // User unauthenticated but not logging out; skipping session end
    }

    // Remove the redundant session start trigger to prevent multiple starts
  }, [authStatus, performLogout, options, createErrorContext]);

  // Manual logout function
  const logout = useCallback(async () => {
    console.log('🔄 Manual logout requested...');
    await performLogout();
  }, [performLogout]);

  // Track page view when session is active
  const trackPageViewIfActive = useCallback(() => {
    if (isTracking && sessionStateRef.current.isSessionActive && user?.userId) {
      trackPageView();
    }
  }, [isTracking, trackPageView, user?.userId]);

  return {
    // State
    isAuthenticated: isAuthenticatedState,
    isSessionActive: isSessionActiveState,
    userId: userIdState,
    sessionId: sessionIdState,
    authStatus,
    
    // Actions
    logout,
    trackPageViewIfActive,
    // Activity tracking functions
    trackPreferenceUpdate,
    trackReferralActivity,
    trackArticleClick,
  };
}; 