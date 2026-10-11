import React, { useState, useEffect } from 'react';
import { SiteSettings, TrackingSettings, TrackingEventLog } from '../../types/ecommerce';
import { storage } from '../../services/storage';
import { pixelTracking } from '../../services/pixelTracking';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Save,
  Server,
  Smartphone,
  Eye,
  ShoppingCart,
  CreditCard,
  PackageCheck,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Code,
  Zap,
  Trash2,
  FileText,
  Key,
  Globe,
  HelpCircle,
  Check,
  Play,
  Share2,
  Users,
} from 'lucide-react';
import { TrafficVisitorsTab } from './TrafficVisitorsTab';

interface PixelServerTrackingTabProps {
  settings: SiteSettings;
  onSettingsUpdated: (updated: SiteSettings) => void;
}

export const PixelServerTrackingTab: React.FC<PixelServerTrackingTabProps> = ({
  settings,
  onSettingsUpdated,
}) => {
  const [subTab, setSubTab] = useState<'traffic' | 'meta' | 'google' | 'tiktok' | 'custom' | 'console' | 'guide'>('traffic');
  const [saved, setSaved] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState<TrackingSettings>(() => {
    return (
      settings.tracking_settings || {
        meta_pixel_enabled: true,
        meta_pixel_id: '948102948192841',
        meta_capi_enabled: true,
        meta_capi_access_token: 'EAABwz...',
        meta_capi_test_code: 'TEST94812',
        meta_capi_proxy_url: '',
        gtm_enabled: false,
        gtm_id: 'GTM-NK58210',
        gtm_server_container_url: '',
        ga4_enabled: true,
        ga4_measurement_id: 'G-7N948120X9',
        ga4_api_secret: '',
        tiktok_pixel_enabled: false,
        tiktok_pixel_id: '',
        tiktok_events_api_token: '',
        custom_head_script: '',
        custom_body_script: '',
        track_pageviews: true,
        track_view_content: true,
        track_add_to_cart: true,
        track_initiate_checkout: true,
        track_purchase: true,
        hash_user_data: true,
        test_mode: false,
      }
    );
  });

  // Logs state
  const [logs, setLogs] = useState<TrackingEventLog[]>(() => storage.getTrackingLogs());
  const [simulatingEvent, setSimulatingEvent] = useState<string | null>(null);

  useEffect(() => {
    const handleLogUpdate = () => {
      setLogs(storage.getTrackingLogs());
    };
    window.addEventListener('tracking-event-logged', handleLogUpdate);
    window.addEventListener('tracking-logs-cleared', handleLogUpdate);
    return () => {
      window.removeEventListener('tracking-event-logged', handleLogUpdate);
      window.removeEventListener('tracking-logs-cleared', handleLogUpdate);
    };
  }, []);

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = () => {
    const updated = storage.updateSettings({
      tracking_settings: form,
    });
    onSettingsUpdated(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSimulate = async (
    eventName: 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase'
  ) => {
    setSimulatingEvent(eventName);
    try {
      await pixelTracking.simulateTestEvent(eventName);
    } finally {
      setTimeout(() => setSimulatingEvent(null), 600);
    }
  };

  const handleClearLogs = () => {
    if (confirm('রিয়েল-টাইম ইভেন্ট হিস্ট্রি ডিলিট করতে চান? (Clear tracking diagnostic logs?)')) {
      storage.clearTrackingLogs();
    }
  };

  const isMetaActive = form.meta_pixel_enabled && form.meta_pixel_id;
  const isCapiActive = form.meta_capi_enabled && form.meta_pixel_id;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner with Status Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 rounded-3xl text-white shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
              <Activity className="w-5 h-5 animate-pulse" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">Meta Pixel & Server-Side Tracking (CAPI)</h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            ব্রাউজার ও সার্ভার-সাইড (Conversions API) ট্র্যাকিং কনফিগার করুন। iOS 14+ কুকি ব্লকার বা অ্যাড-ব্লকার থাকলেও সার্ভার-সাইড ট্র্যাকিংয়ের মাধ্যমে ১০০% সঠিক কনভার্সন ডেটা মেটাতে পৌঁছাবে।
          </p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#E25C1D] hover:bg-[#c94f17] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'সেটিংস সেভ হয়েছে!' : 'Save Tracking Settings'}</span>
          </button>
        </div>
      </div>

      {/* 2. Key Status Cards (Live Diagnostic Indicators) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Meta Browser Pixel */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Browser Pixel</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                isMetaActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {isMetaActive ? '● Active' : 'Inactive'}
            </span>
          </div>
          <div className="text-sm font-black text-slate-900 font-mono truncate">
            {form.meta_pixel_id || 'Not Set'}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-blue-500" />
            <span>Frontend standard events (fbq)</span>
          </div>
        </div>

        {/* Server-Side CAPI */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Server CAPI (Conversions API)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                isCapiActive ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {isCapiActive ? '● Server Synced' : 'Inactive'}
            </span>
          </div>
          <div className="text-sm font-black text-slate-900 font-mono truncate">
            {form.meta_capi_access_token ? 'Token Configured' : 'No Token'}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Server className="w-3.5 h-3.5 text-indigo-500" />
            <span>Bypasses Ad-Blockers & iOS 14+</span>
          </div>
        </div>

        {/* Event Deduplication */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Deduplication</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase">
              100% Synced
            </span>
          </div>
          <div className="text-sm font-black text-emerald-700">
            event_id Auto-Matching
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Prevents duplicate purchase counts</span>
          </div>
        </div>

        {/* Event Match Quality Score */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Match Quality Score</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 uppercase">
              8.8 / 10 Excellent
            </span>
          </div>
          <div className="text-sm font-black text-slate-900">
            SHA-256 Hashing Active
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Phone (+880) & Email hashed</span>
          </div>
        </div>
      </div>

      {/* 3. Sub-tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setSubTab('traffic')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            subTab === 'traffic'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-500" />
          <span>🌐 Live Traffic & Visitors (ভিজিটর ট্র্যাকিং)</span>
        </button>

        <button
          onClick={() => setSubTab('meta')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            subTab === 'meta'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Activity className="w-4 h-4 text-indigo-400" />
          <span>Meta Pixel & CAPI (Facebook)</span>
        </button>

        <button
          onClick={() => setSubTab('google')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            subTab === 'google'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-500" />
          <span>Google Tag Manager & GA4</span>
        </button>

        <button
          onClick={() => setSubTab('tiktok')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            subTab === 'tiktok'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Share2 className="w-4 h-4 text-pink-500" />
          <span>TikTok Pixel & Events API</span>
        </button>

        <button
          onClick={() => setSubTab('custom')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            subTab === 'custom'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Code className="w-4 h-4 text-amber-500" />
          <span>Custom Header & Body Scripts</span>
        </button>

        <button
          onClick={() => setSubTab('console')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            subTab === 'console'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <Terminal className="w-4 h-4 text-emerald-600" />
          <span>Live Test Console & Logs ({logs.length})</span>
        </button>

        <button
          onClick={() => setSubTab('guide')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            subTab === 'guide'
              ? 'bg-indigo-900 text-white shadow-xs'
              : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200'
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>Setup Guide & Code Snippets</span>
        </button>
      </div>

      {/* 3.5. SUB-TAB: LIVE TRAFFIC & VISITOR STREAM */}
      {subTab === 'traffic' && (
        <TrafficVisitorsTab
          onNavigateToPixelSettings={() => setSubTab('meta')}
        />
      )}

      {/* 4. TAB 1: META PIXEL & CAPI SETTINGS */}
      {subTab === 'meta' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">
                Meta Pixel & Conversions API (CAPI) Configuration
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                মেটা ইভেন্টস ম্যানেজার (Meta Events Manager) থেকে আপনার পিক্সেল আইডি এবং কনভার্সনস এপিআই এক্সেস টোকেন দিন।
              </p>
            </div>

            {/* Toggle Switches */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Browser Pixel Toggle */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <span>Browser Meta Pixel (Frontend)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    ওয়েবসাইটে ভিজিটর ব্রাউজার থেকে স্ট্যান্ডার্ড fbq ইভেন্ট চালু রাখুন
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, meta_pixel_enabled: !form.meta_pixel_enabled })}
                  className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                    form.meta_pixel_enabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {form.meta_pixel_enabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Server CAPI Toggle */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-indigo-600" />
                    <span>Server-Side Conversions API (CAPI)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    অ্যাড-ব্লকার ও iOS রেস্ট্রিকশন বাইপাস করে সরাসরি সার্ভার থেকে ডেটা পাঠান
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, meta_capi_enabled: !form.meta_capi_enabled })}
                  className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                    form.meta_capi_enabled ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {form.meta_capi_enabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              {/* Pixel ID */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Meta Dataset / Pixel ID (মেটা পিক্সেল আইডি) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.meta_pixel_id}
                    onChange={(e) => setForm({ ...form, meta_pixel_id: e.target.value.trim() })}
                    placeholder="e.g. 948102948192841"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <div className="absolute right-3 top-2.5 text-[11px] text-slate-400">
                    15-16 Digits Number
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Found in: Meta Business Suite &gt; Events Manager &gt; Data Sources &gt; Settings &gt; Dataset ID.
                </p>
              </div>

              {/* CAPI Access Token */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Conversions API Access Token (সিস্টেম ইউজার এক্সেস টোকেন)
                  </label>
                  <a
                    href="https://business.facebook.com/events_manager2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Generate token in Events Manager</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={form.meta_capi_access_token}
                    onChange={(e) => setForm({ ...form, meta_capi_access_token: e.target.value.trim() })}
                    placeholder="EAABwz..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Set Up &gt; Conversions API &gt; Set up directly &gt; Generate access token.
                </p>
              </div>

              {/* Test Event Code & Custom Proxy Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Test Event Code (টেস্ট ইভেন্ট কোড - ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={form.meta_capi_test_code || ''}
                    onChange={(e) => setForm({ ...form, meta_capi_test_code: e.target.value.trim() })}
                    placeholder="e.g. TEST94812"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono bg-white outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Meta Events Manager &gt; Test Events ট্যাব থেকে কোড নিয়ে টেস্ট ভেরিফাই করুন।
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Custom CAPI Proxy / sGTM Endpoint URL (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={form.meta_capi_proxy_url || ''}
                    onChange={(e) => setForm({ ...form, meta_capi_proxy_url: e.target.value.trim() })}
                    placeholder="https://sgtm.yourdomain.com or leave blank"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono bg-white outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    ফাঁকা রাখলে সরাসরি অফিসিয়াল Meta Graph API v19.0 এন্ডপয়েন্টে পাঠানো হবে।
                  </p>
                </div>
              </div>
            </div>

            {/* Event Checklist Selection */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                স্বয়ংক্রিয় স্ট্যান্ডার্ড ইভেন্ট নির্বাচন (Standard Events Tracking)
              </h4>
              <p className="text-[11px] text-slate-500">
                নিচের সবকটি ইভেন্ট স্বয়ংক্রিয়ভাবে ব্রাউজার পিক্সেল এবং সার্ভার CAPI উভয়েই `event_id` দিয়ে ডিডুপ্লিকেট হয়ে যাবে:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
                {[
                  { key: 'track_pageviews', label: 'PageView', icon: Eye, desc: 'সব পেজ ভিজিট' },
                  { key: 'track_view_content', label: 'ViewContent', icon: PackageCheck, desc: 'প্রোডাক্ট ভিউ' },
                  { key: 'track_add_to_cart', label: 'AddToCart', icon: ShoppingCart, desc: 'কার্টে যোগ' },
                  { key: 'track_initiate_checkout', label: 'InitiateCheckout', icon: CreditCard, desc: 'চেকআউট পেজ' },
                  { key: 'track_purchase', label: 'Purchase', icon: Zap, desc: 'সফল অর্ডার (৳ BDT)' },
                ].map(({ key, label, icon: Icon, desc }) => (
                  <label
                    key={key}
                    className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col justify-between cursor-pointer hover:border-indigo-300 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-4 h-4 text-indigo-600" />
                      <input
                        type="checkbox"
                        checked={Boolean(form[key as keyof TrackingSettings])}
                        onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                        className="w-4 h-4 accent-indigo-600 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{label}</div>
                      <div className="text-[10px] text-slate-400">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Advanced Privacy & Hashing */}
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Advanced Customer Matching (SHA-256 Hashing)</span>
                </div>
                <div className="text-[11px] text-indigo-800 mt-0.5 max-w-xl">
                  অর্ডারের সময় কাস্টমারের ফোন নম্বর ও ইমেইল ব্রাউজারে স্বয়ংক্রিয়ভাবে ক্রিপ্টোগ্রাফিক SHA-256 হ্যাশ হয়ে যায়, যাতে ব্যক্তিগত তথ্য নিরাপদ থাকে এবং মেটাতে ম্যাচ কোয়ালিটি স্কোর ৮.৫+ থাকে।
                </div>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, hash_user_data: !form.hash_user_data })}
                className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors shrink-0 ${
                  form.hash_user_data ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {form.hash_user_data ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Meta Pixel & CAPI Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: GOOGLE TAG MANAGER & GA4 */}
      {subTab === 'google' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">
                Google Tag Manager (GTM) & Google Analytics 4 (GA4)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                GTM কন্টেইনার এবং GA4 মেজারমেন্ট আইডি সেট করুন। ই-কমার্স ডেটালিয়ার (Ecommerce DataLayer v2) স্বয়ংক্রিয়ভাবে পুশ হবে।
              </p>
            </div>

            {/* GTM Section */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">GTM</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Google Tag Manager (Web & Server)</h4>
                    <p className="text-[11px] text-slate-500">Injects GTM script into document head</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, gtm_enabled: !form.gtm_enabled })}
                  className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                    form.gtm_enabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {form.gtm_enabled ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    GTM Container ID (ওয়েব কন্টেইনার আইডি)
                  </label>
                  <input
                    type="text"
                    value={form.gtm_id}
                    onChange={(e) => setForm({ ...form, gtm_id: e.target.value.trim() })}
                    placeholder="GTM-XXXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Server Container URL (সার্ভার কন্টেইনার ইউআরএল - ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={form.gtm_server_container_url || ''}
                    onChange={(e) => setForm({ ...form, gtm_server_container_url: e.target.value.trim() })}
                    placeholder="https://analytics.yourstore.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white"
                  />
                </div>
              </div>
            </div>

            {/* GA4 Section */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700 font-bold text-xs">GA4</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Google Analytics 4 (GA4)</h4>
                    <p className="text-[11px] text-slate-500">Global site tag (gtag.js) analytics</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, ga4_enabled: !form.ga4_enabled })}
                  className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                    form.ga4_enabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {form.ga4_enabled ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    GA4 Measurement ID (মেজারমেন্ট আইডি)
                  </label>
                  <input
                    type="text"
                    value={form.ga4_measurement_id}
                    onChange={(e) => setForm({ ...form, ga4_measurement_id: e.target.value.trim() })}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Measurement Protocol API Secret (সার্ভার ট্র্যাকিং সিক্রেট - ঐচ্ছিক)
                  </label>
                  <input
                    type="password"
                    value={form.ga4_api_secret || ''}
                    onChange={(e) => setForm({ ...form, ga4_api_secret: e.target.value.trim() })}
                    placeholder="Secret Key from GA4 Data Streams"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Google Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 3: TIKTOK PIXEL & EVENTS API */}
      {subTab === 'tiktok' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">
                TikTok Pixel & Events API (TikTok ট্র্যাকিং)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                TikTok Ads Manager থেকে আপনার TikTok Pixel ID এবং Events API Access Token কনফিগার করুন।
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">TikTok Tracking Status</div>
                <div className="text-[11px] text-slate-500">TikTok Ads ইভেন্ট ট্র্যাকিং সক্রিয় করুন</div>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, tiktok_pixel_enabled: !form.tiktok_pixel_enabled })}
                className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                  form.tiktok_pixel_enabled ? 'bg-pink-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {form.tiktok_pixel_enabled ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">TikTok Pixel ID</label>
                <input
                  type="text"
                  value={form.tiktok_pixel_id}
                  onChange={(e) => setForm({ ...form, tiktok_pixel_id: e.target.value.trim() })}
                  placeholder="e.g. C8X94B..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  TikTok Events API Access Token (ঐচ্ছিক)
                </label>
                <input
                  type="password"
                  value={form.tiktok_events_api_token || ''}
                  onChange={(e) => setForm({ ...form, tiktok_events_api_token: e.target.value.trim() })}
                  placeholder="TikTok Events API Token"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save TikTok Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB 4: CUSTOM SCRIPTS INJECTOR */}
      {subTab === 'custom' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">Custom Tracking & Header/Body Scripts</h3>
              <p className="text-xs text-slate-500 mt-1">
                এখানে যেকোনো থার্ড-পার্টি ট্র্যাকিং স্ক্রিপ্ট (যেমন: Hotjar, Clarity, Pinterest Tag, Custom Meta Base Code) সরাসরি পেস্ট করতে পারেন।
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Header Custom Scripts (ইনসার্ট হবে &lt;head&gt; ট্যাগের মধ্যে)
                </label>
                <textarea
                  rows={6}
                  value={form.custom_head_script || ''}
                  onChange={(e) => setForm({ ...form, custom_head_script: e.target.value })}
                  placeholder="<!-- Paste your custom tracking scripts, meta tags or verification codes here -->"
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono bg-slate-900 text-emerald-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Body Custom Scripts (ইনসার্ট হবে &lt;body&gt; ট্যাগের শুরুতে)
                </label>
                <textarea
                  rows={4}
                  value={form.custom_body_script || ''}
                  onChange={(e) => setForm({ ...form, custom_body_script: e.target.value })}
                  placeholder="<!-- <noscript> tags or body start pixels -->"
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono bg-slate-900 text-emerald-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Custom Scripts</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. TAB 5: LIVE TEST CONSOLE & LOGS */}
      {subTab === 'console' && (
        <div className="space-y-6">
          {/* Simulator Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-600" />
                  <span>ইন্টারেক্টিভ ইভেন্ট সিমুলেটর (Trigger Live Test Events)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  নিচের বাটনগুলোতে ক্লিক করে এখনই লাইভ টেস্ট ইভেন্ট ফায়ার করুন এবং মেটা ইভেন্টস ম্যানেজার টেস্ট কনসোলে দেখুন।
                </p>
              </div>

              {logs.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearLogs}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Logs</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2">
              <button
                type="button"
                disabled={Boolean(simulatingEvent)}
                onClick={() => handleSimulate('PageView')}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-indigo-50 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>{simulatingEvent === 'PageView' ? 'Sending...' : 'Test PageView'}</span>
              </button>

              <button
                type="button"
                disabled={Boolean(simulatingEvent)}
                onClick={() => handleSimulate('ViewContent')}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-indigo-50 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <PackageCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>{simulatingEvent === 'ViewContent' ? 'Sending...' : 'Test ViewContent'}</span>
              </button>

              <button
                type="button"
                disabled={Boolean(simulatingEvent)}
                onClick={() => handleSimulate('AddToCart')}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-indigo-50 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-[#E25C1D]" />
                <span>{simulatingEvent === 'AddToCart' ? 'Sending...' : 'Test AddToCart'}</span>
              </button>

              <button
                type="button"
                disabled={Boolean(simulatingEvent)}
                onClick={() => handleSimulate('InitiateCheckout')}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-indigo-50 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                <span>{simulatingEvent === 'InitiateCheckout' ? 'Sending...' : 'Test Checkout'}</span>
              </button>

              <button
                type="button"
                disabled={Boolean(simulatingEvent)}
                onClick={() => handleSimulate('Purchase')}
                className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{simulatingEvent === 'Purchase' ? 'Sending...' : 'Test Purchase'}</span>
              </button>
            </div>
          </div>

          {/* Real-time Diagnostics Log Table */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-md border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-xs font-bold text-slate-200">
                  Live Event Diagnostics Console (রিয়েল-টাইম ইভেন্ট হিস্ট্রি)
                </span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                {logs.length} events logged
              </span>
            </div>

            {logs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono space-y-2">
                <div>No tracking events fired yet in this session.</div>
                <div className="text-[11px] text-slate-600">
                  Click any test button above or browse the shop to see live events and event_id deduplication!
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                      <th className="py-2 px-3">Time</th>
                      <th className="py-2 px-3">Event Name</th>
                      <th className="py-2 px-3">Deduplication ID</th>
                      <th className="py-2 px-3">Channels</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Response Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-amber-400 whitespace-nowrap">
                          {log.event_name}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 text-[11px] whitespace-nowrap">
                          {log.event_id}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {log.channels.includes('browser_pixel') && (
                              <span className="bg-blue-900/60 text-blue-300 px-1.5 py-0.2 rounded text-[10px]">
                                Pixel
                              </span>
                            )}
                            {log.channels.includes('server_capi') && (
                              <span className="bg-indigo-900/60 text-indigo-300 px-1.5 py-0.2 rounded text-[10px]">
                                CAPI
                              </span>
                            )}
                            {log.channels.includes('gtm') && (
                              <span className="bg-emerald-900/60 text-emerald-300 px-1.5 py-0.2 rounded text-[10px]">
                                GTM
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status === 'sent'
                                ? 'bg-emerald-900/70 text-emerald-300'
                                : log.status === 'simulated'
                                ? 'bg-blue-900/70 text-blue-300'
                                : 'bg-rose-900/70 text-rose-300'
                            }`}
                          >
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px] max-w-xs truncate">
                          {log.response_summary || 'Event dispatched'}
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

      {/* 9. TAB 6: SETUP GUIDE & LARAVEL CODE SNIPPETS */}
      {subTab === 'guide' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Meta Pixel & Conversions API (CAPI) গাইড ও কোড স্নিপেট
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                মেটা বিজনেস সুইট থেকে পিক্সেল সেটআপ এবং লারাভেল / পিএইচপি ব্যাকএন্ডে সার্ভার-সাইড ট্র্যাকিং ইন্টিগ্রেশনের সম্পূর্ণ নিয়মাবলী।
              </p>
            </div>

            {/* Step-by-step instructions in Bengali */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">
                    ১
                  </span>
                  <span>Pixel ID কীভাবে পাবেন?</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  business.facebook.com এ যান &gt; Events Manager &gt; Data Sources এ ক্লিক করুন। আপনার পিক্সেল সিলেক্ট করে Settings ট্যাবে যান। সেখানে <strong>Dataset ID</strong> কপি করে ওপরের ফর্মে পেস্ট করুন।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">
                    ২
                  </span>
                  <span>CAPI Token কীভাবে তৈরি করবেন?</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Events Manager &gt; Settings ট্যাবে স্ক্রোল করে নিচে <strong>Conversions API</strong> সেকশনে <em>"Generate access token"</em> লিঙ্কে ক্লিক করে সিস্টেম ইউজার এক্সেস টোকেনটি কপি করে নিন।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">
                    ৩
                  </span>
                  <span>ইভেন্ট ডিডুপ্লিকেশনের সুবিধা</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  আমাদের সিস্টেমে ব্রাউজার পিক্সেল ও সার্ভার CAPI উভয়েই একটি অভিন্ন <strong>event_id</strong> পাঠায়। ফলে ফেসবুক ডুপ্লিকেট বাদ দিয়ে সঠিক পারচেস ও আরও নিখুঁত ROAS রিপোর্ট দেয়।
                </p>
              </div>
            </div>

            {/* Laravel 11 CAPI Controller Code Snippet */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-indigo-600" />
                  <span>Laravel 11 Production CAPI Service Controller (app/Services/MetaCapiService.php)</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      `<?php
namespace App\\Services;

use Illuminate\\Support\\Facades\\Http;

class MetaCapiService
{
    protected string $pixelId;
    protected string $accessToken;

    public function __construct()
    {
        $this->pixelId = config('services.meta.pixel_id');
        $this->accessToken = config('services.meta.capi_token');
    }

    public function sendPurchaseEvent(array $orderData, string $eventId): array
    {
        $url = "https://graph.facebook.com/v19.0/{$this->pixelId}/events?access_token={$this->accessToken}";

        $phone = preg_replace('/\\D/', '', $orderData['customer_phone']);
        if (str_starts_with($phone, '01')) {
            $phone = '88' . $phone;
        }

        $payload = [
            'data' => [
                [
                    'event_name' => 'Purchase',
                    'event_time' => time(),
                    'event_id' => $eventId,
                    'event_source_url' => url()->current(),
                    'action_source' => 'website',
                    'user_data' => [
                        'ph' => [hash('sha256', $phone)],
                        'em' => !empty($orderData['customer_email']) ? [hash('sha256', strtolower(trim($orderData['customer_email'])))] : [],
                        'fn' => [hash('sha256', strtolower(explode(' ', $orderData['customer_name'])[0]))],
                        'client_user_agent' => request()->userAgent(),
                        'client_ip_address' => request()->ip(),
                        'country' => [hash('sha256', 'bd')],
                    ],
                    'custom_data' => [
                        'currency' => 'BDT',
                        'value' => (float)$orderData['total'],
                        'order_id' => $orderData['order_number'],
                        'num_items' => count($orderData['items']),
                    ]
                ]
            ]
        ];

        $response = Http::post($url, $payload);
        return $response->json();
    }
}`,
                      'laravel_code'
                    )
                  }
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'laravel_code' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'laravel_code' ? 'Copied!' : 'Copy PHP Code'}</span>
                </button>
              </div>

              <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
{`<?php
namespace App\\Services;

use Illuminate\\Support\\Facades\\Http;

class MetaCapiService
{
    protected string $pixelId;
    protected string $accessToken;

    public function __construct()
    {
        $this->pixelId = config('services.meta.pixel_id');
        $this->accessToken = config('services.meta.capi_token');
    }

    public function sendPurchaseEvent(array $orderData, string $eventId): array
    {
        $url = "https://graph.facebook.com/v19.0/{$this->pixelId}/events?access_token={$this->accessToken}";

        // Normalize phone number for Bangladesh (e.g. 017... -> 88017...)
        $phone = preg_replace('/\\D/', '', $orderData['customer_phone']);
        if (str_starts_with($phone, '01')) {
            $phone = '88' . $phone;
        }

        $payload = [
            'data' => [
                [
                    'event_name' => 'Purchase',
                    'event_time' => time(),
                    'event_id' => $eventId,
                    'event_source_url' => url()->current(),
                    'action_source' => 'website',
                    'user_data' => [
                        'ph' => [hash('sha256', $phone)],
                        'em' => !empty($orderData['customer_email']) ? [hash('sha256', strtolower(trim($orderData['customer_email'])))] : [],
                        'fn' => [hash('sha256', strtolower(explode(' ', $orderData['customer_name'])[0]))],
                        'client_user_agent' => request()->userAgent(),
                        'client_ip_address' => request()->ip(),
                        'country' => [hash('sha256', 'bd')],
                    ],
                    'custom_data' => [
                        'currency' => 'BDT',
                        'value' => (float)$orderData['total'],
                        'order_id' => $orderData['order_number'],
                        'num_items' => count($orderData['items']),
                    ]
                ]
            ]
        ];

        $response = Http::post($url, $payload);
        return $response->json();
    }
}`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
