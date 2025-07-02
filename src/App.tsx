import { Routes, Route} from "react-router-dom";
import Layout from "./components/Layout";
import NewsSocketClient from "./pages/newsfeed";
import UserSettings from "./pages/settings";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useInactivityTimer } from './hooks/useInactivityTimer';
import "./App.css"

export default function App() {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  // Use the inactivity timer only if the user is authenticated
  useInactivityTimer({
    onLogout: () => {
      //alert('You have been logged out due to inactivity.');
    },
    onWarning: () => {
      //alert(`You will be logged out in ${Math.ceil(timeLeft / 60)} minutes due to inactivity.`);
    }
  });

  // Only render routes if authenticated
  if (authStatus !== 'authenticated') {
    return null;
  }

  return (
    <div>
      <Routes>
        <Route path="/" element={<Layout />} >
          <Route index element={<NewsSocketClient />} />
          <Route path="settings" element={<UserSettings />} />
        </Route>
      </Routes>
    </div>
  );
};