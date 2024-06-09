// MainLayout.js
import React from 'react';
import Sidebar from "./scenes/global/ProSidebar";
import Topbar from "./scenes/global/Topbar";
import { Outlet, useOutletContext } from 'react-router-dom';
import LongLoader from './components/LongLoader';

const MainLayout = () => {
  const [loading, setLoading] = React.useState(false)
  return (
    <div className="app" style={{scrollBehavior:"smooth"}}>
      <Sidebar />
      
      {loading && <LongLoader />}
      <main className="content">
        <Topbar />
        <Outlet context={{loader: [loading, setLoading]}} />
      </main>
    </div>
  );
};

export default MainLayout;
