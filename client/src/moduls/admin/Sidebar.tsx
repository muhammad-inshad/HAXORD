import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Users, Settings, Activity, ShoppingBag, Menu, X } from 'lucide-react';
import { useAppDispatch } from '../../redux/hooks';
import { logout } from '../../redux/slices/authSlice';
import { FRONTEND_URL } from '../../constance/frontend/url';
import axios from 'axios';

const navItems = [
  { label: 'Dashboard', icon: Activity, path: FRONTEND_URL.ADMIN_DASHBOARD },
  { label: 'Manage Users', icon: Users, path: FRONTEND_URL.ADMIN_USERS },
  { label: 'Add Product', icon: Settings, path: FRONTEND_URL.ADMIN_ADD_PRODUCT },
  { label: 'Orders', icon: ShoppingBag, path: FRONTEND_URL.ADMIN_ORDERS },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between mb-10">
        <span className="text-xl font-bold tracking-tighter text-violet-500">Haxord Admin</span>
        {/* Close button — only visible on mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => handleNav(path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-sm ${
                isActive
                  ? 'bg-violet-600/10 text-violet-500'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors text-sm"
      >
        <LogOut size={16} />
        Logout
      </button>
    </>
  );

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800">
        <span className="text-lg font-bold tracking-tighter text-violet-500">Haxord Admin</span>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* ── Mobile drawer backdrop ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-zinc-950 border-r border-zinc-800 p-6 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-zinc-800 bg-zinc-950 p-6 flex-col h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;