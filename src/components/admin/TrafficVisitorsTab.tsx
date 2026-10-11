import React, { useState, useEffect } from 'react';
import { VisitorSession, TrafficStats } from '../../types/ecommerce';
import { storage } from '../../services/storage';
import {
  Users,
  Eye,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  Clock,
  ArrowRight,
  Search,
  Filter,
  Sparkles,
  RefreshCw,
  Trash2,
  ShoppingCart,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Compass,
  Zap,
  TrendingUp,
} from 'lucide-react';

interface TrafficVisitorsTabProps {
  onNavigateToPixelSettings?: () => void;
}

export const TrafficVisitorsTab: React.FC<TrafficVisitorsTabProps> = ({
  onNavigateToPixelSettings,
}) => {
  const [sessions, setSessions] = useState<VisitorSession[]>(() => storage.getVisitorSessions());
  const [stats, setStats] = useState<TrafficStats>(() => storage.getTrafficStats());
  const [activeView, setActiveView] = useState<'stream' | 'pages' | 'sources'>('stream');
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState<'all' | 'online' | 'meta' | 'cart' | 'mobile' | 'desktop'>('all');
  const [expandedVisitorId, setExpandedVisitorId] = useState<string | null>(null);
  
  // Simulation & Auto Refresh states
  const [isSimulating, setIsSimulating] = useState(false);
  const [simFeedback, setSimFeedback] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Sync data on changes
  const reloadData = () => {
    setSessions(storage.getVisitorSessions());
    setStats(storage.getTrafficStats());
  };

  useEffect(() => {
    window.addEventListener('visitor-sessions-updated', reloadData);
    return () => {
      window.removeEventListener('visitor-sessions-updated', reloadData);
    };
  }, []);

  // Auto-refresh interval (polling for simulated live activity)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setSessions(storage.getVisitorSessions());
      setStats(storage.getTrafficStats());
    }, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleSimulateVisitor = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const newSession = storage.simulateLiveVisitor();
      setIsSimulating(false);
      setSimFeedback(`নতুন ভিজিটর (${newSession.visitor_name}) যুক্ত হয়েছে এবং পিক্সেল ইভেন্ট ফায়ার হয়েছে!`);
      setExpandedVisitorId(newSession.id);
      setTimeout(() => setSimFeedback(null), 3500);
    }, 400);
  };

  const handleClearSessions = () => {
    if (confirm('সকল ভিজিটর সেশন ও ট্রাফিক লগ মুছে ফেলতে চান? (Clear traffic history?)')) {
      storage.clearVisitorSessions();
      reloadData();
    }
  };

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    // Search match
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.visitor_name.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q) ||
      s.ip_address.toLowerCase().includes(q) ||
      s.current_page.toLowerCase().includes(q) ||
      s.traffic_source.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    // Filter type
    if (filterSource === 'online') {
      return s.is_online || s.last_active === 'Just now' || s.last_active.includes('min');
    }
    if (filterSource === 'meta') {
      return s.traffic_source === 'Facebook Ads (Meta Pixel)';
    }
    if (filterSource === 'cart') {
      return (s.cart_total && s.cart_total > 0) || s.purchased;
    }
    if (filterSource === 'mobile') {
      return s.device_type === 'mobile';
    }
    if (filterSource === 'desktop') {
      return s.device_type === 'desktop';
    }
    return true;
  });

  const liveActiveCount = sessions.filter(
    (s) => s.is_online || s.last_active === 'Just now' || s.last_active.includes('min')
  ).length;

  return (
    <div className="space-y-6">
      {/* 1. Header Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-5 sm:p-6 rounded-3xl text-white shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 border border-emerald-900/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
              <Activity className="w-5 h-5 animate-pulse" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">
              Live Website Traffic & Visitor Tracker
            </h2>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Active
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            আপনার ওয়েবসাইটে বর্তমান ও পূর্ববর্তী ভিজিটররা কোন পেজ দেখছে, কোথা থেকে এসেছে (Meta Pixel / Ads, Google, Direct) এবং কি কি অ্যাকশন বা পণ্য কার্টে নিচ্ছে তা রিয়েল-টাইমে পর্যবেক্ষণ করুন।
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto justify-end">
          <button
            onClick={handleSimulateVisitor}
            disabled={isSimulating}
            className="px-4 py-2.5 rounded-xl bg-[#E25C1D] hover:bg-[#c94f17] text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
            title="নতুন ভিজিটর ভিজিট সিমুলেট করুন"
          >
            <Sparkles className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'সিমুলেট হচ্ছে...' : '+ Simulate Live Visitor'}</span>
          </button>

          {onNavigateToPixelSettings && (
            <button
              onClick={onNavigateToPixelSettings}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-900/80 hover:bg-indigo-800 text-white font-semibold text-xs flex items-center gap-1.5 border border-indigo-700/50 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Pixel Settings</span>
            </button>
          )}

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              autoRefresh
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title={autoRefresh ? 'Auto-refresh active (4s)' : 'Auto-refresh paused'}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          </button>

          <button
            onClick={handleClearSessions}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 transition-all cursor-pointer"
            title="Clear Traffic History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Temporary Success Toast */}
      {simFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{simFeedback}</span>
        </div>
      )}

      {/* 2. Key Analytics Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Live Active Online */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">বর্তমানে সাইটে সক্রিয়</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div className="text-2xl font-black text-emerald-700 flex items-baseline gap-1">
            {liveActiveCount}
            <span className="text-xs font-semibold text-slate-400">জন</span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
            <span className="text-emerald-600 font-bold">● Active Now</span>
          </div>
        </div>

        {/* Total Visitors Today */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">আজকের মোট ভিজিটর</span>
            <Users className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.total_visitors_today}
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            ইউনিক ব্রাউজার সেশন
          </div>
        </div>

        {/* Total Pageviews */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">মোট পেজ ভিউ</span>
            <Eye className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.total_pageviews_today}
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {stats.total_visitors_today > 0 ? (stats.total_pageviews_today / stats.total_visitors_today).toFixed(1) : '1.0'} পেজ / ভিজিটর
          </div>
        </div>

        {/* Meta Pixel Traffic Share */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">মেটা পিক্সেল ট্রাফিক</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-indigo-100 text-indigo-800">
              Meta
            </span>
          </div>
          <div className="text-2xl font-black text-indigo-700">
            {stats.facebook_pixel_traffic_percent}%
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            Facebook Ads থেকে আগত
          </div>
        </div>

        {/* Cart / Conversion Activity */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">কার্ট ও পারচেজ রেট</span>
            <ShoppingCart className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {sessions.length > 0
              ? Math.round((sessions.filter((s) => (s.cart_total && s.cart_total > 0) || s.purchased).length / sessions.length) * 100)
              : 0}%
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            উচ্চ কনভার্সন আগ্রহ
          </div>
        </div>

        {/* Avg Duration */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">গড় অবস্থানের সময়</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-800">
            {stats.avg_session_duration || '3m 42s'}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold truncate">
            +18% রিটেনশন
          </div>
        </div>
      </div>

      {/* 3. Sub Navigation Views Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveView('stream')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'stream'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-300" />
            <span>লাইভ ভিজিটর স্ট্রিম ও পাথ ({filteredSessions.length})</span>
          </button>

          <button
            onClick={() => setActiveView('pages')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'pages'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Compass className="w-4 h-4 text-blue-500" />
            <span>কোন পেজে কত ভিজিটর (Page Breakdown)</span>
          </button>

          <button
            onClick={() => setActiveView('sources')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'sources'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Globe className="w-4 h-4 text-indigo-500" />
            <span>ট্রাফিক সোর্স ও ডিভাইস (Sources & Devices)</span>
          </button>
        </div>

        {/* Live indicator note */}
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>রিয়েল-টাইমে ডাটা প্রতি ৪ সেকেন্ডে রিফ্রেশ হয়</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: LIVE VISITOR STREAM & CLICK-BY-CLICK JOURNEY */}
      {/* ======================================================== */}
      {activeView === 'stream' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="সার্চ করুন (Visitor, IP, City, Page)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3" /> ফিল্টার:
              </span>

              <button
                onClick={() => setFilterSource('all')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  filterSource === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                সকল ({sessions.length})
              </button>

              <button
                onClick={() => setFilterSource('online')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                  filterSource === 'online'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                সক্রিয় এখন ({liveActiveCount})
              </button>

              <button
                onClick={() => setFilterSource('meta')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  filterSource === 'meta'
                    ? 'bg-indigo-900 text-white'
                    : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                }`}
              >
                মেটা পিক্সেল ({sessions.filter((s) => s.traffic_source.includes('Meta')).length})
              </button>

              <button
                onClick={() => setFilterSource('cart')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  filterSource === 'cart'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                কার্ট / অর্ডার ({sessions.filter((s) => (s.cart_total && s.cart_total > 0) || s.purchased).length})
              </button>

              <button
                onClick={() => setFilterSource('mobile')}
                className={`px-2 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  filterSource === 'mobile'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title="Mobile Only"
              >
                <Smartphone className="w-3.5 h-3.5 inline mr-1" />
                মোবাইল
              </button>
            </div>
          </div>

          {/* Visitor Cards Feed */}
          {filteredSessions.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-700">কোনো ভিজিটর রেকর্ড পাওয়া যায়নি</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                আপনার ফিল্টার পরিবর্তন করুন অথবা ওপরে "+ Simulate Live Visitor" বাটনে ক্লিক করে লাইভ ট্রাফিকের নমুনা তৈরি করুন।
              </p>
              <button
                onClick={handleSimulateVisitor}
                className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 cursor-pointer"
              >
                + সিমুলেট করুন
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map((vis) => {
                const isOnline = vis.is_online || vis.last_active === 'Just now' || vis.last_active.includes('min');
                const isExpanded = expandedVisitorId === vis.id;
                const isMeta = vis.traffic_source === 'Facebook Ads (Meta Pixel)';

                return (
                  <div
                    key={vis.id}
                    className={`bg-white rounded-2xl border transition-all shadow-2xs overflow-hidden ${
                      isOnline ? 'border-emerald-200/90 hover:border-emerald-300' : 'border-slate-200'
                    }`}
                  >
                    {/* Visitor Summary Header */}
                    <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      {/* Left: Visitor Identity & Origin */}
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                            vis.device_type === 'mobile'
                              ? 'bg-blue-50 text-blue-600 border-blue-200'
                              : vis.device_type === 'tablet'
                              ? 'bg-purple-50 text-purple-600 border-purple-200'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          }`}
                        >
                          {vis.device_type === 'mobile' ? (
                            <Smartphone className="w-5 h-5" />
                          ) : vis.device_type === 'tablet' ? (
                            <Tablet className="w-5 h-5" />
                          ) : (
                            <Monitor className="w-5 h-5" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-slate-900">
                              {vis.visitor_name}
                            </span>
                            {isOnline ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                লাইভ সক্রিয় (Online)
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                                {vis.last_active}
                              </span>
                            )}

                            {vis.purchased && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-700 text-white">
                                ✓ অর্ডার সম্পন্ন
                              </span>
                            )}
                            {vis.cart_total && !vis.purchased && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                কার্ট: ৳{vis.cart_total}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1 text-slate-600 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-rose-500" />
                              {vis.location}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500 font-mono text-[11px]">
                              IP: {vis.ip_address}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500">
                              {vis.browser}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Traffic Source & Current Location */}
                      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                        <div className="space-y-1 text-left md:text-right">
                          <div className="flex items-center md:justify-end gap-1.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                isMeta
                                  ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                  : vis.traffic_source.includes('Google')
                                  ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {vis.traffic_source}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center md:justify-end gap-1">
                            <Eye className="w-3 h-3 text-slate-400" />
                            <span>মোট পেজ ভিউ: <strong className="text-slate-800">{vis.page_views_count}</strong></span>
                          </div>
                        </div>

                        {/* Expand Button */}
                        <button
                          onClick={() => setExpandedVisitorId(isExpanded ? null : vis.id)}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                        >
                          <span>{isExpanded ? 'লুকান' : 'ভিজিট পাথ দেখুন'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Currently Viewing Banner */}
                    <div className="bg-slate-50/80 px-4 sm:px-5 py-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-700">
                        <span className="font-bold text-emerald-800 flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          বর্তমান অবস্থান:
                        </span>
                        <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-900 font-mono text-[11px]">
                          {vis.current_page}
                        </code>
                        {vis.page_history[0] && (
                          <span className="text-slate-500 truncate hidden sm:inline">
                            ({vis.page_history[0].title})
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>শুরু: {vis.start_time}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">সর্বশেষ একটিভ: {vis.last_active}</span>
                      </div>
                    </div>

                    {/* Expanded Detail: Complete Step-by-Step Navigation History */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 border-t border-slate-100 bg-gradient-to-b from-white to-slate-50/50 space-y-4 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Compass className="w-4 h-4 text-emerald-600" />
                            ভিজিটরের সম্পূর্ণ ব্রাউজিং পথ (User Journey Timeline):
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {vis.page_history.length} টি অ্যাকশন রেকর্ড হয়েছে
                          </span>
                        </div>

                        {/* Step-by-step visual trail */}
                        <div className="space-y-2.5 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                          {vis.page_history.map((step, idx) => (
                            <div key={idx} className="relative flex items-start gap-3 pl-1">
                              {/* Step circle marker */}
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black z-10 shrink-0 ${
                                  idx === 0
                                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {idx + 1}
                              </div>

                              {/* Step content card */}
                              <div className="flex-1 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-xs text-slate-900">
                                      {step.title}
                                    </span>
                                    <code className="text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                                      {step.page}
                                    </code>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {step.pixel_event && (
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                          step.pixel_event === 'Purchase'
                                            ? 'bg-emerald-700 text-white'
                                            : step.pixel_event === 'AddToCart'
                                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                            : step.pixel_event === 'InitiateCheckout'
                                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                        }`}
                                      >
                                        Pixel: {step.pixel_event}
                                      </span>
                                    )}
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {step.timestamp}
                                    </span>
                                  </div>
                                </div>

                                {step.action && (
                                  <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                                    <ArrowRight className="w-3 h-3 text-emerald-600" />
                                    <span>{step.action}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pixel Telemetry Box */}
                        <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-indigo-600" />
                            <span className="font-bold text-indigo-950">
                              মেটা পিক্সেল ও কনভার্সনস এপিআই সিঙ্ক অবস্থা:
                            </span>
                            <span className="text-[11px] text-indigo-700">
                              Browser & Server Deduplicated
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-white px-2 py-0.5 rounded font-mono text-slate-600 border border-indigo-200">
                              User Agent: {vis.browser}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: PAGE-BY-PAGE TRAFFIC BREAKDOWN */}
      {/* ======================================================== */}
      {activeView === 'pages' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  ওয়েবসাইটের পেজ ভিত্তিক ভিজিটর সংখ্যা (Page-Level Analytics)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  কোন কোন পেজ বা পণ্যে ভিজিটররা বেশি সময় ব্যয় করছে এবং ভিউ হচ্ছে
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                মোট পেজভিউ: {stats.total_pageviews_today}
              </span>
            </div>

            {/* Pages Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold">
                    <th className="py-3 px-3">পেজ বা পণ্যের নাম (Page Title & URL)</th>
                    <th className="py-3 px-3 text-center">ভিউ সংখ্যা (Views)</th>
                    <th className="py-3 px-3 text-center">ইউনিক ভিজিটর</th>
                    <th className="py-3 px-3">ট্রাফিক শতাংশ (Share)</th>
                    <th className="py-3 px-3 text-right">মেটা পিক্সেল ইভেন্ট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.top_pages.map((p, idx) => {
                    const percent =
                      stats.total_pageviews_today > 0
                        ? Math.round((p.views / stats.total_pageviews_today) * 100)
                        : 20;

                    const isCheckout = p.path.includes('checkout');
                    const isProduct = p.path.includes('product');
                    const isOrder = p.path.includes('track-order');

                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{p.title}</div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                            <span>{p.path}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className="font-black text-slate-900 text-sm">{p.views}</span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-slate-700">{p.visitors}</span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-600 h-full rounded-full transition-all"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-700 text-[11px]">{percent}%</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              isOrder
                                ? 'bg-emerald-700 text-white'
                                : isCheckout
                                ? 'bg-purple-100 text-purple-800'
                                : isProduct
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {isOrder
                              ? 'Purchase'
                              : isCheckout
                              ? 'InitiateCheckout'
                              : isProduct
                              ? 'ViewContent'
                              : 'PageView'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 3: TRAFFIC SOURCES & DEVICE ANALYTICS */}
      {/* ======================================================== */}
      {activeView === 'sources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Traffic Sources Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                ট্রাফিক সোর্স ও পিক্সেল শেয়ার (Traffic Sources)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ভিজিটররা কোন মাধ্যম থেকে আপনার ওয়েবসাইটে আসছে
              </p>
            </div>

            <div className="space-y-3.5">
              {stats.source_stats.map((s, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      {s.source.includes('Facebook') ? (
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      ) : s.source.includes('Google') ? (
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                      )}
                      {s.source}
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {s.count} জন ({s.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        s.source.includes('Facebook')
                          ? 'bg-indigo-600'
                          : s.source.includes('Google')
                          ? 'bg-blue-500'
                          : 'bg-slate-500'
                      }`}
                      style={{ width: `${s.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                মেটা পিক্সেল অপ্টিমাইজেশন পরামর্শ:
              </div>
              <p className="text-[11px] text-indigo-700 leading-relaxed">
                আপনার মেটা এডস ও পিক্সেল ক্যাম্পেইন সবচেয়ে বেশি কার্যকরী ভূমিকা পালন করছে। কাস্টমারদের জন্য রি-টার্গেটিং এড চালাতে Meta CAPI টেস্ট কোড ও এক্সেস টোকেন সবসময় অ্যাক্টিভ রাখুন।
              </p>
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                ডিভাইস ও ব্রাউজার বিভাজন (Devices Breakdown)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                মোবাইল, কম্পিউটার ও ট্যাবলেট ব্যবহারকারীর অনুপাত
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/60 text-center space-y-1">
                <Smartphone className="w-6 h-6 text-blue-600 mx-auto" />
                <div className="text-lg font-black text-slate-900">
                  {stats.device_stats.mobile} জন
                </div>
                <div className="text-[11px] font-bold text-blue-800">মোবাইল (Mobile)</div>
                <div className="text-[10px] text-slate-400">
                  {Math.round(
                    (stats.device_stats.mobile /
                      (stats.device_stats.mobile + stats.device_stats.desktop + stats.device_stats.tablet || 1)) *
                      100
                  )}
                  %
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 text-center space-y-1">
                <Monitor className="w-6 h-6 text-slate-700 mx-auto" />
                <div className="text-lg font-black text-slate-900">
                  {stats.device_stats.desktop} জন
                </div>
                <div className="text-[11px] font-bold text-slate-800">ডেস্কটপ (PC)</div>
                <div className="text-[10px] text-slate-400">
                  {Math.round(
                    (stats.device_stats.desktop /
                      (stats.device_stats.mobile + stats.device_stats.desktop + stats.device_stats.tablet || 1)) *
                      100
                  )}
                  %
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/60 text-center space-y-1">
                <Tablet className="w-6 h-6 text-purple-600 mx-auto" />
                <div className="text-lg font-black text-slate-900">
                  {stats.device_stats.tablet} জন
                </div>
                <div className="text-[11px] font-bold text-purple-800">ট্যাবলেট (Tablet)</div>
                <div className="text-[10px] text-slate-400">
                  {Math.round(
                    (stats.device_stats.tablet /
                      (stats.device_stats.mobile + stats.device_stats.desktop + stats.device_stats.tablet || 1)) *
                      100
                  )}
                  %
                </div>
              </div>
            </div>

            {/* Popular Locations */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block">
                শীর্ষ জেলা ও এলাকা ভিত্তিক ভিজিটর (Top Locations):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['ঢাকা (Dhaka 68%)', 'চট্টগ্রাম (Chittagong 15%)', 'সিলেট (Sylhet 8%)', 'রাজশাহী (Rajshahi 5%)', 'অন্যান্য (4%)'].map((loc, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    {loc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
