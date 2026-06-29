import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Info,
  Mail,
  HelpCircle,
  LayoutDashboard,
  Search,
  PlusCircle,
  FileText,
  MessageSquare,
  ShieldCheck,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();

  const isRoleAuthorizedForAdmin = user && ['Super Admin', 'Warden', 'Security Guard'].includes(user.role);

  // Styling helpers
  const activeClass = "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 transition-all border border-sky-100 dark:border-sky-900/30";
  const inactiveClass = "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all border border-transparent";

  const getLinkStyle = ({ isActive }) => (isActive ? activeClass : inactiveClass);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar shell */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200/80 bg-white/90 backdrop-blur-md px-4 pb-6 pt-20 transition-transform duration-300 dark:border-slate-800/80 dark:bg-slate-950/90 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={toggleSidebar}
          className="absolute top-4 right-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex h-full flex-col justify-between overflow-y-auto">
          <nav className="space-y-6">
            {/* PUBLIC NAVIGATION */}
            <div>
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Explore
              </p>
              <div className="space-y-1">
                <NavLink to="/" onClick={() => toggleSidebar()} className={getLinkStyle}>
                  <Home className="h-4 w-4" />
                  Home
                </NavLink>
                <NavLink to="/about" onClick={() => toggleSidebar()} className={getLinkStyle}>
                  <Info className="h-4 w-4" />
                  About
                </NavLink>
                <NavLink to="/contact" onClick={() => toggleSidebar()} className={getLinkStyle}>
                  <Mail className="h-4 w-4" />
                  Contact
                </NavLink>
                <NavLink to="/faq" onClick={() => toggleSidebar()} className={getLinkStyle}>
                  <HelpCircle className="h-4 w-4" />
                  FAQ
                </NavLink>
              </div>
            </div>

            {/* LOST & FOUND SERVICES */}
            <div>
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Services
              </p>
              <div className="space-y-1">
                <NavLink to="/lost-items" onClick={() => toggleSidebar()} className={getLinkStyle}>
                  <Search className="h-4 w-4" />
                  Lost Items
                </NavLink>
                <NavLink to="/found-items" onClick={() => toggleSidebar()} className={getLinkStyle}>
                  <PlusCircle className="h-4 w-4" />
                  Found Items
                </NavLink>
              </div>
            </div>

            {/* PERSONAL PANEL (If logged in) */}
            {user && (
              <div>
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  My Space
                </p>
                <div className="space-y-1">
                  <NavLink to="/dashboard" onClick={() => toggleSidebar()} className={getLinkStyle}>
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </NavLink>
                  <NavLink to="/claims" onClick={() => toggleSidebar()} className={getLinkStyle}>
                    <FileText className="h-4 w-4" />
                    Claims
                  </NavLink>
                  <NavLink to="/chat" onClick={() => toggleSidebar()} className={getLinkStyle}>
                    <MessageSquare className="h-4 w-4" />
                    Chat Portal
                  </NavLink>
                </div>
              </div>
            )}

            {/* ADMINISTRATIVE CONTROL PANEL */}
            {isRoleAuthorizedForAdmin && (
              <div>
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-rose-500 dark:text-rose-400 mb-2">
                  Admin Panel
                </p>
                <div className="space-y-1">
                  <NavLink to="/admin" onClick={() => toggleSidebar()} className={getLinkStyle}>
                    <ShieldCheck className="h-4 w-4" />
                    Admin Dashboard
                  </NavLink>
                </div>
              </div>
            )}
          </nav>

          {/* User brief at bottom */}
          {user && (
            <div className="mt-auto border-t border-slate-150 pt-4 dark:border-slate-800">
              <div className="flex items-center gap-3 px-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">
                    {user.name}
                  </p>
                  <p className="text-xs truncate text-slate-400">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
