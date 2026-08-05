// src/components/Layout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import SidebarMenu from "../SidebarMenu";
import Breadcrumb from "../Breadcrumb";

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sidebar-ı yığmaq/açmaq funksiyası
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const mainContentStyle = {
    marginLeft: isCollapsed ? "84px" : "254px",
    width: isCollapsed ? "calc(100% - 84px)" : "calc(100% - 254px)",
  };

  return (
    <div className="flex w-full min-h-screen">
      <div>
        <SidebarMenu isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </div>

      <div className="flex flex-col flex-1 transition-all duration-300" style={mainContentStyle}>
        <Header />
        <Breadcrumb />
        <main className="p-4 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
