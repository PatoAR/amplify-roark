import { useState } from 'react';
import { Routes, Route} from "react-router-dom";
import Layout from "./components/Layout";
import NewsSocketClient from "./pages/newsfeed";
import UserSettings from "./pages/settings";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useInactivityTimer } from './hooks/useInactivityTimer';
import { InactivityDialog } from './hooks/InactivityWarning';
import "./App.css"

export default function App() {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const { signOut } = useAuthenticator();
  const [isWarningDialogOpen, setWarningDialogOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const { resetInactivityTimer } = useInactivityTimer({
    onLogout: () => {
      setWarningDialogOpen(false); // Ensure dialog is closed on final logout
    },
    onWarning: (time) => {
      setTimeLeft(time);
      setWarningDialogOpen(true);
    }
  });

  const handleStayLoggedIn = () => {
    setWarningDialogOpen(false);
    resetInactivityTimer();
  };

  const handleImmediateLogout = () => {
    setWarningDialogOpen(false);
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
        </Route>
      </Routes>
    </div>
  );
};