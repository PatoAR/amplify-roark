// src/hooks/useInactivityTimer.ts
import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseInactivityTimerOptions {
  timeoutInMinutes?: number; // Inactivity timeout in minutes
  warningBeforeLogoutInMinutes?: number; // Time before logout to show a warning
  onLogout?: () => void; // Callback function on logout
  onWarning?: (timeLeft: number) => void; // Callback for warning
  onActivity?: () => void; // Callback for user activity
  enabled?: boolean; // Whether the timer should be active
}

const DEFAULT_TIMEOUT_MINUTES = 120;
const DEFAULT_WARNING_MINUTES = 10;  // minutes before logout

export const useInactivityTimer = ({
  timeoutInMinutes = DEFAULT_TIMEOUT_MINUTES,
  warningBeforeLogoutInMinutes = DEFAULT_WARNING_MINUTES,
  onLogout,
  onWarning,
  onActivity,
  enabled = true,
}: UseInactivityTimerOptions = {}) => {
  const navigate = useNavigate();
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActiveRef = useRef<boolean>(enabled);

  const resetTimers = useCallback(() => {
    // Clear existing timers
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }

    // Only set timers if enabled
    if (!enabled || !isActiveRef.current) {
      return;
    }

    // Set the main logout timer
    logoutTimerRef.current = setTimeout(() => {
      // Inactivity logout
      (async () => {
        try {
          // Delegate logout to caller (e.g., centralized SessionContext.logout)
          await onLogout?.();
        } catch (error) {
          console.error('Error during inactivity logout callback:', error);
        } finally {
          navigate('/'); // Redirect to home page
        }
      })();
    }, timeoutInMinutes * 60 * 1000);

    // Set the warning timer (if specified and makes sense)
    const warningTimeMs = (timeoutInMinutes - warningBeforeLogoutInMinutes) * 60 * 1000;
    if (warningTimeMs > 0 && warningBeforeLogoutInMinutes > 0) {
      warningTimerRef.current = setTimeout(() => {
        const timeLeftSeconds = warningBeforeLogoutInMinutes * 60;
        // Inactivity warning
        onWarning?.(timeLeftSeconds);
      }, warningTimeMs);
    }
  }, [timeoutInMinutes, warningBeforeLogoutInMinutes, onLogout, onWarning, navigate, enabled]);

  const handleUserActivity = useCallback(() => {
    if (enabled && isActiveRef.current) {
      resetTimers();
      onActivity?.(); // Notify activity tracking system
    }
  }, [resetTimers, onActivity, enabled]);

  const clearTimers = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }, []);

  const enableTimer = useCallback(() => {
    isActiveRef.current = true;
    resetTimers();
  }, [resetTimers]);

  const disableTimer = useCallback(() => {
    isActiveRef.current = false;
    clearTimers();
  }, [clearTimers]);

  useEffect(() => {
    // Update active state when enabled prop changes
    isActiveRef.current = enabled;
    
    if (enabled) {
      // Start timers on component mount
      resetTimers();

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

      // Clean up timers and event listeners on component unmount
      return () => {
        clearTimers();
        activityEvents.forEach((event) =>
          window.removeEventListener(event, handleUserActivity)
        );
      };
    } else {
      // Disable timers if not enabled
      clearTimers();
    }
  }, [handleUserActivity, enabled, resetTimers, clearTimers]);

  // Optional: Provide a way to manually reset the timer from outside
  return { 
    resetInactivityTimer: resetTimers,
    clearInactivityTimer: clearTimers,
    enableInactivityTimer: enableTimer,
    disableInactivityTimer: disableTimer,
    isTimerActive: isActiveRef.current
  };
};