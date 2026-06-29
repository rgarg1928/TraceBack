import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import {
  ShieldAlert,
  Users,
  AlertTriangle,
  CheckCircle,
  FileCheck,
  Trash2,
  UserPlus,
  RefreshCcw,
  Check,
  X,
  Loader2
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'lost', 'found', 'claims'

  // Statistics
  const [stats, setStats] = useState({
    users: 0,
    lost: 0,
    found: 0,
    claims: 0,
    claimsBreakdown: { pending: 0, approved: 0, rejected: 0 },
    lostBreakdown: { lost: 0, matched: 0, returned: 0 },
    foundBreakdown: { found: 0, claimed: 0, returned: 0 }
  });

  const [users, setUsers] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [claims, setClaims] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState('');

  const isSuperAdmin = user && user.role === 'Super Admin';

  const fetchData = async () => {
    try {
      setLoading(true);

      // Load statistics (accessible to Warden, Security Guard, Super Admin)
      const resStats = await axios.get('/api/admin/stats');
      if (resStats.data.success) {
        setStats(resStats.data.stats);
      }

      // Load items & claims
      const resLost = await axios.get('/api/items/lost');
      if (resLost.data.success) setLostItems(resLost.data.data);

      const resFound = await axios.get('/api/items/found');
      if (resFound.data.success) setFoundItems(resFound.data.data);

      const resClaims = await axios.get('/api/claims');
      if (resClaims.data.success) setClaims(resClaims.data.data);

      // Load users (Super Admin only)
      if (isSuperAdmin) {
        const resUsers = await axios.get('/api/admin/users');
        if (resUsers.data.success) {
          setUsers(resUsers.data.data);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading administrative logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Update user role
  const handleUpdateRole = async (targetUserId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user role to ${newRole}?`)) return;

    try {
      const res = await axios.put(`/api/admin/users/${targetUserId}/role`, { role: newRole });
      if (res.data.success) {
        showToast('User role updated successfully', 'success');
        fetchData();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update role', 'error');
    }
  };

  // Delete user
  const handleDeleteUser = async (targetUserId) => {
    if (!window.confirm('WARNING: Deleting a user will clear their account. Are you sure?')) return;

    try {
      const res = await axios.delete(`/api/admin/users/${targetUserId}`);
      if (res.data.success) {
        showToast('User account deleted successfully', 'success');
        fetchData();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  // Delete Lost Item
  const handleDeleteLostItem = async (itemId) => {
    if (!window.confirm('Delete this lost item report?')) return;
    try {
      const res = await axios.delete(`/api/items/lost/${itemId}`);
      if (res.data.success) {
        showToast('Lost item report deleted', 'success');
        fetchData();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete report', 'error');
    }
  };

  // Delete Found Item
  const handleDeleteFoundItem = async (itemId) => {
    if (!window.confirm('Delete this found item report?')) return;
    try {
      const res = await axios.delete(`/api/items/found/${itemId}`);
      if (res.data.success) {
        showToast('Found item report deleted', 'success');
        fetchData();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete report', 'error');
    }
  };

  // Handle claim approval/rejection
  const handleUpdateClaim = async (claimId, status) => {
    if (!window.confirm(`Set this claim status to ${status}?`)) return;

    setActionLoadingId(claimId);
    try {
      const res = await axios.put(`/api/claims/${claimId}`, { status });
      if (res.data.success) {
        showToast(`Claim successfully ${status === 'Approved' ? 'approved' : 'rejected'}`, 'success');
        fetchData();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setActionLoadingId('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-rose-500 dark:text-rose-450">Admin Panel</h1>
          <p className="text-xs text-slate-400">Governance dashboard for system statistics, users, reports, and claims</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
          title="Refresh logs"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 font-semibold text-xs border-b-2 transition-colors ${
            activeTab === 'overview' ? 'border-rose-500 text-rose-500' : 'border-transparent text-slate-405'
          }`}
        >
          Overview Stats
        </button>
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 font-semibold text-xs border-b-2 transition-colors ${
              activeTab === 'users' ? 'border-rose-500 text-rose-500' : 'border-transparent text-slate-405'
            }`}
          >
            Manage Users
          </button>
        )}
        <button
          onClick={() => setActiveTab('lost')}
          className={`px-4 py-2.5 font-semibold text-xs border-b-2 transition-colors ${
            activeTab === 'lost' ? 'border-rose-500 text-rose-500' : 'border-transparent text-slate-405'
          }`}
        >
          Lost Reports
        </button>
        <button
          onClick={() => setActiveTab('found')}
          className={`px-4 py-2.5 font-semibold text-xs border-b-2 transition-colors ${
            activeTab === 'found' ? 'border-rose-500 text-rose-500' : 'border-transparent text-slate-405'
          }`}
        >
          Found Reports
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`px-4 py-2.5 font-semibold text-xs border-b-2 transition-colors ${
            activeTab === 'claims' ? 'border-rose-500 text-rose-500' : 'border-transparent text-slate-405'
          }`}
        >
          Claims Review
        </button>
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl glass-panel shadow-xl">
          {/* OVERVIEW STATS TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Top Row Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
                  <Users className="absolute right-3 top-3 w-8 h-8 text-slate-400/10" />
                  <p className="text-xs text-slate-400">Total Users Registered</p>
                  <p className="text-2xl font-extrabold mt-1">{stats.users}</p>
                </div>
                <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
                  <AlertTriangle className="absolute right-3 top-3 w-8 h-8 text-rose-500/10" />
                  <p className="text-xs text-slate-400">Total Lost Items</p>
                  <p className="text-2xl font-extrabold mt-1">{stats.lost}</p>
                </div>
                <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
                  <CheckCircle className="absolute right-3 top-3 w-8 h-8 text-emerald-500/10" />
                  <p className="text-xs text-slate-400">Total Found Items</p>
                  <p className="text-2xl font-extrabold mt-1">{stats.found}</p>
                </div>
                <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
                  <FileCheck className="absolute right-3 top-3 w-8 h-8 text-sky-500/10" />
                  <p className="text-xs text-slate-400">Total Claim Requests</p>
                  <p className="text-2xl font-extrabold mt-1">{stats.claims}</p>
                </div>
              </div>

              {/* breakdowns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Lost Status Breakdown</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span>Active Lost:</span><span className="font-semibold text-rose-500">{stats.lostBreakdown.lost}</span></div>
                    <div className="flex justify-between"><span>Matched:</span><span className="font-semibold text-amber-500">{stats.lostBreakdown.matched}</span></div>
                    <div className="flex justify-between"><span>Returned:</span><span className="font-semibold text-emerald-500">{stats.lostBreakdown.returned}</span></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Found Status Breakdown</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span>Active Found:</span><span className="font-semibold text-sky-500">{stats.foundBreakdown.found}</span></div>
                    <div className="flex justify-between"><span>Claimed:</span><span className="font-semibold text-amber-500">{stats.foundBreakdown.claimed}</span></div>
                    <div className="flex justify-between"><span>Returned:</span><span className="font-semibold text-emerald-500">{stats.foundBreakdown.returned}</span></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Claims Status Breakdown</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span>Pending verification:</span><span className="font-semibold text-amber-500">{stats.claimsBreakdown.pending}</span></div>
                    <div className="flex justify-between"><span>Approved:</span><span className="font-semibold text-emerald-500">{stats.claimsBreakdown.approved}</span></div>
                    <div className="flex justify-between"><span>Rejected:</span><span className="font-semibold text-rose-500">{stats.claimsBreakdown.rejected}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MANAGE USERS TAB (Super Admin only) */}
          {activeTab === 'users' && isSuperAdmin && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-400">Registered users list</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                      <th className="pb-3 pr-4">User Name</th>
                      <th className="pb-3 pr-4">Email</th>
                      <th className="pb-3 pr-4">Contact</th>
                      <th className="pb-3 pr-4">Current Role</th>
                      <th className="pb-3 pr-4">Change Role</th>
                      <th className="pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <td className="py-3 pr-4 font-semibold">{item.name}</td>
                        <td className="py-3 pr-4">{item.email}</td>
                        <td className="py-3 pr-4">{item.contactNumber || 'N/A'}</td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.role === 'Super Admin' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {item.role}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          {item._id !== user.id && (
                            <select
                              value={item.role}
                              onChange={(e) => handleUpdateRole(item._id, e.target.value)}
                              className="text-[10px] bg-transparent border border-slate-200 dark:border-slate-800 rounded p-1"
                            >
                              <option value="Student">Student</option>
                              <option value="Teacher">Teacher</option>
                              <option value="Security Guard">Security Guard</option>
                              <option value="Warden">Warden</option>
                              <option value="Super Admin">Super Admin</option>
                            </select>
                          )}
                        </td>
                        <td className="py-3">
                          {item._id !== user.id && (
                            <button
                              onClick={() => handleDeleteUser(item._id)}
                              className="text-rose-500 p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* LOST REPORTS TAB */}
          {activeTab === 'lost' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-400">All Lost Items Reported</h2>
              {lostItems.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">No lost items logged</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                        <th className="pb-3 pr-4">Item Name</th>
                        <th className="pb-3 pr-4">Category</th>
                        <th className="pb-3 pr-4">Reporter</th>
                        <th className="pb-3 pr-4">Location</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {lostItems.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                          <td className="py-3 pr-4 font-semibold">{item.itemName}</td>
                          <td className="py-3 pr-4">{item.category}</td>
                          <td className="py-3 pr-4">{item.user?.name || 'Deleted User'}</td>
                          <td className="py-3 pr-4">{item.lostLocation}</td>
                          <td className="py-3 pr-4">
                            <span className="text-[10px] font-bold">{item.status}</span>
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => handleDeleteLostItem(item._id)}
                              className="text-rose-500 p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* FOUND REPORTS TAB */}
          {activeTab === 'found' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-400">All Found Items Reported</h2>
              {foundItems.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">No found items logged</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                        <th className="pb-3 pr-4">Item Name</th>
                        <th className="pb-3 pr-4">Category</th>
                        <th className="pb-3 pr-4">Finder</th>
                        <th className="pb-3 pr-4">Location</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {foundItems.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                          <td className="py-3 pr-4 font-semibold">{item.itemName}</td>
                          <td className="py-3 pr-4">{item.category}</td>
                          <td className="py-3 pr-4">{item.user?.name || 'Deleted User'}</td>
                          <td className="py-3 pr-4">{item.foundLocation}</td>
                          <td className="py-3 pr-4">
                            <span className="text-[10px] font-bold">{item.status}</span>
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => handleDeleteFoundItem(item._id)}
                              className="text-rose-500 p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* CLAIMS REVIEW TAB */}
          {activeTab === 'claims' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-400">Claim Requests Approval Panel</h2>
              {claims.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">No claims submitted</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                        <th className="pb-3 pr-4">Found Item</th>
                        <th className="pb-3 pr-4">Claimant Name</th>
                        <th className="pb-3 pr-4">Proof Message</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {claims.map((claim) => (
                        <tr key={claim._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                          <td className="py-3 pr-4 font-semibold">{claim.foundItem?.itemName || 'Deleted Item'}</td>
                          <td className="py-3 pr-4">{claim.claimer?.name || 'Deleted User'}</td>
                          <td className="py-3 pr-4 text-slate-400 italic max-w-xs truncate" title={claim.verificationMessage}>
                            "{claim.verificationMessage}"
                          </td>
                          <td className="py-3 pr-4">
                            <span className="text-[10px] font-bold">{claim.status}</span>
                          </td>
                          <td className="py-3">
                            {claim.status === 'Pending' ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleUpdateClaim(claim._id, 'Approved')}
                                  disabled={actionLoadingId === claim._id}
                                  className="inline-flex items-center gap-0.5 px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded font-bold text-[10px] cursor-pointer"
                                >
                                  {actionLoadingId === claim._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateClaim(claim._id, 'Rejected')}
                                  disabled={actionLoadingId === claim._id}
                                  className="inline-flex items-center gap-0.5 px-2 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded font-bold text-[10px] cursor-pointer"
                                >
                                  {actionLoadingId === claim._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-medium">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
