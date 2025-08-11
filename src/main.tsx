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
import { Authenticator, Image, View, useTheme } from '@aws-amplify/ui-react';
import App from "./App.tsx"
import CustomSignUp from "./components/CustomSignUp/CustomSignUp";
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import { SessionProvider } from './context/SessionContext';
import { NewsProvider } from './context/NewsContext';
import { LanguageProvider } from './context/LanguageContext';
import '@aws-amplify/ui-react/styles.css';
import "./index.css";
import perkinsLogo from './assets/BaseLogo_v1.png'

import './i18n'; // Initialize our custom translations

// Custom components to pass to the Authenticator
const customComponents = {
  Header() {
    const { tokens } = useTheme();

    return (
      <View textAlign="center" padding={tokens.space.large}>
        <Image
          alt="Perkins Business Intelligence"
          src={perkinsLogo}
          className="auth-logo"
        />
      </View>
    );
  },
}

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
      <BrowserRouter>
        <LanguageProvider>
          <SessionProvider>
            <NewsProvider>
              <UserPreferencesProvider>
                <CustomSignUp />
              </UserPreferencesProvider>
            </NewsProvider>
          </SessionProvider>
        </LanguageProvider>
      </BrowserRouter>
    ) : (
      // Otherwise, show the normal Authenticator flow
      <Authenticator components={customComponents}>
        <BrowserRouter>
          <LanguageProvider>
            <SessionProvider>
              <NewsProvider>
                <UserPreferencesProvider>
                  <App />
                </UserPreferencesProvider>
              </NewsProvider>
            </SessionProvider>
          </LanguageProvider>
        </BrowserRouter>
      </Authenticator>
    )}
  </React.StrictMode>
);