import { useState } from 'react';
import { Routes, Route} from "react-router-dom";
import Layout from "./components/Layout";
import NewsSocketClient from "./pages/newsfeed";
import UserSettings from "./pages/settings";
import PasswordSettings from "./pages/settings/PasswordSettings";
import DeleteAccountSettings from "./pages/settings/DeleteAccountSettings";
import ReferralSettings from "./pages/settings/ReferralSettings";
import { AnalyticsDashboard } from "./components/Analytics/AnalyticsDashboard";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useInactivityTimer } from './hooks/useInactivityTimer';
import { useActivityTracking } from './hooks/useActivityTracking';
import { InactivityDialog } from './hooks/InactivityWarning';
import "./App.css"

export default function App() {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const { signOut } = useAuthenticator();
  const [isWarningDialogOpen, setWarningDialogOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Initialize activity tracking
  const { 
    isTracking, 
    trackPageView, 
    endSession 
  } = useActivityTracking();

  const { resetInactivityTimer } = useInactivityTimer({
    onLogout: () => {
      setWarningDialogOpen(false); // Ensure dialog is closed on final logout
      endSession(); // End activity tracking session
    },
    onWarning: (time) => {
      setTimeLeft(time);
      setWarningDialogOpen(true);
    },
    onActivity: () => {
      // Track user activity when inactivity timer is reset
      if (isTracking) {
        trackPageView();
      }
    }
  });

  const handleStayLoggedIn = () => {
    setWarningDialogOpen(false);
    resetInactivityTimer();
  };

  const handleImmediateLogout = () => {
    setWarningDialogOpen(false);
    endSession(); // End activity tracking session
    signOut();
  };

  // Only render routes if authenticated
  if (authStatus !== 'authenticated') {
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
};