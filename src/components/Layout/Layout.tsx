import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import { NewsManager } from "../NewsManager/NewsManager";
import "./Layout.css";

export interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = () => {
  return (
    <div className="layout-container">
      <Header />
      <NewsManager />
      <div className="page-container">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;