import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout: React.FC = () => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="page-content animate-fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
