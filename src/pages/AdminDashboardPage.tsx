import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../lib/api';
import { Order } from '../types';
import {
  Shield, CheckCircle2, XCircle, Clock, Users, BookOpen,
  Search, Eye, Trash2, Plus, BarChart2, Lock, Loader2, RefreshCw, Ticket, ToggleLeft, ToggleRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
  hasAccess: boolean;
}

interface AdminStats {
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  rejectedOrders: number;
  totalUsers: number;
  activeReaders: number;
  revenueUsdt: number;
  revenueBdt: number;
  revenueByDay: Record<string, number>;
}

interface AdminChapter {
  id?: string;
  number: number;
  title: string;
  subtitle: string;
  readTime: string;
  keyTakeaways: string[];
  content: string;
  hasInteractiveSimulator: boolean;
}

interface AdminPromo {
  id: string;
  code: string;
  discount_type: 'fixed' | 'percent';
  discount_value: number;
  max_uses: number;
  used_count: number;
  active: boolean;
  created_at: string;
}

export const AdminDashboardPage: React.FC = () => {
  const { currentUser, navigate, showToast } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'users' | 'books' | 'promos'>('overview');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newEmailInput, setNewEmailInput] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  // book editor state
  const [bookInfo, setBookInfo] = useState<{
    settings: { title: string; subtitle: string; priceUsdt: number; priceBdt: number };
    chapters: AdminChapter[];
  } | null>(null);
  const [editingChapter, setEditingChapter] = useState<AdminChapter | null>(null);
  const [isSavingBook, setIsSavingBook] = useState(false);

  // promo codes state
  const [promos, setPromos] = useState<AdminPromo[]>([]);
  const [newPromo, setNewPromo] = useState({ code: '', discountType: 'fixed', discountValue: '', maxUses: '' });
  const [promoActions, setPromoActions] = useState<Record<string, boolean>>({});

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [ordersRes, usersRes, statsRes] = await Promise.all([
        api<{ orders: Order[] }>('/api/admin/orders'),
        api<{ users: AdminUser[] }>('/api/admin/users'),
        api<AdminStats>('/api/admin/stats'),
      ]);
      setOrders(ordersRes.orders);
      setUsers(usersRes.users);
      setStats(statsRes);
    } catch (err: any) {
      showToast(err?.message || 'ডেটা লোড করা যায়নি।');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (currentUser?.role === 'admin') loadData();
  }, [currentUser, loadData]);

  // ----- book editor -----
  const loadBook = useCallback(async () => {
    try {
      const data = await api<{ settings: any; chapters: AdminChapter[] }>('/api/admin/book');
      setBookInfo(data);
    } catch (err: any) {
      showToast(err?.message || 'বইয়ের তথ্য লোড করা যায়নি।');
    }
  }, [showToast]);

  useEffect(() => {
    if (currentUser?.role === 'admin' && activeTab === 'books') loadBook();
  }, [currentUser, activeTab, loadBook]);

  // ----- promo codes -----
  const loadPromos = useCallback(async () => {
    try {
      const data = await api<{ promos: AdminPromo[] }>('/api/admin/promos');
      setPromos(data.promos || []);
    } catch (err: any) {
      showToast(err?.message || 'প্রোমো কোড লোড করা যায়নি।');
    }
  }, [showToast]);

  useEffect(() => {
    if (currentUser?.role === 'admin' && activeTab === 'promos') loadPromos();
  }, [currentUser, activeTab, loadPromos]);

  const createPromo = async () => {
    if (!newPromo.code.trim()) { showToast('কোড লিখুন।'); return; }
    if (!newPromo.discountValue || Number(newPromo.discountValue) <= 0) { showToast('ছাড়ের পরিমাণ দিন।'); return; }
    setIsSavingBook(true);
    try {
      await api('/api/admin/promos', {
        method: 'POST',
        body: JSON.stringify({
          code: newPromo.code.trim(),
          discountType: newPromo.discountType,
          discountValue: Number(newPromo.discountValue),
          maxUses: newPromo.maxUses ? Number(newPromo.maxUses) : 0,
        }),
      });
      showToast('প্রোমো কোড তৈরি হয়েছে!');
      setNewPromo({ code: '', discountType: 'fixed', discountValue: '', maxUses: '' });
      await loadPromos();
    } catch (err: any) {
      showToast(err?.message || 'প্রোমো তৈরি করা যায়নি।');
    } finally {
      setIsSavingBook(false);
    }
  };

  const togglePromo = async (p: AdminPromo) => {
    setPromoActions((s) => ({ ...s, [p.id]: true }));
    try {
      await api(`/api/admin/promos/${p.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !p.active }),
      });
      await loadPromos();
    } catch (err: any) {
      showToast(err?.message || 'আপডেট করা যায়নি।');
    } finally {
      setPromoActions((s) => ({ ...s, [p.id]: false }));
    }
  };

  const deletePromo = async (p: AdminPromo) => {
    setPromoActions((s) => ({ ...s, [p.id]: true }));
    try {
      await api(`/api/admin/promos/${p.id}`, { method: 'DELETE' });
      showToast(`${p.code} মুছে ফেলা হয়েছে।`);
      await loadPromos();
    } catch (err: any) {
      showToast(err?.message || 'মোছা যায়নি।');
    } finally {
      setPromoActions((s) => ({ ...s, [p.id]: false }));
    }
  };

  const saveSettings = async () => {
    if (!bookInfo) return;
    setIsSavingBook(true);
    try {
      await api('/api/admin/book/settings', {
        method: 'PUT',
        body: JSON.stringify({
          priceUsdt: bookInfo.settings.priceUsdt,
          priceBdt: bookInfo.settings.priceBdt,
          title: bookInfo.settings.title,
          subtitle: bookInfo.settings.subtitle,
        }),
      });
      showToast('দাম ও তথ্য সংরক্ষণ হয়েছে — এখনই live!');
      await loadBook();
    } catch (err: any) {
      showToast(err?.message || 'সংরক্ষণ করা যায়নি।');
    } finally {
      setIsSavingBook(false);
    }
  };

  const saveChapter = async () => {
    if (!editingChapter) return;
    if (!String(editingChapter.title || '').trim()) {
      showToast('অধ্যায়ের শিরোনাম দিন।');
      return;
    }
    setIsSavingBook(true);
    try {
      await api('/api/admin/book/chapters', {
        method: 'POST',
        body: JSON.stringify(editingChapter),
      });
      showToast('অধ্যায় সংরক্ষণ হয়েছে — রিডারে এখনই দেখা যাবে।');
      setEditingChapter(null);
      await loadBook();
    } catch (err: any) {
      showToast(err?.message || 'সংরক্ষণ করা যায়নি।');
    } finally {
      setIsSavingBook(false);
    }
  };

  const deleteChapter = async (ch: AdminChapter) => {
    if (!ch.id) return;
    if (!window.confirm(`"${ch.title}" অধ্যায়টি মুছে ফেলবেন?`)) return;
    setActionBusy('del-chapter');
    try {
      await api(`/api/admin/book/chapters/${ch.id}`, { method: 'DELETE' });
      showToast('অধ্যায় মুছে ফেলা হয়েছে।');
      await loadBook();
    } catch (err: any) {
      showToast(err?.message || 'মুছে ফেলা যায়নি।');
    } finally {
      setActionBusy(null);
    }
  };

  // ---------- GUARD ----------
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-red-500/15 border border-red-400/30 flex items-center justify-center text-red-400 shadow-xl">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white font-display">এডমিন অ্যাক্সেস প্রয়োজন</h2>
        <p className="text-white/70 text-sm">
          এই পেজটি শুধুমাত্র অনুমোদিত এডমিন অ্যাকাউন্টের জন্য। এডমিন অ্যাকাউন্ট দিয়ে লগইন করুন।
        </p>
        <button
          onClick={() => navigate('login')}
          className="px-6 py-3 bg-brass text-[#171310] hover:bg-brass-bright text-white font-extrabold rounded-xl text-xs  cursor-pointer"
        >
          লগইন করুন
        </button>
      </div>
    );
  }

  const handleApprove = async (orderId: string) => {
    setActionBusy(orderId);
    try {
      await api(`/api/admin/orders/${orderId}/approve`, { method: 'POST' });
      showToast(`অর্ডার অনুমোদিত! পাঠকের এক্সেস চালু হয়েছে।`);
      await loadData(true);
    } catch (err: any) {
      showToast(err?.message || 'অনুমোদন করা যায়নি।');
    } finally {
      setActionBusy(null);
    }
  };

  const handleReject = async (orderId: string) => {
    setActionBusy(orderId);
    try {
      await api(`/api/admin/orders/${orderId}/reject`, { method: 'POST' });
      showToast('অর্ডার বাতিল করা হয়েছে।');
      await loadData(true);
    } catch (err: any) {
      showToast(err?.message || 'বাতিল করা যায়নি।');
    } finally {
      setActionBusy(null);
    }
  };

  const handleRevokeAccess = async (userId: string, email: string) => {
    setActionBusy(userId);
    try {
      await api('/api/admin/access/revoke', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      showToast(`${email} এর পারমিশন বাতিল করা হয়েছে।`);
      await loadData(true);
    } catch (err: any) {
      showToast(err?.message || 'পারমিশন বাতিল করা যায়নি।');
    } finally {
      setActionBusy(null);
    }
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailInput.trim()) return;
    setActionBusy('grant');
    try {
      await api('/api/admin/access/grant', {
        method: 'POST',
        body: JSON.stringify({ email: newEmailInput.trim() }),
      });
      showToast(`অনুমোদিত পাঠক হিসেবে যোগ করা হয়েছে: ${newEmailInput.trim()}`);
      setNewEmailInput('');
      await loadData(true);
    } catch (err: any) {
      showToast(err?.message || 'পারমিশন দেওয়া যায়নি।');
    } finally {
      setActionBusy(null);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchesSearch =
      (o.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.txId || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingOrders = stats?.pendingOrders ?? 0;
  const activeReaders = stats?.activeReaders ?? 0;

  // Chart data from real revenue by day
  const chartData = Object.entries(stats?.revenueByDay || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([day, revenue]) => ({ day: day.slice(5), revenue }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Top Header Banner */}
      <div className="bento-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brass/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brass/15 border border-brass/40 flex items-center justify-center text-brass">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                এডমিন কন্ট্রোল ড্যাশবোর্ড
              </h1>
              <span className="px-2.5 py-0.5 bg-white/5 text-brass font-mono font-bold text-xs rounded-full border border-white/10">
                ভেরিফাইড এডমিন
              </span>
            </div>
            <p className="text-white/60 text-xs mt-1">
              ZiniPay (bKash/Nagad) ও TRC20 USDT পেমেন্ট যাঁচাই করুন, পাঠকদের পারমিশন দিন এবং মোট রেভিনিউ ট্র্যাক করুন।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>রিফ্রেশ</span>
          </button>
          <button
            onClick={() => navigate('reader')}
            className="px-4 py-2.5 bg-brass text-[#171310] hover:bg-brass-bright text-white font-extrabold rounded-xl text-xs transition flex items-center gap-2 cursor-pointer shadow-md"
          >
            <BookOpen className="w-4 h-4" />
            <span>ই-বুক রিডার পরীক্ষা করুন</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 bento-card p-4 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-3 transition cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-brass text-[#171310] hover:bg-brass-bright text-white '
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>ড্যাশবোর্ড ওভারভিউ</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-between transition cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-brass text-[#171310] hover:bg-brass-bright text-white '
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4" />
              <span>পেমেন্ট অর্ডারসমূহ</span>
            </div>
            {pendingOrders > 0 && (
              <span className="px-2 py-0.5 bg-brass text-black text-[10px] font-mono font-bold rounded-full">
                {pendingOrders}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-3 transition cursor-pointer ${
              activeTab === 'users'
                ? 'bg-brass text-[#171310] hover:bg-brass-bright text-white '
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>পাঠকগণ ({activeReaders})</span>
          </button>

          <button
            onClick={() => setActiveTab('books')}
            className={`w-full px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-3 transition cursor-pointer ${
              activeTab === 'books'
                ? 'bg-brass text-[#171310] hover:bg-brass-bright text-white '
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>বই ব্যবস্থাপনা</span>
          </button>

          <button
            onClick={() => setActiveTab('promos')}
            className={`w-full px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-3 transition cursor-pointer ${
              activeTab === 'promos'
                ? 'bg-brass text-[#171310] hover:bg-brass-bright text-white '
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>প্রোমো কোড</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-6">

          {/* Top 4 Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bento-card">
              <span className="text-[11px] text-white/40 uppercase font-mono block mb-1">মোট অর্ডার</span>
              <span className="text-2xl font-extrabold text-white font-mono">{stats?.totalOrders ?? '—'}</span>
            </div>

            <div className="p-5 bento-card border-brass/25">
              <span className="text-[11px] text-brass uppercase font-mono block mb-1">পেন্ডিং রিভিউ</span>
              <span className="text-2xl font-extrabold text-brass font-mono">{pendingOrders}</span>
            </div>

            <div className="p-5 bento-card border-emerald-500/30">
              <span className="text-[11px] text-emerald-400 uppercase font-mono block mb-1">অনুমোদিত আয়</span>
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                {stats?.revenueBdt ?? 0}৳
              </span>
              {stats && stats.revenueUsdt > 0 && (
                <span className="block text-[11px] text-faint font-mono mt-0.5">+ ${stats.revenueUsdt} USDT</span>
              )}
            </div>

            <div className="p-5 bento-card">
              <span className="text-[11px] text-white/40 uppercase font-mono block mb-1">সক্রিয় পাঠক</span>
              <span className="text-2xl font-extrabold text-white font-mono">{activeReaders}</span>
            </div>
          </div>

          {loading ? (
            <div className="bento-card p-16 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-brass" />
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW & CHARTS */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="p-6 bento-card space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white font-display">
                        আয়ের ট্রেন্ড (৳ / $)
                      </h3>
                      <span className="text-xs font-mono text-emerald-400 font-bold">সর্বশেষ ১৪ দিন</span>
                    </div>

                    {chartData.length > 0 ? (
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d9a441" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#d9a441" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                            <YAxis stroke="#64748b" fontSize={11} />
                            <Tooltip contentStyle={{ backgroundColor: '#02040a', borderColor: '#d9a441', borderRadius: '12px', color: '#fff' }} />
                            <Area type="monotone" dataKey="revenue" stroke="#d9a441" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="py-16 text-center text-white/40 text-xs font-mono">
                        এখনো কোনো অনুমোদিত আয় নেই।
                      </div>
                    )}
                  </div>

                  {/* Quick Pending Verification Banner */}
                  {pendingOrders > 0 && (
                    <div className="p-5 bento-card border-brass/40 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-brass shrink-0" />
                        <div>
                          <h4 className="text-sm font-bold text-white">
                            {pendingOrders}টি পেমেন্ট অর্ডার পর্যালোচনার অপেক্ষায়
                          </h4>
                          <p className="text-xs text-white/60">
                            পাঠক এক্সেস দিতে রসিদ ও ট্রানজেকশন আইডি যাঁচাই করুন।
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="px-4 py-2 bg-brass text-[#171310] hover:bg-brass-bright text-white font-extrabold text-xs rounded-xl transition cursor-pointer"
                      >
                        রিভিউ করুন
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ORDERS TABLE */}
              {(activeTab === 'orders' || activeTab === 'overview') && (
                <div className="bento-card p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <h3 className="text-lg font-bold text-white font-display">
                      পেমেন্ট অর্ডার তালিকা
                    </h3>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="জিমেইল বা TxID খুঁজুন..."
                          className="bg-[#050505] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-brass w-48"
                        />
                      </div>

                      <select
                        value={filterStatus}
                        onChange={(e: any) => setFilterStatus(e.target.value)}
                        className="bg-[#050505] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-brass font-mono outline-none"
                      >
                        <option value="all">সকল স্ট্যাটাস</option>
                        <option value="pending">পেন্ডিং</option>
                        <option value="approved">অনুমোদিত</option>
                        <option value="rejected">বাতিল</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#050505] text-white/40 font-mono uppercase text-[10px] border-b border-white/10">
                          <th className="p-3">ইউজার</th>
                          <th className="p-3">ট্রানজেকশন আইডি (TxID)</th>
                          <th className="p-3">রসিদের ছবি</th>
                          <th className="p-3">স্ট্যাটাস</th>
                          <th className="p-3 text-right">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10 text-white/70">
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-white/40">
                              কোনো অর্ডার পাওয়া যায়নি।
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-white/5 transition">
                              <td className="p-3">
                                <span className="font-semibold text-white block">{ord.userName || ord.email}</span>
                                <span className="text-white/40 text-[10px]">{ord.email}</span>
                              </td>
                              <td className="p-3 font-mono text-white/50 truncate max-w-[160px]" title={ord.txId}>
                                {ord.txId}
                              </td>
                              <td className="p-3">
                                {ord.screenshotUrl ? (
                                  <button
                                    onClick={() => setLightboxImage(ord.screenshotUrl)}
                                    className="px-2 py-1 bg-white/5 hover:bg-white/10 text-brass rounded flex items-center gap-1 text-[10px] font-mono cursor-pointer border border-white/10"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>ছবি দেখুন</span>
                                  </button>
                                ) : (
                                  <span className="text-white/30 italic text-[10px]">ছবি নেই</span>
                                )}
                              </td>
                              <td className="p-3">
                                {ord.status === 'approved' && (
                                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-bold font-mono text-[10px]">
                                    APPROVED
                                  </span>
                                )}
                                {ord.status === 'pending' && (
                                  <span className="px-2 py-0.5 bg-brass/15 text-brass/90 border border-brass/25 rounded-full font-bold font-mono text-[10px] animate-pulse">
                                    PENDING
                                  </span>
                                )}
                                {ord.status === 'rejected' && (
                                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full font-bold font-mono text-[10px]">
                                    REJECTED
                                  </span>
                                )}
                                <span className={`ml-1 px-2 py-0.5 rounded-full font-bold font-mono text-[9px] border ${
                                  ord.paymentMethod === 'zinipay'
                                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                    : 'bg-brass/10 text-brass/90 border-brass/25'
                                }`}>
                                  {ord.paymentMethod === 'zinipay' ? 'ZINIPAY' : 'USDT'}
                                </span>
                              </td>
                              <td className="p-3 text-right space-x-2">
                                {ord.status !== 'approved' && (
                                  <button
                                    disabled={actionBusy === ord.id}
                                    onClick={() => handleApprove(ord.id)}
                                    className="px-3 py-1 bg-brass text-[#171310] hover:bg-brass-bright text-white font-extrabold rounded text-[11px] transition cursor-pointer disabled:opacity-40"
                                  >
                                    এপ্রুভ করুন
                                  </button>
                                )}
                                {ord.status !== 'rejected' && (
                                  <button
                                    disabled={actionBusy === ord.id}
                                    onClick={() => handleReject(ord.id)}
                                    className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded text-[11px] transition cursor-pointer disabled:opacity-40"
                                  >
                                    রিজেক্ট করুন
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: AUTHORIZED USERS */}
              {activeTab === 'users' && (
                <div className="bento-card p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white font-display mb-1">
                      পাঠকবৃন্দের তালিকা
                    </h3>
                    <p className="text-xs text-white/50">
                      নিবন্ধিত সকল ইউজার ও তাদের ই-বুক পড়ার অনুমতির অবস্থা।
                    </p>
                  </div>

                  {/* Add Email Form */}
                  <form onSubmit={handleAddEmail} className="flex gap-2 max-w-md">
                    <input
                      type="email"
                      required
                      value={newEmailInput}
                      onChange={(e) => setNewEmailInput(e.target.value)}
                      placeholder="new.reader@gmail.com"
                      className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-brass outline-none"
                    />
                    <button
                      type="submit"
                      disabled={actionBusy === 'grant'}
                      className="px-4 py-2 bg-brass text-[#171310] hover:bg-brass-bright text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                      <Plus className="w-4 h-4" />
                      <span>পারমিশন দিন</span>
                    </button>
                  </form>

                  {/* List */}
                  <div className="divide-y divide-white/10 border-t border-white/10 pt-2">
                    {users.map((u) => (
                      <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {u.hasAccess ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-white/30" />
                          )}
                          <div>
                            <span className="font-mono text-white font-semibold block">{u.email}</span>
                            <span className="text-white/40 text-[10px]">
                              {u.name} {u.role === 'admin' ? '• এডমিন' : ''}
                            </span>
                          </div>
                        </div>
                        {u.role !== 'admin' && (
                          u.hasAccess ? (
                            <button
                              disabled={actionBusy === u.id}
                              onClick={() => handleRevokeAccess(u.id, u.email)}
                              className="p-1 text-white/40 hover:text-red-400 transition cursor-pointer disabled:opacity-40"
                              title="পারমিশন বাতিল করুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-white/30 italic text-[10px]">এক্সেস নেই</span>
                          )
                        )}
                      </div>
                    ))}
                    {users.length === 0 && (
                      <div className="py-8 text-center text-white/40 text-xs font-mono">
                        কোনো ইউজার নেই।
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: BOOK EDITOR */}
              {activeTab === 'books' && (
                <div className="space-y-6">

                  {/* price & info */}
                  <div className="bento-card p-6 space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white font-display">দাম ও বইয়ের তথ্য</h3>
                      <span className="text-[10px] font-mono text-emerald-400">সেভ করলেই লাইভ</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted block">দাম (৳ — ZiniPay)</label>
                        <input
                          type="number"
                          min={1}
                          value={bookInfo?.settings.priceBdt ?? ''}
                          onChange={(e) =>
                            setBookInfo((prev) =>
                              prev ? { ...prev, settings: { ...prev.settings, priceBdt: Number(e.target.value) } } : prev
                            )
                          }
                          className="w-full bg-[#050505] border border-line focus:border-brass rounded-lg px-4 py-2.5 text-sm text-paper outline-none num"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted block">দাম ($ — USDT)</label>
                        <input
                          type="number"
                          min={1}
                          value={bookInfo?.settings.priceUsdt ?? ''}
                          onChange={(e) =>
                            setBookInfo((prev) =>
                              prev ? { ...prev, settings: { ...prev.settings, priceUsdt: Number(e.target.value) } } : prev
                            )
                          }
                          className="w-full bg-[#050505] border border-line focus:border-brass rounded-lg px-4 py-2.5 text-sm text-paper outline-none num"
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-medium text-muted block">বইয়ের শিরোনাম</label>
                        <input
                          type="text"
                          value={bookInfo?.settings.title ?? ''}
                          onChange={(e) =>
                            setBookInfo((prev) =>
                              prev ? { ...prev, settings: { ...prev.settings, title: e.target.value } } : prev
                            )
                          }
                          className="w-full bg-[#050505] border border-line focus:border-brass rounded-lg px-4 py-2.5 text-sm text-paper outline-none"
                        />
                      </div>
                    </div>

                    <button onClick={saveSettings} disabled={isSavingBook || !bookInfo} className="btn-primary btn-sm disabled:opacity-40">
                      সেভ করুন
                    </button>
                  </div>

                  {/* chapters */}
                  {!editingChapter ? (
                    <div className="bento-card p-6 space-y-4">
                      <div className="flex items-center justify-between pb-3 hairline-b">
                        <h3 className="text-lg font-bold text-white font-display">
                          অধ্যায়সমূহ ({bookInfo?.chapters.length ?? 0})
                        </h3>
                        <button
                          onClick={() =>
                            setEditingChapter({
                              number: (bookInfo?.chapters.length ?? 0) + 1,
                              title: '',
                              subtitle: '',
                              readTime: '৫ মিনিট পাঠ',
                              keyTakeaways: [],
                              content: '',
                              hasInteractiveSimulator: false,
                            })
                          }
                          className="btn-primary btn-sm"
                        >
                          + নতুন অধ্যায়
                        </button>
                      </div>

                      <div>
                        {(bookInfo?.chapters ?? []).map((ch) => (
                          <div key={ch.id} className="flex items-center justify-between gap-3 py-3 hairline-b last:border-b-0">
                            <button
                              onClick={() => setEditingChapter({ ...ch })}
                              className="flex items-center gap-3 flex-1 text-left cursor-pointer group"
                            >
                              <span className="num text-xs text-brass w-8 shrink-0">{String(ch.number).padStart(2, '০')}</span>
                              <span className="text-sm text-paper group-hover:text-brass transition truncate">{ch.title}</span>
                            </button>
                            <button
                              onClick={() => deleteChapter(ch)}
                              disabled={actionBusy === 'del-chapter'}
                              className="text-faint hover:text-red-400 transition cursor-pointer shrink-0 p-1"
                              title="মুছুন"
                            >
                              🗑
                            </button>
                          </div>
                        ))}
                        {bookInfo && bookInfo.chapters.length === 0 && (
                          <p className="py-8 text-center text-faint text-xs font-mono">
                            Database-এ এখনো কোনো অধ্যায় নেই। "npm run seed-chapters" চালান অথবা নতুন যোগ করুন।
                          </p>
                        )}
                        {!bookInfo && (
                          <p className="py-8 text-center text-faint text-xs font-mono animate-pulse">লোড হচ্ছে...</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* chapter editor */
                    <div className="bento-card p-6 space-y-5">
                      <div className="flex items-center justify-between pb-3 hairline-b">
                        <h3 className="text-lg font-bold text-white font-display">
                          {editingChapter.id ? `অধ্যায় ${editingChapter.number} সম্পাদনা` : 'নতুন অধ্যায়'}
                        </h3>
                        <button onClick={() => setEditingChapter(null)} className="btn-ghost btn-sm">
                          ← তালিকায় ফিরুন
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted block">নম্বর</label>
                          <input
                            type="number" min={1}
                            value={editingChapter.number}
                            onChange={(e) => setEditingChapter({ ...editingChapter, number: Number(e.target.value) })}
                            className="w-full bg-[#050505] border border-line focus:border-brass rounded-lg px-4 py-2.5 text-sm text-paper outline-none num"
                          />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-xs font-medium text-muted block">শিরোনাম *</label>
                          <input
                            type="text"
                            value={editingChapter.title}
                            onChange={(e) => setEditingChapter({ ...editingChapter, title: e.target.value })}
                            placeholder="অধ্যায় ১: ..."
                            className="w-full bg-[#050505] border border-line focus:border-brass rounded-lg px-4 py-2.5 text-sm text-paper outline-none"
                          />
                        </div>
                        <div className="space-y-1.5 sm:col-span-3">
                          <label className="text-xs font-medium text-muted block">সাবটাইটেল</label>
                          <input
                            type="text"
                            value={editingChapter.subtitle}
                            onChange={(e) => setEditingChapter({ ...editingChapter, subtitle: e.target.value })}
                            className="w-full bg-[#050505] border border-line focus:border-brass rounded-lg px-4 py-2.5 text-sm text-paper outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted block">পড়ার সময়</label>
                          <input
                            type="text"
                            value={editingChapter.readTime}
                            onChange={(e) => setEditingChapter({ ...editingChapter, readTime: e.target.value })}
                            placeholder="৮ মিনিট পাঠ"
                            className="w-full bg-[#050505] border border-line focus:border-brass rounded-lg px-4 py-2.5 text-sm text-paper outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-2 sm:col-span-2 pt-5">
                          <input
                            type="checkbox"
                            checked={editingChapter.hasInteractiveSimulator}
                            onChange={(e) => setEditingChapter({ ...editingChapter, hasInteractiveSimulator: e.target.checked })}
                            className="accent-brass w-4 h-4"
                          />
                          <span className="text-xs text-muted">ইন্টারঅ্যাক্টিভ সিমুলেটর দেখাবে</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted block">মূল বিষয়সমূহ (প্রতি লাইনে একটি)</label>
                        <textarea
                          rows={3}
                          value={editingChapter.keyTakeaways.join('\n')}
                          onChange={(e) => setEditingChapter({ ...editingChapter, keyTakeaways: e.target.value.split('\n').filter(Boolean) })}
                          className="w-full bg-[#050505] border border-line focus:border-brass rounded-lg px-4 py-2.5 text-xs text-paper outline-none resize-y"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted block">
                          মূল কনটেন্ট (Markdown সাপোর্টেড)
                        </label>
                        <textarea
                          rows={16}
                          value={editingChapter.content}
                          onChange={(e) => setEditingChapter({ ...editingChapter, content: e.target.value })}
                          placeholder={'# শিরোনাম\n\nআপনার লেখা...\n\n**বোল্ড**, *ইটালিক*, > উক্তি, - লিস্ট, | টেবিল |'}
                          className="w-full bg-[#050505] border border-line focus:border-brass rounded-lg px-4 py-3 text-xs text-paper outline-none resize-y font-mono leading-relaxed"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <button onClick={saveChapter} disabled={isSavingBook} className="btn-primary btn-sm disabled:opacity-40">
                          {isSavingBook ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                        </button>
                        <button onClick={() => setEditingChapter(null)} className="btn-ghost btn-sm">
                          বাতিল
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}
            {/* TAB 5: PROMO CODES */}
              {activeTab === 'promos' && (
                <div className="space-y-6">

                  {/* add promo form */}
                  <div className="bento-card p-6 space-y-4">
                    <h3 className="font-bold text-white font-display flex items-center gap-2">
                      <Plus className="w-4 h-4 text-brass" /> নতুন প্রোমো কোড
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted block">কোড</label>
                        <input
                          value={newPromo.code}
                          onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                          placeholder="TRADE10"
                          className="w-full bg-[#050505] border border-line focus:border-brass rounded-lg px-3 py-2.5 text-sm text-paper outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted block">ধরন</label>
                        <select
                          value={newPromo.discountType}
                          onChange={(e) => setNewPromo({ ...newPromo, discountType: e.target.value })}
                          className="w-full bg-[#050505] border border-line focus:border-brass rounded-lg px-3 py-2.5 text-sm text-paper outline-none"
                        >
                          <option value="fixed">৳ (নির্দিষ্ট টাকা)</option>
                          <option value="percent">% (শতাংশ)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted block">ছাড়ের পরিমাণ</label>
                        <input
                          type="number" min={1}
                          value={newPromo.discountValue}
                          onChange={(e) => setNewPromo({ ...newPromo, discountValue: e.target.value })}
                          placeholder={newPromo.discountType === 'percent' ? '10' : '100'}
                          className="w-full bg-[#050505] border border-line focus:border-brass rounded-lg px-3 py-2.5 text-sm text-paper outline-none num"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted block">সর্বোচ্চ ব্যবহার (0 = ∞)</label>
                        <input
                          type="number" min={0}
                          value={newPromo.maxUses}
                          onChange={(e) => setNewPromo({ ...newPromo, maxUses: e.target.value })}
                          placeholder="0"
                          className="w-full bg-[#050505] border border-line focus:border-brass rounded-lg px-3 py-2.5 text-sm text-paper outline-none num"
                        />
                      </div>
                    </div>
                    <button onClick={createPromo} disabled={isSavingBook} className="btn-primary btn-sm disabled:opacity-40">
                      {isSavingBook ? 'তৈরি হচ্ছে...' : 'প্রোমো কোড তৈরি করুন'}
                    </button>
                  </div>

                  {/* promo list */}
                  <div className="bento-card p-6">
                    <h3 className="font-bold text-white font-display mb-4">সচল প্রোমো কোডসমূহ</h3>
                    {promos.length === 0 ? (
                      <p className="py-6 text-center text-faint text-xs font-mono">কোনো প্রোমো কোড নেই।</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="text-faint font-mono uppercase tracking-wider">
                            <tr className="hairline-b">
                              <th className="py-2 pr-4">কোড</th>
                              <th className="py-2 pr-4">ছাড়</th>
                              <th className="py-2 pr-4">ব্যবহার</th>
                              <th className="py-2 pr-4">স্ট্যাটাস</th>
                              <th className="py-2 text-right">অ্যাকশন</th>
                            </tr>
                          </thead>
                          <tbody>
                            {promos.map((p) => (
                              <tr key={p.id} className="hairline-b last:border-0">
                                <td className="py-3 pr-4 font-mono font-bold text-brass">{p.code}</td>
                                <td className="py-3 pr-4 text-paper">
                                  {p.discount_type === 'percent'
                                    ? `${p.discount_value}%`
                                    : `${p.discount_value}৳`}
                                </td>
                                <td className="py-3 pr-4 text-muted num">
                                  {p.used_count} / {p.max_uses === 0 ? '∞' : p.max_uses}
                                </td>
                                <td className="py-3 pr-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    p.active
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-white/5 text-faint border border-line'
                                  }`}>
                                    {p.active ? 'সক্রিয়' : 'বন্ধ'}
                                  </span>
                                </td>
                                <td className="py-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => togglePromo(p)}
                                      disabled={promoActions[p.id]}
                                      className="text-brass hover:text-brass-bright transition cursor-pointer disabled:opacity-40"
                                      title={p.active ? 'বন্ধ করুন' : 'সচল করুন'}
                                    >
                                      {p.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                    </button>
                                    <button
                                      onClick={() => deletePromo(p)}
                                      disabled={promoActions[p.id]}
                                      className="text-white/40 hover:text-red-400 transition cursor-pointer disabled:opacity-40"
                                      title="মুছে ফেলুন"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </>
          )}

        </div>

      </div>

      {/* Lightbox Modal for Receipt Screenshots */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bento-card p-6 max-w-xl w-full relative space-y-4">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 text-white/60 hover:text-white bg-white/5 rounded-full cursor-pointer"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h4 className="text-sm font-bold text-white font-display">
              পেমেন্ট স্ক্রিনশট প্রিভিউ
            </h4>
            <img
              src={lightboxImage}
              alt="Receipt Preview"
              className="w-full h-auto max-h-[70vh] object-contain rounded-xl border border-white/10"
            />
          </div>
        </div>
      )}

    </div>
  );
};
