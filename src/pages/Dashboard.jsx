import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import DashboardContent from '../components/DashboardContent';

const Dashboard = ({ user }) => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} />
        <DashboardContent />
      </div>
    </div>
  );
};

export default Dashboard;
