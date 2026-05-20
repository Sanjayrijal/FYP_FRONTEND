import React from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from "./SideBar.jsx";

export default function AdminLayout() {
  return (
    <div className="bg-gray-50 flex overflow-hidden h-screen">
      {/* Sidebar */}
      <SideBar />
        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </div>
  
  );
}
