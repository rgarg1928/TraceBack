import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import {
  Search as SearchIcon,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Tag,
  AlertCircle,
  X,
  Sparkles,
  Link as LinkIcon,
  Loader2
} from 'lucide-react';

const CATEGORIES = [
  'Electronics',
  'Documents',
  'Books & Stationery',
  'Keys & Locksets',
  'Clothing & Accessories',
  'Bags & Wallets',
  'Others'
];

const LostItems = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null if creating
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Electronics',
    description: '',
    lostLocation: '',
    lostDate: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Smart Matching Modal State
  const [showMatchesModal, setShowMatchesModal] = useState(false);
  const [matchingResults, setMatchingResults] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchedItemContext, setMatchedItemContext] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await axios.get('/api/items/lost', { params });
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch items', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search, categoryFilter, statusFilter]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      itemName: '',
      category: 'Electronics',
      description: '',
      lostLocation: '',
      lostDate: ''
    });
    setImageFile(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      category: item.category,
      description: item.description,
      lostLocation: item.lostLocation,
      lostDate: item.lostDate ? item.lostDate.substring(0, 10) : ''
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemName || !formData.category || !formData.lostLocation || !formData.lostDate || !formData.description) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    setModalSubmitting(true);
    const data = new FormData();
    data.append('itemName', formData.itemName);
    data.append('category', formData.category);
    data.append('description', formData.description);
    data.append('lostLocation', formData.lostLocation);
    data.append('lostDate', formData.lostDate);
    if (editingItem) {
      // Keep existing status or let editing updates keep it
      data.append('status', editingItem.status);
    }
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      let res;
      if (editingItem) {
        res = await axios.put(`/api/items/lost/${editingItem._id}`, data);
      } else {
        res = await axios.post('/api/items/lost', data);
      }

      if (res.data.success) {
        showToast(
          editingItem ? 'Item updated successfully!' : 'Item reported lost! Smart Matching triggered.',
          'success'
        );
        setShowModal(false);
        fetchItems();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item report?')) return;

    try {
      const res = await axios.delete(`/api/items/lost/${id}`);
      if (res.data.success) {
        showToast('Item report deleted', 'success');
        fetchItems();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete report', 'error');
    }
  };

  // Fetch smart matching found items
  const handleTriggerSmartMatching = async (item) => {
    setMatchedItemContext(item);
    setShowMatchesModal(true);
    setMatchesLoading(true);
    try {
      const res = await axios.get(`/api/items/smart-matches/lost/${item._id}`);
      if (res.data.success) {
        setMatchingResults(res.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error querying match logs', 'error');
    } finally {
      setMatchesLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lost Items Registry</h1>
          <p className="text-xs text-slate-400">Search reported items lost on Chandigarh University campus</p>
        </div>
        {user && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 font-semibold text-sm shadow-md shadow-sky-500/20 cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Report Lost Item
          </button>
        )}
      </div>

      {/* Search & Filter Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="sm:col-span-2 relative flex items-center">
          <SearchIcon className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, location, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div className="relative flex items-center">
          <Filter className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-sky-500 focus:outline-none appearance-none"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="relative flex items-center">
          <Tag className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-sky-500 focus:outline-none appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="Lost">Lost</option>
            <option value="Matched">Matched</option>
            <option value="Returned">Returned</option>
          </select>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-850">
          <AlertCircle className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <h3 className="font-semibold text-slate-500">No items found</h3>
          <p className="text-xs text-slate-400 mt-1">Try resetting your search filters or report a new lost item.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => {
            const isOwner = user && item.user && (item.user._id === user.id || item.user === user.id);
            const isAdmin = user && ['Super Admin', 'Warden', 'Security Guard'].includes(user.role);

            return (
              <div
                key={item._id}
                className="rounded-2xl glass-panel overflow-hidden border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between"
              >
                {/* Image block */}
                <div className="h-44 bg-slate-100 dark:bg-slate-850 relative overflow-hidden flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.itemName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl text-slate-300">📦</span>
                  )}
                  {/* Status tag */}
                  <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-0.75 rounded-full uppercase ${
                    item.status === 'Lost'
                      ? 'bg-rose-500 text-white'
                      : item.status === 'Matched'
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-500 text-white'
                  }`}>
                    {item.status}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold leading-tight line-clamp-1">{item.itemName}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-100/50 dark:border-slate-800/50">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.lostLocation}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>{new Date(item.lostDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                    {/* Smart Matcher trigger */}
                    {isOwner && item.status !== 'Returned' && (
                      <button
                        onClick={() => handleTriggerSmartMatching(item)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-500 hover:text-sky-600 bg-sky-50 dark:bg-sky-950/40 px-2 py-1 rounded-md transition-colors"
                      >
                        <Sparkles className="w-3 h-3 animate-pulse" />
                        Check Smart Matches
                      </button>
                    )}

                    {/* Editor actions */}
                    {(isOwner || isAdmin) && (
                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl glass-panel p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold">
              {editingItem ? 'Edit Lost Item Report' : 'Report Lost Item'}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Item Name *</label>
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleInputChange}
                  placeholder="e.g. Blue HP Pavilion Laptop"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Lost Date *</label>
                  <input
                    type="date"
                    name="lostDate"
                    value={formData.lostDate}
                    onChange={handleInputChange}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Lost Location *</label>
                <input
                  type="text"
                  name="lostLocation"
                  value={formData.lostLocation}
                  onChange={handleInputChange}
                  placeholder="e.g. Mechanical Lab block D3, Room 102"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Mention unique indicators e.g. stickers, cracks, color, keychains..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Item Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="text-xs w-full cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:bg-sky-500/50 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {modalSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Matches Modal */}
      {showMatchesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl glass-panel p-6 space-y-4 shadow-2xl relative max-h-[85vh] flex flex-col justify-between">
            <button
              onClick={() => setShowMatchesModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-bold flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-sky-500" />
                Smart Matches Suggestion
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Comparing "{matchedItemContext?.itemName}" against reported found items.
              </p>
            </div>

            <div className="overflow-y-auto flex-1 my-3 pr-1 space-y-3">
              {matchesLoading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                </div>
              ) : matchingResults.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No matching found items registered yet. We will notify you once a match is registered!
                </div>
              ) : (
                matchingResults.map(({ item, score }) => (
                  <div
                    key={item._id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-950/20"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.itemName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">📦</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold truncate pr-2">{item.itemName}</h4>
                        <span className="text-[10px] font-bold text-sky-500 bg-sky-500/10 px-1.5 py-0.5 rounded">
                          {score}% Match
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{item.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.foundLocation}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100/50 dark:border-slate-800/50">
              <button
                onClick={() => setShowMatchesModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostItems;
