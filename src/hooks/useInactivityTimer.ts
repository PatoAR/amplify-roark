// src/hooks/useInactivityTimer.ts
import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseInactivityTimerOptions {
  timeoutInMinutes?: number; // Inactivity timeout in minutes
  onLogout?: () => void; // Callback function on logout
  onActivity?: () => void; // Callback for user activity
  enabled?: boolean; // Whether the timer should be active
}

const DEFAULT_TIMEOUT_MINUTES = 120; // 2 hours

export const useInactivityTimer = ({
  timeoutInMinutes = DEFAULT_TIMEOUT_MINUTES,
  onLogout,
  onActivity,
  enabled = true,
}: UseInactivityTimerOptions = {}) => {
  const navigate = useNavigate();
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActiveRef = useRef<boolean>(enabled);

  const resetTimer = useCallback(() => {
    // Clear existing timer
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    // Only set timer if enabled
    if (!enabled || !isActiveRef.current) {
      return;
    }

    // Set the logout timer
    logoutTimerRef.current = setTimeout(() => {
      // Inactivity logout
      (async () => {
        try {
          // Store inactivity logout flag in localStorage for banner display
          localStorage.setItem('inactivity-logout', 'true');
          
          // Delegate logout to caller
          await onLogout?.();
        } catch (error) {
          console.error('Error during inactivity logout callback:', error);
        } finally {
          // Redirect to home page (landing page)
          navigate('/');
        }
      })();
    }, timeoutInMinutes * 60 * 1000);
  }, [timeoutInMinutes, onLogout, navigate, enabled]);

  const handleUserActivity = useCallback(() => {
    if (enabled && isActiveRef.current) {
      resetTimer();
      onActivity?.(); // Notify activity tracking system
    }
  }, [resetTimer, onActivity, enabled]);

  const clearTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  const enableTimer = useCallback(() => {
    isActiveRef.current = true;
    resetTimer();
  }, [resetTimer]);

  const disableTimer = useCallback(() => {
    isActiveRef.current = false;
    clearTimer();
  }, [clearTimer]);

  useEffect(() => {
    // Update active state when enabled prop changes
    isActiveRef.current = enabled;
    
    if (enabled) {
      // Start timer on component mount
      resetTimer();

      // Add event listeners for user activity
      const activityEvents = [
        'mousemove',
        'keydown',
        'click',
        'scroll',
        'touchstart',
      ];

      activityEvents.forEach((event) =>
        window.addEventListener(event, handleUserActivity)
      );

      // Clean up timer and event listeners on component unmount
      return () => {
        clearTimer();
        activityEvents.forEach((event) =>
          window.removeEventListener(event, handleUserActivity)
        );
      };
    } else {
      // Disable timer if not enabled
      clearTimer();
    }
  }, [handleUserActivity, enabled, resetTimer, clearTimer]);

  return { 
    resetInactivityTimer: resetTimer,
    clearInactivityTimer: clearTimer,
    enableInactivityTimer: enableTimer,
    disableInactivityTimer: disableTimer,
    isTimerActive: isActiveRef.current
  };
};