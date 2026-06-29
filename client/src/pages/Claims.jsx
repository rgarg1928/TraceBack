import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import {
  FileText,
  User,
  Check,
  X,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Info,
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react';

const Claims = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('my-claims'); // 'my-claims', 'incoming-claims', 'all-claims'

  const [myClaims, setMyClaims] = useState([]);
  const [incomingClaims, setIncomingClaims] = useState([]);
  const [allClaims, setAllClaims] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState('');

  const isAdminRole = user && ['Super Admin', 'Warden', 'Security Guard'].includes(user.role);

  const fetchClaimsData = async () => {
    try {
      setLoading(true);
      
      // 1. My Outgoing Claims
      const resMy = await axios.get('/api/claims/myclaims');
      if (resMy.data.success) {
        setMyClaims(resMy.data.data);
      }

      // 2. Incoming Claims
      const resIncoming = await axios.get('/api/claims/incoming');
      if (resIncoming.data.success) {
        setIncomingClaims(resIncoming.data.data);
      }

      // 3. System-wide Claims (for admins)
      if (isAdminRole) {
        const resAll = await axios.get('/api/claims');
        if (resAll.data.success) {
          setAllClaims(resAll.data.data);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading claims data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimsData();
  }, [user]);

  const handleUpdateClaim = async (id, status) => {
    if (!window.confirm(`Are you sure you want to set this claim status to ${status}?`)) return;

    setActionLoadingId(id);
    try {
      const res = await axios.put(`/api/claims/${id}`, { status });
      if (res.data.success) {
        showToast(`Claim successfully ${status === 'Approved' ? 'approved' : 'rejected'}`, 'success');
        fetchClaimsData();
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Claims Manager</h1>
        <p className="text-xs text-slate-400">Track claim requests, verify proofs, and approve handovers</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('my-claims')}
          className={`px-4 py-2.5 font-semibold text-xs border-b-2 transition-colors ${
            activeTab === 'my-claims'
              ? 'border-sky-500 text-sky-500'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          My Claims Submitted
        </button>
        <button
          onClick={() => setActiveTab('incoming-claims')}
          className={`px-4 py-2.5 font-semibold text-xs border-b-2 transition-colors ${
            activeTab === 'incoming-claims'
              ? 'border-sky-500 text-sky-500'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          Claims Received
        </button>
        {isAdminRole && (
          <button
            onClick={() => setActiveTab('all-claims')}
            className={`px-4 py-2.5 font-semibold text-xs border-b-2 transition-colors ${
              activeTab === 'all-claims'
                ? 'border-sky-500 text-sky-500'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            All System Claims (Admin)
          </button>
        )}
      </div>

      {/* Claims Lists */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl glass-panel shadow-xl">
          {/* Outgoing Claims (Submitted by Me) */}
          {activeTab === 'my-claims' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-400">Claims submitted by you to recover found items</h2>
              {myClaims.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">No claims submitted yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                        <th className="pb-3 pr-4">Found Item</th>
                        <th className="pb-3 pr-4">Finder Detail</th>
                        <th className="pb-3 pr-4">My Verification Message</th>
                        <th className="pb-3 pr-4">Claim Date</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {myClaims.map((claim) => (
                        <tr key={claim._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                          <td className="py-3 pr-4 font-semibold">{claim.foundItem?.itemName || 'Deleted Item'}</td>
                          <td className="py-3 pr-4">
                            {claim.foundItem?.user ? (
                              <div>
                                <p className="font-medium">{claim.foundItem.user.name}</p>
                                <p className="text-[10px] text-slate-450">{claim.foundItem.user.email}</p>
                              </div>
                            ) : (
                              'Unknown Finder'
                            )}
                          </td>
                          <td className="py-3 pr-4 text-slate-400 italic max-w-xs truncate" title={claim.verificationMessage}>
                            "{claim.verificationMessage}"
                          </td>
                          <td className="py-3 pr-4">{new Date(claim.createdAt).toLocaleDateString()}</td>
                          <td className="py-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              claim.status === 'Pending'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                                : claim.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'
                            }`}>
                              {claim.status === 'Pending' && <Clock className="w-3 h-3" />}
                              {claim.status === 'Approved' && <ThumbsUp className="w-3 h-3" />}
                              {claim.status === 'Rejected' && <ThumbsDown className="w-3 h-3" />}
                              {claim.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Incoming Claims (Claims received for my found items) */}
          {activeTab === 'incoming-claims' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-400">Claims sent by others to retrieve items you found</h2>
              {incomingClaims.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">No incoming claims received</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                        <th className="pb-3 pr-4">Found Item</th>
                        <th className="pb-3 pr-4">Claimant</th>
                        <th className="pb-3 pr-4">Claimant Role</th>
                        <th className="pb-3 pr-4">Verification Proof Message</th>
                        <th className="pb-3 pr-4">Claim Date</th>
                        <th className="pb-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {incomingClaims.map((claim) => (
                        <tr key={claim._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                          <td className="py-3 pr-4 font-semibold">{claim.foundItem?.itemName || 'Deleted Item'}</td>
                          <td className="py-3 pr-4">
                            {claim.claimer ? (
                              <div>
                                <p className="font-semibold">{claim.claimer.name}</p>
                                <p className="text-[10px] text-slate-450">{claim.claimer.email}</p>
                              </div>
                            ) : (
                              'Unknown User'
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            <span className="text-[10px] px-1.5 py-0.25 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded">
                              {claim.claimer?.role}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-slate-400 italic max-w-xs whitespace-pre-line" title={claim.verificationMessage}>
                            "{claim.verificationMessage}"
                          </td>
                          <td className="py-3 pr-4">{new Date(claim.createdAt).toLocaleDateString()}</td>
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
                              <span className={`text-[10px] font-bold ${
                                claim.status === 'Approved' ? 'text-emerald-500' : 'text-rose-500'
                              }`}>
                                {claim.status}
                              </span>
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

          {/* System Claims (For Admins) */}
          {activeTab === 'all-claims' && isAdminRole && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-400">All claims inside TraceBack database registry</h2>
              {allClaims.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">No system claims logged</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                        <th className="pb-3 pr-4">Found Item</th>
                        <th className="pb-3 pr-4">Claimant Name</th>
                        <th className="pb-3 pr-4">Verification Proof Message</th>
                        <th className="pb-3 pr-4">Claim Date</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {allClaims.map((claim) => (
                        <tr key={claim._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                          <td className="py-3 pr-4 font-semibold">{claim.foundItem?.itemName || 'Deleted Item'}</td>
                          <td className="py-3 pr-4">
                            {claim.claimer ? (
                              <div>
                                <p className="font-semibold">{claim.claimer.name}</p>
                                <p className="text-[10px] text-slate-450">{claim.claimer.email}</p>
                              </div>
                            ) : (
                              'Unknown Claimant'
                            )}
                          </td>
                          <td className="py-3 pr-4 text-slate-400 italic max-w-xs truncate" title={claim.verificationMessage}>
                            "{claim.verificationMessage}"
                          </td>
                          <td className="py-3 pr-4">{new Date(claim.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 pr-4">
                            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[9px] font-bold ${
                              claim.status === 'Pending' ? 'bg-amber-100 text-amber-800' : claim.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {claim.status}
                            </span>
                          </td>
                          <td className="py-3">
                            {claim.status === 'Pending' ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleUpdateClaim(claim._id, 'Approved')}
                                  disabled={actionLoadingId === claim._id}
                                  className="p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded cursor-pointer"
                                  title="Approve Claim"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleUpdateClaim(claim._id, 'Rejected')}
                                  disabled={actionLoadingId === claim._id}
                                  className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded cursor-pointer"
                                  title="Reject Claim"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500">Processed</span>
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

export default Claims;
