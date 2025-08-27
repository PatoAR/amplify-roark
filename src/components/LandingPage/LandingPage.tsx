import React, { useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { useTheme, Image, View } from '@aws-amplify/ui-react';
import perkinsLogo from '../../assets/BaseLogo_v1_W.png';
import App from '../../App';
import { UserPreferencesProvider } from '../../context/UserPreferencesContext';
import { SessionProvider } from '../../context/SessionContext';
import { NewsProvider } from '../../context/NewsContext';
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

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowAuth(true);
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setShowAuth(true);
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
            Hybrid real + artificial intelligence platform for business intelligence
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
              <h3 className="feature-title">Real-time Intelligence</h3>
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
          </div>
        </section>

        <section className="cta-section">
          <h2 className="cta-title">Ready to transform your business intelligence?</h2>
          <p className="cta-description">
            Join Perkins Intel and gain access to the most comprehensive, real-time 
            business intelligence platform available.
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
