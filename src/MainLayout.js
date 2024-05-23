// MainLayout.js
import React from 'react';
import Sidebar from "./scenes/global/ProSidebar";
import Topbar from "./scenes/global/Topbar";
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <Topbar />
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
