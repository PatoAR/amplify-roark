import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { useTheme, Image, View } from '@aws-amplify/ui-react';
import App from '../../App';
import perkinsLogo from '../../assets/BaseLogo_v1_W.png';
import { UserPreferencesProvider } from '../../context/UserPreferencesContext';
import { SessionProvider } from '../../context/SessionContext';
import { NewsProvider } from '../../context/NewsContext';
import '@aws-amplify/ui-react/styles.css';

interface AuthWrapperProps {
  initialAuthState?: 'signIn' | 'signUp';
}

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
};

const AuthWrapper: React.FC<AuthWrapperProps> = ({ initialAuthState = 'signIn' }) => {
  return (
    <Authenticator 
      components={customComponents}
      initialState={initialAuthState}
    >
      <SessionProvider>
        <NewsProvider>
          <UserPreferencesProvider>
            <App />
          </UserPreferencesProvider>
        </NewsProvider>
      </SessionProvider>
    </Authenticator>
  );
};

export default AuthWrapper;
