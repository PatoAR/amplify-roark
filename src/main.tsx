import React from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import outputs from '../amplify_outputs.json';

// Configure Amplify FIRST, before any other imports that might use Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: outputs.auth.user_pool_id,
      userPoolClientId: outputs.auth.user_pool_client_id,
      identityPoolId: outputs.auth.identity_pool_id,
      loginWith: {
        email: true,
        username: false,
        phone: false,
      },
    },
  },
  API: {
    GraphQL: {
      endpoint: outputs.data.url,
      region: outputs.data.aws_region,
      defaultAuthMode: 'userPool',
    },
  },
});

// Now import other components after Amplify is configured
import { BrowserRouter } from 'react-router-dom';
import CustomSignUp from "./components/CustomSignUp/CustomSignUp";
import LandingPage from "./components/LandingPage";
import { LanguageProvider } from './context/LanguageContext';
import "./index.css";

import './i18n'; // Initialize our custom translations



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
        </LanguageProvider>
      </BrowserRouter>
    ) : (
      // Otherwise, show the landing page with Authenticator integration
      <BrowserRouter>
        <LanguageProvider>
          <LandingPage />
        </LanguageProvider>
      </BrowserRouter>
    )}
  </React.StrictMode>
);