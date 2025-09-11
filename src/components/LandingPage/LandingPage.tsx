import React, { useState, useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { useTheme, Image, View } from '@aws-amplify/ui-react';
import perkinsLogo from '/PerkinsLogo_Base_Gray.png';
import App from '../../App';
import { UserPreferencesProvider } from '../../context/UserPreferencesContext';
import { SessionProvider } from '../../context/SessionContext';
import { NewsProvider } from '../../context/NewsContext';
import { InactivityLogoutBanner } from '../InactivityLogoutBanner';
import '@aws-amplify/ui-react/styles.css';
import './LandingPage.css';

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

const LandingPage: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [showInactivityBanner, setShowInactivityBanner] = useState(false);

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowAuth(true);
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setShowAuth(true);
  };

  // Check for inactivity logout on component mount
  useEffect(() => {
    const inactivityLogout = localStorage.getItem('inactivity-logout');
    if (inactivityLogout === 'true') {
      setShowInactivityBanner(true);
      // Clear the flag after showing the banner
      localStorage.removeItem('inactivity-logout');
    }
  }, []);

  const handleDismissInactivityBanner = () => {
    setShowInactivityBanner(false);
  };

  // If user wants to authenticate, show the authenticator
  if (showAuth) {
    return (
      <Authenticator 
        components={customComponents}
        initialState={authMode === 'signup' ? 'signUp' : 'signIn'}
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
  }

  return (
    <div className="landing-page">
      {/* Inactivity Logout Banner */}
      {showInactivityBanner && (
        <InactivityLogoutBanner
          onDismiss={handleDismissInactivityBanner}
        />
      )}
      
      <header className="landing-header">
        <div className="landing-logo">
          <img src={perkinsLogo} alt="Perkins Intel" />
        </div>
        <div className="landing-auth-buttons">
          <button className="auth-btn auth-btn-secondary" onClick={handleSignIn}>
            Sign In
          </button>
          <button className="auth-btn auth-btn-primary" onClick={handleSignUp}>
            Sign Up
          </button>
        </div>
      </header>

      <main className="landing-main">
        <section className="hero-section">
          <p className="hero-subtitle">
            From Data to Clarity: Hybrid Intelligence on Business & Markets
          </p>
          <p className="hero-description">
            Permanently sourcing and processing business, markets, and company information 
            from across the web to deliver meaningful insights when you need them most.
          </p>
        </section>

        <section className="features-section">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Real Intelligence</h3>
              <p className="feature-description">
                Continuous monitoring of news articles, regulatory reports, company newswires, 
                statistical data, and financial filings.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3 className="feature-title">AI-Powered Processing</h3>
              <p className="feature-description">
                Advanced artificial intelligence that transforms raw data into actionable 
                business insights and market intelligence.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Timely Delivery</h3>
              <p className="feature-description">
                Information reaches you when it matters most, ensuring you never miss 
                critical business opportunities or risks.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Meaningful Insights</h3>
              <p className="feature-description">
                Data is processed and presented in a way that makes sense for your 
                business decisions and strategic planning.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎛️</div>
              <h3 className="feature-title">Customized Content</h3>
              <p className="feature-description">
                Tailor your news feed to your specific industry and geographic focus. 
                Perkins learns your preferences to deliver only the most relevant business intelligence.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎁</div>
              <h3 className="feature-title">Always Free Through Referrals</h3>
              <p className="feature-description">
                Keep Perkins free forever by inviting friends. Earn 3 months of free access 
                for each successful referral, or subscribe for unlimited access without referrals.
              </p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2 className="cta-title">Ready to transform your business intelligence?</h2>
          <p className="cta-description">
            Gain access to Perkins comprehensive business intelligence platform. 
            Keep it free through referrals or subscribe for unlimited access.
          </p>
          <button className="cta-button" onClick={handleSignUp}>
            Get Started Today
          </button>
        </section>
      </main>

      <footer className="landing-footer">
        <p>&copy; 2024 Perkins Intel. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
