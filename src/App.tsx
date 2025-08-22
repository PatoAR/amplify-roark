import { useState, useEffect } from 'react';
import { Routes, Route} from "react-router-dom";
import Layout from "./components/Layout/Layout";
import NewsSocketClient from "./pages/newsfeed/NewsSocketClient";
import UserSettings from "./pages/settings/UserSettings";
import PasswordSettings from "./pages/settings/PasswordSettings";
import DeleteAccountSettings from "./pages/settings/DeleteAccountSettings";
import ReferralSettings from "./pages/settings/ReferralSettings";
import { AnalyticsDashboard } from "./components/Analytics/AnalyticsDashboard";
import CustomSignUp from "./components/CustomSignUp/CustomSignUp";
import { useSession } from './context/SessionContext';
import { useInactivityTimer } from './hooks/useInactivityTimer';
import { InactivityDialog } from './hooks/InactivityWarning';
import { AuthErrorFallback } from './components/AuthErrorFallback';
import "./App.css"

export default function App() {
  const [isWarningDialogOpen, setWarningDialogOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  // Auth error is now provided by SessionContext
  const [isInitializing, setIsInitializing] = useState(true);

  // Use session context
  const { 
    isAuthenticated, 
    isSessionActive, 
    authStatus,
    logout,
    trackPageViewIfActive,
    authError,
    clearAuthError,
  } = useSession();

  // Handle inactivity timer separately (only when authenticated)
  const { resetInactivityTimer } = useInactivityTimer({
    timeoutInMinutes: 120,
    warningBeforeLogoutInMinutes: 10,
    enabled: isAuthenticated && isSessionActive, // Only enable when authenticated and session is active
    onLogout: async () => {
      setWarningDialogOpen(false);
      await logout();
    },
    onWarning: (time) => {
      setTimeLeft(time);
      setWarningDialogOpen(true);
    },
    onActivity: () => {
      // Track user activity when inactivity timer is reset
      trackPageViewIfActive();
    }
  });

  // Handle authentication state changes and prevent blank screens
  useEffect(() => {
    // Auth state changed
    
    // If we're still configuring, keep showing loading
    if (authStatus === 'configuring') {
      setIsInitializing(true);
      return;
    }

    // If we have a clear authenticated state, we're ready
    if (authStatus === 'authenticated' && isAuthenticated && isSessionActive) {
      setIsInitializing(false);
      clearAuthError();
      return;
    }

    // If we have a clear unauthenticated state, we're ready
    if (authStatus === 'unauthenticated') {
      setIsInitializing(false);
      clearAuthError();
      return;
    }

    // If authStatus is authenticated but session state is unclear, 
    // give it more time to resolve (this is normal during session startup)
    if (authStatus === 'authenticated' && (!isAuthenticated || !isSessionActive)) {
      // Don't show error immediately, just keep loading
      setIsInitializing(true);
      return;
    }
  }, [authStatus, isAuthenticated, isSessionActive]);

  // Reset inactivity timer when session state changes
  useEffect(() => {
    if (isAuthenticated && isSessionActive) {
      resetInactivityTimer();
    }
  }, [isAuthenticated, isSessionActive, resetInactivityTimer]);

  // Handle visibility change to detect when user returns from idle
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ User returned to tab, checking authentication state...');
        
        // Only show error if we've been in an unclear state for a long time
        if (authStatus === 'authenticated' && (!isAuthenticated || !isSessionActive)) {
          // Give more time for the session to start up
          setTimeout(() => {
            if (authStatus === 'authenticated' && (!isAuthenticated || !isSessionActive)) {
           // Authentication state unclear after visibility change
              // Don't show error, just log the warning
            }
          }, 5000); // Wait 5 seconds instead of 2
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [authStatus, isAuthenticated, isSessionActive]);

  // Remove the periodic health check as it's too aggressive
  // The session manager will handle authentication state properly

  const handleStayLoggedIn = () => {
    setWarningDialogOpen(false);
    resetInactivityTimer();
  };

  const handleImmediateLogout = async () => {
    setWarningDialogOpen(false);
    await logout();
  };

  const handleAuthErrorRetry = () => {
    clearAuthError();
    setIsInitializing(true);
    // Force a page reload to reset authentication state
    window.location.reload();
  };

  const handleAuthErrorLogout = async () => {
    clearAuthError();
    await logout();
  };

  // Show authentication error fallback
  if (authError) {
    return (
      <AuthErrorFallback
        error={authError}
        onRetry={handleAuthErrorRetry}
        onLogout={handleAuthErrorLogout}
      />
    );
  }

  // Show loading state while authentication is being determined
  if (isInitializing || authStatus === 'configuring') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  // If user is not authenticated, show nothing (Authenticator will handle login)
  if (authStatus === 'unauthenticated') {
    // Referral detection is now handled in main.tsx
    // Just let the default Authenticator handle it
    return null;
  }

  // If authStatus is authenticated, allow the app to run even if session state is unclear
  // This prevents blocking the app during normal session startup
  if (authStatus === 'authenticated') {
    return (
      <div>
        <InactivityDialog
          isOpen={isWarningDialogOpen}
          timeLeft={timeLeft}
          onConfirm={handleStayLoggedIn}
          onCancel={handleImmediateLogout}
        />
        <Routes>
          <Route path="/" element={<Layout />} >
            <Route index element={<NewsSocketClient />} />
            <Route path="settings" element={<UserSettings />} />
            <Route path="settings/password" element={<PasswordSettings />} />
            <Route path="settings/delete-account" element={<DeleteAccountSettings />} />
            <Route path="settings/referral" element={<ReferralSettings />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="signup" element={<CustomSignUp />} />
          </Route>
        </Routes>
      </div>
    );
  }

  // Fallback for any other state
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px',
      color: '#666'
    }}>
      <div>
        <p>Authentication state is unclear.</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            marginTop: '10px', 
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}