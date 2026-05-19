import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Settings, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950 p-6 flex flex-col h-screen sticky top-0">
        <div className="flex items-center gap-2 mb-10">
          <span className="text-2xl font-bold tracking-tighter text-violet-500">Haxord Admin</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-violet-600/10 text-violet-500 rounded-xl font-medium transition-colors">
            <Activity size={20} />
            Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl transition-colors">
            <Users size={20} />
            Manage Users
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl transition-colors">
            <Settings size={20} />
            Settings
          </button>
        </nav>

        <button 
          onClick={handleLogout}
          className="mt-auto w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

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
