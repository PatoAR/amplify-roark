import React, { useState, useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { useTheme, Image, View } from '@aws-amplify/ui-react';
import perkinsLogo from '/PerkinsLogo_Base_Gray.png';
import App from '../../App';
import { UserPreferencesProvider } from '../../context/UserPreferencesContext';
import { SessionProvider } from '../../context/SessionContext';
import { NewsProvider } from '../../context/NewsContext';
import { InactivityLogoutBanner } from '../InactivityLogoutBanner';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { useTranslation } from '../../i18n';
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
  const { t } = useTranslation();
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
        <div className="landing-header-right">
          <LanguageSwitcher />
          <div className="landing-auth-buttons">
            <button className="auth-btn auth-btn-secondary" onClick={handleSignIn}>
              {t('landing.signIn')}
            </button>
            <button className="auth-btn auth-btn-primary" onClick={handleSignUp}>
              {t('landing.signUp')}
            </button>
          </div>
        </div>
      </header>

      <main className="landing-main">
        <section className="hero-section">
          <p className="hero-subtitle">
            {t('landing.heroSubtitle')}
          </p>
          <p className="hero-description">
            {t('landing.heroDescription')}
          </p>
        </section>

        <section className="features-section">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">{t('landing.feature1Title')}</h3>
              <p className="feature-description">
                {t('landing.feature1Description')}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3 className="feature-title">{t('landing.feature2Title')}</h3>
              <p className="feature-description">
                {t('landing.feature2Description')}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">{t('landing.feature3Title')}</h3>
              <p className="feature-description">
                {t('landing.feature3Description')}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">{t('landing.feature4Title')}</h3>
              <p className="feature-description">
                {t('landing.feature4Description')}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎛️</div>
              <h3 className="feature-title">{t('landing.feature5Title')}</h3>
              <p className="feature-description">
                {t('landing.feature5Description')}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎁</div>
              <h3 className="feature-title">{t('landing.feature6Title')}</h3>
              <p className="feature-description">
                {t('landing.feature6Description')}
              </p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2 className="cta-title">{t('landing.ctaTitle')}</h2>
          <p className="cta-description">
            {t('landing.ctaDescription')}
          </p>
          <button className="cta-button" onClick={handleSignUp}>
            {t('landing.getStarted')}
          </button>
        </section>
      </main>

      <footer className="landing-footer">
        <p>{t('landing.copyright')}</p>
        <p className="contact-info">
          <span dangerouslySetInnerHTML={{ __html: t('landing.contactHelp') }} />
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
