import { useEffect, useRef, useCallback } from 'react';
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
  const { isTracking, startSession, endSession, trackPageView } = useActivityTracking();
  const sessionStateRef = useRef<SessionState>({
    isAuthenticated: false,
    isSessionActive: false,
  });
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
      console.log('🔄 Performing centralized logout...');
      isLoggingOutRef.current = true;

      // 1. End activity tracking session
      if (sessionStateRef.current.isSessionActive) {
        await endSession();
        console.log('✅ Activity session ended');
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
      console.log(`🗂️ Cleared ${keysToRemove.length} localStorage items`);

      // 4. Call signOut
      await signOut();
      console.log('✅ Authentication signOut completed');

      // 5. Notify callback
      if (userId && options.onSessionEnd) {
        options.onSessionEnd(userId);
      }

      console.log('✅ Centralized logout completed successfully');
    } catch (error) {
      console.error('❌ Error during centralized logout:', error, errorContext);
      if (options.onAuthError) {
        options.onAuthError(error);
      }
    } finally {
      // Reset logout flag after a delay to prevent immediate re-initialization
      setTimeout(() => {
        isLoggingOutRef.current = false;
      }, 1000);
    }
  }, [endSession, signOut, options, createErrorContext]);

  // Start session when user becomes authenticated
  useEffect(() => {
    const errorContext = createErrorContext('sessionStart');

    if (authStatus === 'authenticated' && user?.userId) {
      // Only start session if not already active and not in the middle of logout
      if (!sessionStateRef.current.isSessionActive && !isLoggingOutRef.current) {
        console.log('🔄 Starting session for authenticated user...');
        
        startSession().then(() => {
          sessionStateRef.current = {
            isAuthenticated: true,
            isSessionActive: true,
            userId: user.userId,
            sessionId: sessionStateRef.current.sessionId,
          };

          console.log('✅ Session started successfully');
          
          if (options.onSessionStart) {
            options.onSessionStart(user.userId);
          }
        }).catch((error) => {
          console.error('❌ Failed to start session:', error, errorContext);
          if (options.onAuthError) {
            options.onAuthError(error);
          }
        });
      }
    } else if (authStatus === 'unauthenticated') {
      // User is not authenticated, ensure session is ended
      if (sessionStateRef.current.isSessionActive) {
        console.log('🔄 User not authenticated, ending session...');
        performLogout();
      }
    }
  }, [authStatus, user?.userId, startSession, performLogout, options, createErrorContext]);

  // Handle authentication errors - authStatus can be 'authenticated', 'unauthenticated', or 'configuring'
  useEffect(() => {
    // Only end session if user is actually logging out, not during temporary auth state changes
    if (authStatus === 'unauthenticated' && sessionStateRef.current.isSessionActive && isLoggingOutRef.current) {
      const errorContext = createErrorContext('authError');
      console.error('❌ User became unauthenticated while session was active:', errorContext);
      
      if (options.onAuthError) {
        options.onAuthError(new Error('User authentication lost'));
      }
      
      // Perform logout when user becomes unauthenticated
      performLogout();
    } else if (authStatus === 'unauthenticated' && sessionStateRef.current.isSessionActive) {
      console.log('🔍 Session manager: User unauthenticated but not logging out, skipping session end');
    }
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
    isAuthenticated: sessionStateRef.current.isAuthenticated,
    isSessionActive: sessionStateRef.current.isSessionActive,
    userId: sessionStateRef.current.userId,
    sessionId: sessionStateRef.current.sessionId,
    authStatus,
    
    // Actions
    logout,
    trackPageViewIfActive,
  };
}; 