// src/hooks/useInactivityTimer.ts
import { useEffect, useRef, useCallback } from 'react';
import { signOut } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';

interface UseInactivityTimerOptions {
  timeoutInMinutes?: number; // Inactivity timeout in minutes
  warningBeforeLogoutInMinutes?: number; // Time before logout to show a warning
  onLogout?: () => void; // Callback function on logout
  onWarning?: (timeLeft: number) => void; // Callback for warning
  onActivity?: () => void; // Callback for user activity
}

const DEFAULT_TIMEOUT_MINUTES = 120;
const DEFAULT_WARNING_MINUTES = 10;  // minutes before logout

export const useInactivityTimer = ({
  timeoutInMinutes = DEFAULT_TIMEOUT_MINUTES,
  warningBeforeLogoutInMinutes = DEFAULT_WARNING_MINUTES,
  onLogout,
  onWarning,
  onActivity,
}: UseInactivityTimerOptions = {}) => {
  const navigate = useNavigate();
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimers = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    // Set the main logout timer
    logoutTimerRef.current = setTimeout(() => {
      console.log('User inactive, logging out...');
        signOut()
        .then(() => {
          onLogout?.();
          navigate('/'); // Redirect to home page
        })
        .catch((error:unknown) => console.error('Error signing out:', error));
    }, timeoutInMinutes * 60 * 1000);

    // Set the warning timer (if specified and makes sense)
    const warningTimeMs = (timeoutInMinutes - warningBeforeLogoutInMinutes) * 60 * 1000;
    if (warningTimeMs > 0 && warningBeforeLogoutInMinutes > 0) {
      warningTimerRef.current = setTimeout(() => {
        const timeLeftSeconds = warningBeforeLogoutInMinutes * 60;
        console.log(`Warning: Logging out in ${warningBeforeLogoutInMinutes} minutes due to inactivity.`);
        onWarning?.(timeLeftSeconds);
      }, warningTimeMs);
    }
  }, [timeoutInMinutes, warningBeforeLogoutInMinutes, onLogout, onWarning, navigate]);

  const handleUserActivity = useCallback(() => {
    resetTimers();
    onActivity?.(); // Notify activity tracking system
  }, [resetTimers, onActivity]);

  useEffect(() => {
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
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      activityEvents.forEach((event) =>
        window.removeEventListener(event, handleUserActivity)
      );
    };
  }, [handleUserActivity]);

  // Optional: Provide a way to manually reset the timer from outside
  return { resetInactivityTimer: resetTimers };
};