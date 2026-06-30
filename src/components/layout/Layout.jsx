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

  // Main content üçün dinamik Tailwind sinifləri
  const mainContentClasses = `flex flex-col flex-1 ${
    isCollapsed ? "ml-[84px]" : "ml-[254px]"
  } transition-all duration-300`;

  return (
    <div className="flex w-full min-h-screen">
      <div>
        <SidebarMenu isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </div>

      <div className={mainContentClasses}>
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
