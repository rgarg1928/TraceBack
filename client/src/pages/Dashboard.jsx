import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import {
  User,
  Phone,
  Mail,
  Edit2,
  Lock,
  Upload,
  UserCheck,
  AlertCircle,
  CheckCircle,
  FileText,
  Award,
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState({
    totalLost: 0,
    totalFound: 0,
    activeClaims: 0,
    returnedItems: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Form states
  const [profileData, setProfileData] = useState({
    name: '',
    contactNumber: ''
  });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Sync user details to form
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        contactNumber: user.contactNumber || ''
      });
      setProfilePreview(user.profilePic || '');
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await axios.get('/api/users/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name || !profileData.contactNumber) {
      showToast('Please fill out name and contact number', 'warning');
      return;
    }

    setUpdatingProfile(true);
    const formData = new FormData();
    formData.append('name', profileData.name);
    formData.append('contactNumber', profileData.contactNumber);
    if (profilePicFile) {
      formData.append('profilePic', profilePicFile);
    }

    const result = await updateProfile(formData);
    setUpdatingProfile(false);

    if (result && result.success) {
      showToast('Profile updated successfully!', 'success');
      setProfilePicFile(null);
    } else {
      showToast(result?.message || 'Profile update failed', 'error');
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill out all password fields', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'warning');
      return;
    }

    setUpdatingPassword(true);
    const result = await changePassword(currentPassword, newPassword);
    setUpdatingPassword(false);

    if (result && result.success) {
      showToast('Password changed successfully!', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      showToast(result?.message || 'Password update failed', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Dashboard</h1>
        <p className="text-xs text-slate-400">Manage your reported logs, active claims, and security settings</p>
      </div>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-panel space-y-2 relative overflow-hidden">
          <AlertCircle className="absolute right-3 top-3 w-8 h-8 text-rose-500/10" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lost Reported</p>
          <p className="text-2xl font-extrabold">{statsLoading ? '...' : stats.totalLost}</p>
        </div>

        <div className="p-4 rounded-2xl glass-panel space-y-2 relative overflow-hidden">
          <CheckCircle className="absolute right-3 top-3 w-8 h-8 text-emerald-500/10" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Found Reported</p>
          <p className="text-2xl font-extrabold">{statsLoading ? '...' : stats.totalFound}</p>
        </div>

        <div className="p-4 rounded-2xl glass-panel space-y-2 relative overflow-hidden">
          <FileText className="absolute right-3 top-3 w-8 h-8 text-sky-500/10" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Claims</p>
          <p className="text-2xl font-extrabold">{statsLoading ? '...' : stats.activeClaims}</p>
        </div>

        <div className="p-4 rounded-2xl glass-panel space-y-2 relative overflow-hidden">
          <Award className="absolute right-3 top-3 w-8 h-8 text-indigo-500/10" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Returned Items</p>
          <p className="text-2xl font-extrabold">{statsLoading ? '...' : stats.returnedItems}</p>
        </div>
      </section>

      {/* Profile & Form settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Card: Profile Display */}
        <div className="lg:col-span-1 p-6 rounded-2xl glass-panel text-center space-y-6">
          <h2 className="text-base font-bold text-left border-b border-slate-100/50 dark:border-slate-800/50 pb-2">
            My Profile Card
          </h2>

          <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden border-2 border-sky-500 bg-slate-100 flex items-center justify-center">
            {profilePreview ? (
              <img src={profilePreview} alt={user?.name} className="h-full w-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-slate-400" />
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold">{user?.name}</h3>
            <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400 px-2 py-0.5 rounded-full">
              <UserCheck className="w-3.5 h-3.5" />
              {user?.role}
            </span>
          </div>

          <div className="space-y-3 text-left text-xs border-t border-slate-100/50 dark:border-slate-800/50 pt-4 text-slate-400">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 shrink-0 text-slate-500" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 shrink-0 text-slate-500" />
              <span>{user?.contactNumber || 'No phone updated'}</span>
            </div>
          </div>
        </div>

        {/* Right Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Edit Profile Form */}
          <div className="p-6 rounded-2xl glass-panel space-y-4">
            <h2 className="text-base font-bold border-b border-slate-100/50 dark:border-slate-800/50 pb-2 flex items-center gap-1.5">
              <Edit2 className="w-4 h-4" />
              Edit Profile Details
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Contact Number</label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={profileData.contactNumber}
                    onChange={handleProfileChange}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Update Profile Image</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer text-xs font-semibold select-none">
                    <Upload className="w-4 h-4" />
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {profilePicFile && (
                    <span className="text-[10px] text-emerald-500 font-semibold">
                      New image selected
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:bg-sky-500/50 text-white px-5 py-2.5 font-semibold text-xs transition-all cursor-pointer"
              >
                {updatingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Changes
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="p-6 rounded-2xl glass-panel space-y-4">
            <h2 className="text-base font-bold border-b border-slate-100/50 dark:border-slate-800/50 pb-2 flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              Change Password
            </h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:bg-sky-500/50 text-white px-5 py-2.5 font-semibold text-xs transition-all cursor-pointer"
              >
                {updatingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Change Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
