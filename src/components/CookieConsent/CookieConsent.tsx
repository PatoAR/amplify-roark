import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n';
import { Link } from 'react-router-dom';
import './CookieConsent.css';

const COOKIE_CONSENT_KEY = 'perkins-cookie-consent';

export const CookieConsent: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="cookie-consent-banner" role="dialog" aria-modal="true" aria-labelledby="cookie-consent-title">
      <div className="cookie-consent-content">
        <div className="cookie-consent-text">
          <span id="cookie-consent-title" className="cookie-consent-title">
            {t('cookieConsent.title')}
          </span>
          <span className="cookie-consent-message">
            {t('cookieConsent.message')}
            {' '}
            <Link to="/privacy" className="cookie-consent-link">
              {t('cookieConsent.learnMore')}
            </Link>
          </span>
        </div>
        <div className="cookie-consent-actions">
          <button
            className="cookie-consent-btn cookie-consent-btn-decline"
            onClick={handleDecline}
            aria-label={t('cookieConsent.decline')}
          >
            {t('cookieConsent.decline')}
          </button>
          <button
            className="cookie-consent-btn cookie-consent-btn-accept"
            onClick={handleAccept}
            aria-label={t('cookieConsent.accept')}
          >
            {t('cookieConsent.accept')}
          </button>
        </div>
      </div>
    </div>
  );
};

