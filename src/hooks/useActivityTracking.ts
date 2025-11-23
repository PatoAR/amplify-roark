import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { SessionService } from '../utils/sessionService';

export const useActivityTracking = () => {
  const { user } = useAuthenticator();
  const [isTracking, setIsTracking] = useState(false);
  const sessionInitializedRef = useRef(false);

  // Get minimal device information
  const getDeviceInfo = useCallback(() => {
    const { platform } = navigator;
    return JSON.stringify({ platform });
  }, []);

  // Start a new session (only on login)
  const startSession = useCallback(async () => {
    if (!user?.userId) return;

    // Check if we already have a valid session
    const currentSession = SessionService.getCurrentSession();
    if (currentSession) {
      setIsTracking(true);
      // Ensure activity tracking and visibility tracking are running
      SessionService.startActivityTracking();
      SessionService.startVisibilityTracking();
      return;
    }

    try {
      const sessionId = SessionService.generateSessionId();
      const deviceInfo = getDeviceInfo();
      const userAgent = navigator.userAgent;

      const result = await SessionService.createSession(
        sessionId,
        user.userId,
        deviceInfo,
        userAgent
      );

      if (result) {
        setIsTracking(true);
        // Activity tracking is started by SessionService.createSession
        console.log('✅ Activity tracking started:', {
          sessionId: result.sessionId,
          recordId: result.id,
        });
      }
    } catch (error) {
      console.error('❌ Failed to start activity session', error);
    }
  }, [user?.userId, getDeviceInfo]);

  // Restore existing session (on page load)
  const restoreSession = useCallback(async () => {
    if (!user?.userId || sessionInitializedRef.current) return;

    sessionInitializedRef.current = true;

    try {
      // First, expire any stale sessions
      await SessionService.expireStaleSessions(user.userId);

      // Try to restore existing session
      const restoredSession = await SessionService.validateStoredSession(user.userId);

      if (restoredSession) {
        SessionService.setCurrentSession(restoredSession);
        setIsTracking(true);
        // Activity tracking and visibility tracking are started by SessionService.setCurrentSession
        console.log('✅ Session restored:', {
          sessionId: restoredSession.sessionId,
          recordId: restoredSession.recordId,
        });
        return true;
      }
      
      // No session to restore - check if we need to create a new one
      // This handles the case where session was restarted due to visibility change
      const currentSession = SessionService.getCurrentSession();
      if (!currentSession && user?.userId) {
        // Session was cleared (likely due to restart), create new one
        await startSession();
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to restore session', error);
    }

    return false;
  }, [user?.userId]);

  // End session (only on logout)
  const endSession = useCallback(async () => {
    const currentSession = SessionService.getCurrentSession();
    if (!currentSession || !user?.userId) return;

    try {
      await SessionService.endSession(currentSession.recordId, currentSession.startTime);
      setIsTracking(false);
      console.log('✅ Activity session ended');
    } catch (error) {
      console.error('❌ Failed to end activity session', error);
      setIsTracking(false);
    }
  }, [user?.userId]);

  // Set up cross-tab communication and visibility change handling
  useEffect(() => {
    const handleSessionCleared = () => {
      setIsTracking(false);
      // Session was cleared in another tab, update state
    };

    SessionService.setupStorageListener(handleSessionCleared);

    // Handle visibility changes for session restart
    const handleVisibilityChange = async () => {
      if (!document.hidden && user?.userId) {
        // Tab became visible - check if session needs restart
        const deviceInfo = getDeviceInfo();
        const userAgent = navigator.userAgent;
        const restarted = await SessionService.handleTabVisible(user.userId, deviceInfo, userAgent);
        
        if (restarted) {
          // Session was restarted, update tracking state
          setIsTracking(true);
        } else if (!SessionService.getCurrentSession() && user?.userId) {
          // Session was expired but not restarted (missing info), create new one
          await startSession();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      SessionService.removeStorageListener();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.userId, getDeviceInfo, startSession]);

  // Clean up session when user logs out or component unmounts
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Stop activity tracking on page unload
      SessionService.stopActivityTracking();
      // Note: We don't end the session here because the user might just be refreshing
      // The session will be restored on next page load, or expired if stale
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Clean up session on component unmount if user is no longer logged in
      if (!user?.userId) {
        SessionService.stopActivityTracking();
        endSession();
      }
    };
  }, [endSession, user?.userId]);

  return {
    isTracking,
    startSession,
    endSession,
    restoreSession,
    currentSessionId: SessionService.getCurrentSession()?.sessionId,
  };
}; 