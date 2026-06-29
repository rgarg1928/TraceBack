import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
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
  X,
  Smartphone,
  Download,
  QrCode
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showDownloadModal, setShowDownloadModal] = useState(false);

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

          {/* DOWNLOAD APP BANNER */}
          <div className="mt-6 px-3">
            <div 
              onClick={() => {
                setShowDownloadModal(true);
                toggleSidebar();
              }}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-500/10 to-indigo-500/10 hover:from-sky-500/20 hover:to-indigo-500/20 border border-sky-500/20 dark:border-sky-500/10 cursor-pointer transition-all duration-300 group flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Download App</p>
                <p className="text-[10px] text-slate-400">Get official Android APK</p>
              </div>
              <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500 transition-colors shrink-0" />
            </div>
          </div>

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

      {/* MOBILE APP DOWNLOAD MODAL */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-up">
            <button
              onClick={() => setShowDownloadModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Download TraceBack App</h3>
              <p className="text-xs text-slate-400 px-4">
                Access smart keyword matching, in-app chat, and upload pictures of items directly from your mobile device.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800/80 rounded-2xl flex items-center gap-4">
              <div className="bg-white p-2 rounded-xl border border-slate-250 dark:border-slate-800 flex items-center justify-center shrink-0">
                <QrCode className="w-14 h-14 text-slate-800" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold">Scan QR to Install</p>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Open your phone camera to scan the code and download the Android APK package directly.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  showToast('Starting download: TraceBack_CU_v1.0.apk...', 'success');
                  setShowDownloadModal(false);
                }}
                className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Android APK
              </button>
              
              <button
                disabled
                className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 font-semibold text-sm cursor-not-allowed border border-slate-200/50 dark:border-slate-800/20"
              >
                iOS Version (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
