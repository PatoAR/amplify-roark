import React from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import { BrowserRouter } from 'react-router-dom';
import { Authenticator, Image, View, useTheme } from '@aws-amplify/ui-react';
import App from "./App.tsx"
import outputs from '../amplify_outputs.json';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import { SessionProvider } from './context/SessionContext';
import { NewsProvider } from './context/NewsContext';
import '@aws-amplify/ui-react/styles.css';
import "./index.css";
import perkinsLogo from './assets/BaseLogo_v1.png'

import { I18n } from 'aws-amplify/utils';
import { translations } from '@aws-amplify/ui-react';
I18n.putVocabularies(translations);

// Configure Amplify with the correct format
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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Authenticator components={customComponents}>
      <BrowserRouter>
        <SessionProvider>
          <NewsProvider>
            <UserPreferencesProvider>
              <App />
            </UserPreferencesProvider>
          </NewsProvider>
        </SessionProvider>
      </BrowserRouter>
    </Authenticator>
  </React.StrictMode>
);