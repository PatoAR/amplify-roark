import React from "react";
import { Outlet } from "react-router-dom";
import "./Layout.css";

export interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = () => {
  return (
    <div className="layout-container">
      <div className="page-container">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;