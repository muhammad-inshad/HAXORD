import React from 'react';
import Sidebar from './Sidebar';

const AdminDashboard = () => {



  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex">
    <Sidebar/>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-zinc-400 mt-2">Welcome back, Admin! Here is an overview of your platform.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h3 className="text-zinc-400 font-medium mb-1">Total Users</h3>
            <p className="text-4xl font-bold text-white">1,248</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h3 className="text-zinc-400 font-medium mb-1">Active Sessions</h3>
            <p className="text-4xl font-bold text-white">142</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h3 className="text-zinc-400 font-medium mb-1">System Status</h3>
            <p className="text-2xl font-bold text-emerald-400">All systems go</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
