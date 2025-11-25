import React, { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import Header from "../Header/Header";
import { NewsManager } from "../NewsManager/NewsManager";
import { TabTitleUpdater } from "./TabTitleUpdater";
import OptimalUsageModal from "../OptimalUsageModal";
import "./Layout.css";
import { useTranslation } from "../../i18n";
import { useUserPreferences } from "../../context/UserPreferencesContext";

export interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = () => {
  const { t } = useTranslation();
  const { isDisclaimerVisible, dismissDisclaimer } = useUserPreferences();
  const [showOptimalUsageModal, setShowOptimalUsageModal] = useState(false);

  // Check if user has opted to not see the modal again
  useEffect(() => {
    const modalHidden = localStorage.getItem('perkins-optimal-usage-modal-hidden');
    if (!modalHidden) {
      // Show the modal immediately on login as the first thing users see
      setShowOptimalUsageModal(true);
    }
  }, []);

  // Don't show disclaimer if user has dismissed it
  if (!isDisclaimerVisible) {
    return (
      <div className="layout-container">
        <Header />
        <NewsManager />
        <TabTitleUpdater />
        <div className="page-container">
          <Outlet />
        </div>
        <OptimalUsageModal
          show={showOptimalUsageModal}
          onClose={() => setShowOptimalUsageModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="layout-container">
      <Header />
      <NewsManager />
      <TabTitleUpdater />
      <div className="page-container">
        <Outlet />
      </div>
      <div className="disclaimer-footer" role="note" aria-live="polite">
        <div className="disclaimer-content">
          <span className="disclaimer-text">{t('disclaimer.text')}</span>
          <button
            className="disclaimer-dismiss-btn"
            onClick={dismissDisclaimer}
            aria-label={t('disclaimer.understood')}
          >
            {t('disclaimer.understood')}
          </button>
        </div>
        <div className="legal-footer-links">
          <Link to="/terms" className="legal-footer-link">{t('legal.footerLinks.terms')}</Link>
          <span className="legal-footer-separator">|</span>
          <Link to="/privacy" className="legal-footer-link">{t('legal.footerLinks.privacy')}</Link>
        </div>
      </div>
      <OptimalUsageModal
        show={showOptimalUsageModal}
        onClose={() => setShowOptimalUsageModal(false)}
      />
    </div>
  );
};

export default Layout;