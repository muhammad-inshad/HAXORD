import React from 'react'
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Settings, Activity, ShoppingBag } from 'lucide-react';
import { useAppDispatch } from '../../redux/hooks';
import { logout } from '../../redux/slices/authSlice';
import { FRONTEND_URL } from '../../constance/frontend/url';
import axios from 'axios';

const Sidebar = () => {
      const navigate = useNavigate();
  const dispatch = useAppDispatch();
      const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.removeItem('user');
    dispatch(logout());
    navigate('/');
  };

  return (
    <div>
        {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950 p-6 flex flex-col h-screen sticky top-0">
        <div className="flex items-center gap-2 mb-10">
          <span className="text-2xl font-bold tracking-tighter text-violet-500">Haxord Admin</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => navigate(FRONTEND_URL.ADMIN_DASHBOARD)}className="w-full flex items-center gap-3 px-4 py-3 bg-violet-600/10 text-violet-500 rounded-xl font-medium transition-colors">
            <Activity size={20} />
            Dashboard
          </button>
          <button  onClick={() => navigate(FRONTEND_URL.ADMIN_USERS)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl transition-colors">
            <Users size={20} />
            Manage Users
          </button>
          <button onClick={() => navigate(FRONTEND_URL.ADMIN_ADD_PRODUCT)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl transition-colors">
            <Settings size={20} />
            add product
          </button>
           <button onClick={() => navigate(FRONTEND_URL.ADMIN_ORDERS)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl transition-colors">
            <ShoppingBag size={20} />
            orders
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
    </div>
  )
}

export default Sidebar
function dispatch(arg0: any) {
    throw new Error('Function not implemented.');
}

