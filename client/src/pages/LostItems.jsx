import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getImageUrl } from '../utils/imageHelper';
import {
  Search as SearchIcon, Filter, Plus, Edit2, Trash2,
  Calendar, MapPin, Tag, AlertCircle, X, Sparkles, Loader2,
  Package, SlidersHorizontal, ChevronDown, Upload
} from 'lucide-react';

const CATEGORIES = [
  'Electronics','Documents','Books & Stationery',
  'Keys & Locksets','Clothing & Accessories','Bags & Wallets','Others'
];

// ── Skeleton card ───────────────────────────────────────────
const SkeletonCard = () => (
  <div className="rounded-2xl glass-panel overflow-hidden">
    <div className="skeleton h-44 w-full" />
    <div className="p-5 space-y-3">
      <div className="skeleton h-3 w-20 rounded" />
      <div className="skeleton h-4 w-40 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-3/4 rounded" />
    </div>
  </div>
);

// ── Item card ───────────────────────────────────────────────
const ItemCard = ({ item, user, onEdit, onDelete, onSmartMatch }) => {
  const isOwner = user && item.user && (item.user._id === user.id || item.user === user.id);
  const isAdmin = user && ['Super Admin','Warden','Security Guard'].includes(user.role);

  const statusCls = {
    Lost: 'badge-lost', Matched: 'badge-matched', Returned: 'badge-returned',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl glass-panel card-hover overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-800/50"
    >
      {/* Image */}
      <div className="h-44 relative overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center group">
        {item.image ? (
          <img src={getImageUrl(item.image)} alt={item.itemName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <Package className="w-12 h-12 text-slate-300 dark:text-slate-600" />
        )}
        <span className={`absolute top-3 right-3 ${statusCls[item.status] || 'badge-found'}`}>
          {item.status}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider">{item.category}</span>
          <h3 className="text-sm font-bold leading-tight line-clamp-1">{item.itemName}</h3>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
        </div>

        <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-100/60 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 shrink-0 text-rose-400" />{item.lostLocation}</div>
          <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 shrink-0 text-sky-400" />{new Date(item.lostDate).toLocaleDateString()}</div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          {isOwner && item.status !== 'Returned' && (
            <button onClick={() => onSmartMatch(item)}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-500 hover:text-sky-600 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 px-2.5 py-1.5 rounded-lg transition-colors">
              <Sparkles className="w-3 h-3 animate-pulse" />
              Smart Match
            </button>
          )}
          {(isOwner || isAdmin) && (
            <div className="flex items-center gap-1 ml-auto">
              <button onClick={() => onEdit(item)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-colors">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDelete(item._id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ── Modal input ─────────────────────────────────────────────
const ModalInput = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-semibold mb-1.5 text-slate-500">{label}</label>
    <input className="input-focus" {...props} />
  </div>
);

const LostItems = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ itemName:'',category:'Electronics',description:'',lostLocation:'',lostDate:'' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const [showMatchesModal, setShowMatchesModal] = useState(false);
  const [matchingResults, setMatchingResults] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchedItemContext, setMatchedItemContext] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await axios.get('/api/items/lost', { params });
      if (res.data.success) setItems(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch items');
    } finally { setLoading(false); }
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ itemName:'',category:'Electronics',description:'',lostLocation:'',lostDate:'' });
    setImageFile(null); setImagePreview('');
    setShowModal(true);
  };
  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ itemName:item.itemName,category:item.category,description:item.description,lostLocation:item.lostLocation,lostDate:item.lostDate?item.lostDate.substring(0,10):'' });
    setImageFile(null); setImagePreview(item.image ? getImageUrl(item.image) : '');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { itemName,category,lostLocation,lostDate,description } = formData;
    if (!itemName||!category||!lostLocation||!lostDate||!description) { toast.error('Fill all required fields'); return; }
    setModalSubmitting(true);
    const data = new FormData();
    Object.entries(formData).forEach(([k,v]) => data.append(k,v));
    if (editingItem) data.append('status', editingItem.status);
    if (imageFile) data.append('image', imageFile);
    try {
      let res;
      if (editingItem) { res = await axios.put(`/api/items/lost/${editingItem._id}`, data); }
      else             { res = await axios.post('/api/items/lost', data); }
      if (res.data.success) {
        toast.success(editingItem ? 'Item updated!' : 'Item reported! Smart Matching triggered.');
        setShowModal(false); fetchItems();
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
    finally { setModalSubmitting(false); }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this item report?')) return;
    try {
      const res = await axios.delete(`/api/items/lost/${id}`);
      if (res.data.success) { toast.success('Deleted'); fetchItems(); }
    } catch { toast.error('Delete failed'); }
  };

  const handleSmartMatch = async (item) => {
    setMatchedItemContext(item); setShowMatchesModal(true);
    setMatchesLoading(true); setMatchingResults([]);
    try {
      const res = await axios.get(`/api/items/smart-matches/lost/${item._id}`);
      if (res.data.success) setMatchingResults(res.data.data);
    } catch { toast.error('Error querying matches'); }
    finally { setMatchesLoading(false); }
  };

  const hasActiveFilters = categoryFilter || statusFilter || search;

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-rose-500" />
            Lost Items Registry
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Search & report items lost on CU campus</p>
        </div>
        {user && (
          <button onClick={openCreateModal} className="btn-primary">
            <Plus className="w-4 h-4" />
            Report Lost Item
          </button>
        )}
      </div>

      {/* ── Search & Filter bar ──────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text" placeholder="Search by name, location, keywords..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-sky-500 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
              hasActiveFilters ? 'bg-sky-500 text-white border-sky-500' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-white/80" />}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter chips */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-400">Category:</span>
                  <div className="flex flex-wrap gap-2">
                    {['', ...CATEGORIES].map(c => (
                      <button key={c} onClick={() => setCategoryFilter(c)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                          categoryFilter === c ? 'bg-sky-500 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-sky-400'
                        }`}
                      >{c || 'All'}</button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-400">Status:</span>
                  {['','Lost','Matched','Returned'].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                        statusFilter === s ? 'bg-sky-500 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-sky-400'
                      }`}
                    >{s || 'All'}</button>
                  ))}
                </div>
                {hasActiveFilters && (
                  <button onClick={() => { setSearch(''); setCategoryFilter(''); setStatusFilter(''); }}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 ml-auto">
                    <X className="w-3.5 h-3.5" /> Clear All
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Result count ─────────────────────────────────────── */}
      {!loading && (
        <p className="text-xs text-slate-400">
          Showing <span className="font-semibold text-slate-600 dark:text-slate-300">{items.length}</span> lost item{items.length !== 1 ? 's' : ''}
          {hasActiveFilters ? ' matching your filters' : ''}
        </p>
      )}

      {/* ── Grid ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-4"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-600 dark:text-slate-300">No lost items found</h3>
            <p className="text-xs text-slate-400 mt-1">Try resetting filters or report a new lost item.</p>
          </div>
          {user && (
            <button onClick={openCreateModal} className="btn-primary mx-auto">
              <Plus className="w-4 h-4" /> Report Lost Item
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {items.map(item => (
              <ItemCard key={item._id} item={item} user={user}
                onEdit={openEditModal} onDelete={handleDeleteItem} onSmartMatch={handleSmartMatch} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Create/Edit Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            key="modal-bg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="w-full max-w-lg rounded-2xl glass-panel p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
              <h2 className="text-lg font-bold">{editingItem ? 'Edit Lost Item Report' : 'Report Lost Item'}</h2>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <ModalInput label="Item Name *" type="text" name="itemName" value={formData.itemName}
                  onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })}
                  placeholder="e.g. Blue HP Pavilion Laptop" required />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-slate-500">Category *</label>
                    <select name="category" value={formData.category}
                      onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })}
                      className="input-focus appearance-none" required>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <ModalInput label="Lost Date *" type="date" name="lostDate" value={formData.lostDate}
                    onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })} required />
                </div>

                <ModalInput label="Lost Location *" type="text" name="lostLocation" value={formData.lostLocation}
                  onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })}
                  placeholder="e.g. Block D3, Room 102" required />

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-slate-500">Description *</label>
                  <textarea name="description" value={formData.description}
                    onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })}
                    rows="3" placeholder="Mention unique identifiers: stickers, cracks, color..."
                    className="input-focus resize-none" required />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-slate-500">Item Image</label>
                  <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 cursor-pointer transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all">
                      <Upload className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-slate-500">{imageFile ? imageFile.name : 'Upload photo of item'}</span>
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => { const f=e.target.files[0]; if(f){setImageFile(f);setImagePreview(URL.createObjectURL(f));} }} />
                  </label>
                  {imagePreview && <img src={imagePreview} className="mt-2 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700" alt="preview" />}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={modalSubmitting} className="btn-primary">
                    {modalSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Report
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Smart Matches Modal ───────────────────────────────── */}
      <AnimatePresence>
        {showMatchesModal && (
          <motion.div
            key="matches-bg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              key="matches"
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl rounded-2xl glass-panel p-6 shadow-2xl relative flex flex-col max-h-[85vh]"
            >
              <button onClick={() => setShowMatchesModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
              <div className="mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-500" /> Smart Match Results
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Comparing "{matchedItemContext?.itemName}" against found items</p>
              </div>

              <div className="overflow-y-auto flex-1 space-y-3 pr-1">
                {matchesLoading ? (
                  Array.from({length:3}).map((_,i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                      <div className="skeleton w-16 h-16 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="skeleton h-3 w-36 rounded" />
                        <div className="skeleton h-2.5 w-full rounded" />
                        <div className="skeleton h-2.5 w-24 rounded" />
                      </div>
                    </div>
                  ))
                ) : matchingResults.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <Package className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-sm font-semibold text-slate-500">No matches found yet</p>
                    <p className="text-xs text-slate-400">We'll notify you when a matching found item is registered!</p>
                  </div>
                ) : matchingResults.map(({ item, score }) => (
                  <div key={item._id} className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-4 bg-slate-50/40 dark:bg-slate-900/40 hover:border-sky-400/50 transition-colors">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      {item.image ? <img src={getImageUrl(item.image)} alt={item.itemName} className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-slate-400" />}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold truncate pr-2">{item.itemName}</h4>
                        <span className="text-[10px] font-bold text-sky-500 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded-full shrink-0">{score}% Match</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{item.description}</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <MapPin className="w-3 h-3" />{item.foundLocation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100/60 dark:border-slate-800/60 mt-4">
                <button onClick={() => setShowMatchesModal(false)} className="btn-secondary text-xs px-4 py-2">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default LostItems;
