import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import { NewsManager } from "../NewsManager/NewsManager";
import "./Layout.css";
import { useTranslation } from "../../i18n";
import { useUserPreferences } from "../../context/UserPreferencesContext";

export interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = () => {
  const { t } = useTranslation();
  const { isDisclaimerVisible, dismissDisclaimer } = useUserPreferences();

  // Don't show disclaimer if user has dismissed it
  if (!isDisclaimerVisible) {
    return (
      <div className="layout-container">
        <Header />
        <NewsManager />
        <div className="page-container">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className="layout-container">
      <Header />
      <NewsManager />
      <div className="page-container">
        <Outlet />
      </div>
      <div className="disclaimer-footer" role="note" aria-live="polite">
        <div className="disclaimer-content">
          <span className="disclaimer-text">{t('disclaimer.text')}</span>
          <button
            className="disclaimer-dismiss-btn"
            onClick={dismissDisclaimer}
            aria-label="Understood"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export default Layout;