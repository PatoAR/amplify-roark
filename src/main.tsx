import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import outputs from '../amplify_outputs.json';

// Configure Amplify FIRST, before any other imports that might use Amplify
Amplify.configure(outputs);

// Now import other components after Amplify is configured
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CustomSignUp from "./components/CustomSignUp/CustomSignUp";
import LandingPage from "./components/LandingPage";
import AuthWrapper from "./components/AuthWrapper";
import TermsAndConditions from "./pages/legal/TermsAndConditions";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import { LanguageProvider } from './context/LanguageContext';
import { CookieConsent } from './components/CookieConsent';
import "./index.css";

import './i18n'; // Initialize our custom translations

// Main app component that handles authentication routing
const MainApp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check authentication status and listen for changes
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const setupAuth = async () => {
      try {
        // Check if user is authenticated using Amplify
        const user = await getCurrentUser();
        setIsAuthenticated(!!user);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
      
      // Set up a listener for authentication state changes
      try {
        unsubscribe = Hub.listen('auth', (data) => {
          if (data.payload.event === 'signedIn') {
            setIsAuthenticated(true);
          } else if (data.payload.event === 'signedOut') {
            setIsAuthenticated(false);
          }
        });
      } catch (error) {
        console.error('Failed to set up auth listener:', error);
      }
    };
    
    setupAuth();
    
    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (isLoading) {
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

  if (isAuthenticated) {
    return <AuthWrapper />;
  } else {
    return (
      <Routes>
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    );
  }
};

// Check for referral code in URL before rendering
const checkForReferralCode = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref');
};

const referralCode = checkForReferralCode();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {referralCode ? (
      // If there's a referral code, show custom signup directly
      // Only include essential contexts that don't depend on useAuthenticator
      <BrowserRouter>
        <LanguageProvider>
          <CustomSignUp />
          <CookieConsent />
        </LanguageProvider>
      </BrowserRouter>
    ) : (
      // Otherwise, show the main app with authentication routing
      <BrowserRouter>
        <LanguageProvider>
          <MainApp />
          <CookieConsent />
        </LanguageProvider>
      </BrowserRouter>
    )}
  </React.StrictMode>
);