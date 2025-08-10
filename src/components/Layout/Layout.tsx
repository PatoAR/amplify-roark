import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import { NewsManager } from "../NewsManager/NewsManager";
import "./Layout.css";
import { useTranslation } from "../../i18n";

export interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = () => {
  const { t } = useTranslation();
  
  return (
    <div className="layout-container">
      <Header />
      <NewsManager />
      <div className="page-container">
        <Outlet />
      </div>
      <div className="disclaimer-footer" role="note" aria-live="polite">
        {t('disclaimer.text')}
      </div>
    </div>
  );
};

export default Layout;