import { useState } from 'react';
import { Routes, Route} from "react-router-dom";
import Layout from "./components/Layout/Layout";
import NewsSocketClient from "./pages/newsfeed/NewsSocketClient";
import UserSettings from "./pages/settings/UserSettings";
import PasswordSettings from "./pages/settings/PasswordSettings";
import DeleteAccountSettings from "./pages/settings/DeleteAccountSettings";
import ReferralSettings from "./pages/settings/ReferralSettings";
import { AnalyticsDashboard } from "./components/Analytics/AnalyticsDashboard";
import { useSession } from './context/SessionContext';
import { useInactivityTimer } from './hooks/useInactivityTimer';
import { InactivityDialog } from './hooks/InactivityWarning';
import { AuthErrorFallback } from './components/AuthErrorFallback';
import "./App.css"

export default function App() {
  const [isWarningDialogOpen, setWarningDialogOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [authError, setAuthError] = useState<Error | null>(null);

  // Use session context
  const { 
    isAuthenticated, 
    isSessionActive, 
    authStatus,
    logout,
    trackPageViewIfActive 
  } = useSession();

  // Handle inactivity timer separately (only when authenticated)
  const { resetInactivityTimer } = useInactivityTimer({
    timeoutInMinutes: 120,
    warningBeforeLogoutInMinutes: 10,
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

  const handleStayLoggedIn = () => {
    setWarningDialogOpen(false);
    resetInactivityTimer();
  };

  const handleImmediateLogout = async () => {
    setWarningDialogOpen(false);
    await logout();
  };

  const handleAuthErrorRetry = () => {
    setAuthError(null);
    // The session manager will automatically retry authentication
  };

  const handleAuthErrorLogout = async () => {
    setAuthError(null);
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
  if (authStatus === 'configuring') {
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

  // Only render routes if authenticated and session is active
  if (!isAuthenticated || !isSessionActive) {
    return null;
  }

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
        </Route>
      </Routes>
    </div>
  );
}