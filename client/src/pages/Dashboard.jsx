import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getImageUrl } from '../utils/imageHelper';
import {
  User, Phone, Mail, Edit2, Lock, Upload, UserCheck,
  AlertCircle, CheckCircle, FileText, Award, Loader2,
  Camera, Shield, TrendingUp, Activity, Clock
} from 'lucide-react';

// ── Skeleton Loader ──────────────────────────────────────────
const StatSkeleton = () => (
  <div className="p-5 rounded-2xl glass-panel space-y-3">
    <div className="skeleton h-3 w-24 rounded" />
    <div className="skeleton h-8 w-16 rounded" />
  </div>
);

// ── Animated stat card ──────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay, ease: [0.4, 0, 0.2, 1] }}
    className="p-5 rounded-2xl glass-panel card-hover space-y-3 relative overflow-hidden group"
  >
    <div className={`absolute right-3 top-3 w-10 h-10 rounded-xl flex items-center justify-center bg-${color}-500/10 text-${color}-500 group-hover:scale-110 transition-transform`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-12">{label}</p>
    <p className="text-3xl font-extrabold stat-num tabular-nums">{value}</p>
  </motion.div>
);

// ── Timeline entry ──────────────────────────────────────────
const TimelineItem = ({ icon: Icon, title, time, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay }}
    className="relative flex gap-4 pl-10"
  >
    <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center bg-${color}-500/10 border-2 border-${color}-500/30 text-${color}-500 z-10 -translate-x-0.5`}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 pb-6">
      <p className="text-xs font-semibold">{title}</p>
      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />{time}</p>
    </div>
  </motion.div>
);

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

const Dashboard = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState({ totalLost: 0, totalFound: 0, activeClaims: 0, returnedItems: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // Form states
  const [profileData, setProfileData] = useState({ name: '', contactNumber: '' });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name || '', contactNumber: user.contactNumber || '' });
      setProfilePreview(user.profilePic || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const res = await axios.get('/api/users/stats');
        if (res.data.success) setStats(res.data.stats);
      } catch (err) { console.error(err); }
      finally { setStatsLoading(false); }
    };
    fetchStats();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name || !profileData.contactNumber) {
      toast.error('Please fill out name and contact number');
      return;
    }
    setUpdatingProfile(true);
    const formData = new FormData();
    formData.append('name', profileData.name);
    formData.append('contactNumber', profileData.contactNumber);
    if (profilePicFile) formData.append('profilePic', profilePicFile);

    const result = await updateProfile(formData);
    setUpdatingProfile(false);
    if (result?.success) {
      toast.success('Profile updated successfully!');
      setProfilePicFile(null);
    } else {
      toast.error(result?.message || 'Profile update failed');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    if (!currentPassword || !newPassword || !confirmPassword) return toast.error('Fill all password fields');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');

    setUpdatingPassword(true);
    const result = await changePassword(currentPassword, newPassword);
    setUpdatingPassword(false);
    if (result?.success) {
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      toast.error(result?.message || 'Password update failed');
    }
  };

  const timelineItems = [
    { icon: UserCheck, title: 'Account created & verified', time: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A', color: 'sky' },
    { icon: AlertCircle, title: `${stats.totalLost} lost item${stats.totalLost !== 1 ? 's' : ''} reported`, time: 'Total reports', color: 'rose' },
    { icon: CheckCircle, title: `${stats.totalFound} found item${stats.totalFound !== 1 ? 's' : ''} submitted`, time: 'Total submissions', color: 'emerald' },
    { icon: FileText, title: `${stats.activeClaims} active claim${stats.activeClaims !== 1 ? 's' : ''}`, time: 'Currently open', color: 'amber' },
    { icon: Award, title: `${stats.returnedItems} item${stats.returnedItems !== 1 ? 's' : ''} recovered`, time: 'Successfully returned', color: 'indigo' },
  ];

  const tabs = [
    { id: 'profile', label: 'Edit Profile', icon: Edit2 },
    { id: 'password', label: 'Security', icon: Lock },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  return (
    <div className="space-y-8">

      {/* ── Page Header ──────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-sky-500" />
          <h1 className="text-2xl font-bold tracking-tight">My Dashboard</h1>
        </div>
        <p className="text-xs text-slate-400 pl-7">Manage your profile, claims, and activity on TraceBack</p>
      </motion.div>

      {/* ── Stats Row ────────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : <>
              <StatCard icon={AlertCircle} label="Lost Reported"  value={stats.totalLost}     color="rose"    delay={0}    />
              <StatCard icon={CheckCircle} label="Found Reported" value={stats.totalFound}    color="emerald" delay={0.08} />
              <StatCard icon={FileText}    label="Active Claims"  value={stats.activeClaims}  color="sky"     delay={0.16} />
              <StatCard icon={Award}       label="Returned Items" value={stats.returnedItems} color="indigo"  delay={0.24} />
            </>
        }
      </section>

      {/* ── Profile & Forms ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1 p-7 rounded-2xl glass-panel space-y-6 text-center"
        >
          {/* Avatar */}
          <div className="relative mx-auto w-28 h-28 group">
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-sky-500 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-lg shadow-sky-500/20">
              {profilePreview ? (
                <img src={getImageUrl(profilePreview)} alt={user?.name} className="h-full w-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-slate-400" />
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Camera className="w-6 h-6 text-white" />
              <input type="file" accept="image/*" onChange={(e) => {
                const f = e.target.files[0];
                if (f) { setProfilePicFile(f); setProfilePreview(URL.createObjectURL(f)); }
              }} className="hidden" />
            </label>
            {/* Online indicator */}
            <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
          </div>

          {/* Info */}
          <div>
            <h3 className="text-xl font-bold">{user?.name}</h3>
            <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/25">
              <Shield className="w-3.5 h-3.5" />
              {user?.role}
            </span>
          </div>

          <div className="space-y-3 text-left text-xs border-t border-slate-200/60 dark:border-slate-700/60 pt-5">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40">
              <Mail className="w-4 h-4 text-sky-500 shrink-0" />
              <span className="truncate text-slate-500 dark:text-slate-400">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40">
              <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400">{user?.contactNumber || 'No phone added'}</span>
            </div>
          </div>

          {/* Quick stats mini */}
          {!statsLoading && (
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { val: stats.totalLost, label: 'Lost' },
                { val: stats.totalFound, label: 'Found' },
                { val: stats.returnedItems, label: 'Back' },
              ].map(({ val, label }) => (
                <div key={label} className="rounded-xl bg-slate-50/60 dark:bg-slate-800/40 p-2.5 text-center">
                  <p className="text-lg font-bold">{val}</p>
                  <p className="text-[10px] text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right panel with tabs */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="lg:col-span-2 space-y-0"
        >
          {/* Tab header */}
          <div className="flex gap-1 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 mb-6">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === id
                    ? 'bg-white dark:bg-slate-900 text-sky-500 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab: Edit Profile */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl glass-panel space-y-5"
            >
              <h2 className="text-sm font-bold flex items-center gap-1.5 border-b border-slate-200/60 dark:border-slate-700/60 pb-3">
                <Edit2 className="w-4 h-4 text-sky-500" /> Edit Profile Details
              </h2>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-slate-500">Full Name</label>
                    <input type="text" name="name" value={profileData.name}
                      onChange={e => setProfileData({ ...profileData, [e.target.name]: e.target.value })}
                      className="input-focus" placeholder="Your full name" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-slate-500">Contact Number</label>
                    <input type="text" name="contactNumber" value={profileData.contactNumber}
                      onChange={e => setProfileData({ ...profileData, [e.target.name]: e.target.value })}
                      className="input-focus" placeholder="10-digit phone number" required />
                  </div>
                </div>

                {/* File upload */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-slate-500">Profile Photo</label>
                  <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 hover:bg-sky-50/30 dark:hover:bg-sky-900/10 cursor-pointer transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold text-slate-600 dark:text-slate-300">
                        {profilePicFile ? profilePicFile.name : 'Click to upload new photo'}
                      </p>
                      <p className="text-slate-400">PNG, JPG up to 5MB</p>
                    </div>
                    <input type="file" accept="image/*" onChange={e => {
                      const f = e.target.files[0];
                      if (f) { setProfilePicFile(f); setProfilePreview(URL.createObjectURL(f)); }
                    }} className="hidden" />
                  </label>
                </div>

                <button type="submit" disabled={updatingProfile} className="btn-primary">
                  {updatingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </form>
            </motion.div>
          )}

          {/* Tab: Security */}
          {activeTab === 'password' && (
            <motion.div
              key="password"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl glass-panel space-y-5"
            >
              <h2 className="text-sm font-bold flex items-center gap-1.5 border-b border-slate-200/60 dark:border-slate-700/60 pb-3">
                <Lock className="w-4 h-4 text-sky-500" /> Change Password
              </h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {[
                  { name: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
                  { name: 'newPassword', label: 'New Password', placeholder: 'At least 6 characters' },
                  { name: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Repeat new password' },
                ].map(({ name, label, placeholder }) => (
                  <div key={name}>
                    <label className="block text-xs font-semibold mb-1.5 text-slate-500">{label}</label>
                    <input
                      type="password" name={name}
                      value={passwordData[name]}
                      onChange={e => setPasswordData({ ...passwordData, [e.target.name]: e.target.value })}
                      className="input-focus" placeholder={placeholder} required
                    />
                  </div>
                ))}
                <button type="submit" disabled={updatingPassword} className="btn-primary">
                  {updatingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                  Update Password
                </button>
              </form>
            </motion.div>
          )}

          {/* Tab: Activity Timeline */}
          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl glass-panel"
            >
              <h2 className="text-sm font-bold flex items-center gap-1.5 border-b border-slate-200/60 dark:border-slate-700/60 pb-3 mb-6">
                <Activity className="w-4 h-4 text-sky-500" /> Activity Timeline
              </h2>
              <div className="relative">
                <div className="timeline-line" />
                <div className="space-y-0">
                  {statsLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="pl-10 pb-6 space-y-1.5">
                          <div className="skeleton h-3 w-48 rounded" />
                          <div className="skeleton h-2.5 w-28 rounded" />
                        </div>
                      ))
                    : timelineItems.map((item, i) => (
                        <TimelineItem key={i} {...item} delay={i * 0.08} />
                      ))
                  }
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── Footer Contact strip ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="border-t border-slate-200/60 dark:border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left"
      >
        <div className="text-xs text-slate-400 space-y-0.5">
          <p>📧 Support: <span className="text-sky-500">riyagargofficial@gmail.com</span> · <span className="text-sky-500">deepakbawa004@gmail.com</span></p>
          <p>📞 Helpline: <span className="font-semibold text-slate-600 dark:text-slate-300">9478095710</span></p>
        </div>
        <a href="#" className="btn-primary text-xs px-4 py-2">
          📱 Download App
        </a>
      </motion.div>
    </div>
  );
};

export default Dashboard;
