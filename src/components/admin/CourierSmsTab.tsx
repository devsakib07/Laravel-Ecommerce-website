import React, { useState } from 'react';
import { SiteSettings, CourierSettings, SmsSettings } from '../../types/ecommerce';
import { storage } from '../../services/storage';
import {
  Truck,
  MessageSquare,
  ShieldCheck,
  Save,
  Check,
  Key,
  Smartphone,
  ExternalLink,
  Zap,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

interface CourierSmsTabProps {
  settings: SiteSettings;
  onSettingsUpdated: (updated: SiteSettings) => void;
}

export const CourierSmsTab: React.FC<CourierSmsTabProps> = ({
  settings,
  onSettingsUpdated,
}) => {
  const [courier, setCourier] = useState<CourierSettings>(() => settings.courier_settings || {
    steadfast_api_key: 'stf_live_demo_key_9481203',
    steadfast_secret_key: 'stf_secret_demo_841029',
    pathao_client_id: 'pth_client_94812',
    pathao_client_secret: 'pth_sec_5819',
    pathao_store_id: '48192',
    default_courier: 'steadfast',
    auto_booking_enabled: false,
  });

  const [sms, setSms] = useState<SmsSettings>(() => settings.sms_settings || {
    enabled: true,
    provider: 'greenweb',
    api_key: 'gw_api_key_demo_84912',
    sender_id: 'SHUDDHO',
    order_placed_template: 'প্রিয় {name}, আপনার অর্ডার #{order_number} সফল হয়েছে। মোট: ৳{total}',
    order_shipped_template: 'প্রিয় {name}, পার্সেলটি কুরিয়ারে দেওয়া হয়েছে। ট্র্যাকিং: {tracking_code}',
  });

  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsapp_number || '01712345678');
  const [whatsappEnabled, setWhatsappEnabled] = useState(settings.whatsapp_order_enabled !== false);
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(settings.loyalty_enabled !== false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const updated = storage.updateSettings({
      courier_settings: courier,
      sms_settings: sms,
      whatsapp_number: whatsappNumber,
      whatsapp_order_enabled: whatsappEnabled,
      loyalty_enabled: loyaltyEnabled,
    });
    onSettingsUpdated(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 rounded-3xl text-white shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 border border-indigo-900/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
              <Truck className="w-5 h-5 animate-pulse" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">
              Courier, SMS & Automation Settings (কুরিয়ার ও এসএমএস অটোমেশন)
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Steadfast এবং Pathao কুরিয়ার API ইন্টিগ্রেশন, কাস্টমার অটো-এসএমএস গেটওয়ে এবং WhatsApp অর্ডার সার্ভিস কনফিগার করুন।
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-[#E25C1D] hover:bg-[#c94f17] text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
        >
          {saved ? <Check className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'সেটিংস সেভ হয়েছে!' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Steadfast & Pathao Courier API */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span>Steadfast & Pathao Courier Integration</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                এডমিন প্যানেল থেকে ১ ক্লিকে পার্সেল বুকিংয়ের জন্য API ক্রেডেনশিয়াল
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
              API Ready
            </span>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ডিফল্ট কুরিয়ার সার্ভিস (Default Courier)
              </label>
              <select
                value={courier.default_courier}
                onChange={(e) => setCourier({ ...courier, default_courier: e.target.value as any })}
                className="w-full h-9 px-3 border border-slate-300 rounded-xl text-xs bg-white outline-none font-semibold text-slate-800"
              >
                <option value="steadfast">Steadfast Courier (সবচেয়ে জনপ্রিয় ও দ্রুত)</option>
                <option value="pathao">Pathao Courier</option>
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-black text-slate-900 block">
                Steadfast API Credentials:
              </span>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Steadfast API Key
                </label>
                <input
                  type="text"
                  value={courier.steadfast_api_key || ''}
                  onChange={(e) => setCourier({ ...courier, steadfast_api_key: e.target.value })}
                  placeholder="stf_api_..."
                  className="w-full h-8 px-3 border border-slate-300 rounded-lg text-xs font-mono bg-white outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Steadfast Secret Key
                </label>
                <input
                  type="password"
                  value={courier.steadfast_secret_key || ''}
                  onChange={(e) => setCourier({ ...courier, steadfast_secret_key: e.target.value })}
                  placeholder="stf_secret_..."
                  className="w-full h-8 px-3 border border-slate-300 rounded-lg text-xs font-mono bg-white outline-none"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-black text-slate-900 block">
                Pathao Courier API Credentials:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={courier.pathao_client_id || ''}
                    onChange={(e) => setCourier({ ...courier, pathao_client_id: e.target.value })}
                    className="w-full h-8 px-3 border border-slate-300 rounded-lg text-xs font-mono bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Store ID
                  </label>
                  <input
                    type="text"
                    value={courier.pathao_store_id || ''}
                    onChange={(e) => setCourier({ ...courier, pathao_store_id: e.target.value })}
                    className="w-full h-8 px-3 border border-slate-300 rounded-lg text-xs font-mono bg-white outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SMS Gateway & WhatsApp Order */}
        <div className="space-y-6">
          {/* SMS Automation */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Automated SMS Notifications</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  অর্ডার প্লেস ও কুরিয়ারে পাঠালে কাস্টমারের ফোনে অটোমেটিক SMS পাঠানোর ব্যবস্থা
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sms.enabled}
                  onChange={(e) => setSms({ ...sms, enabled: e.target.checked })}
                  className="accent-[#E25C1D] w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-700">চালু</span>
              </label>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    SMS Gateway Provider
                  </label>
                  <select
                    value={sms.provider}
                    onChange={(e) => setSms({ ...sms, provider: e.target.value as any })}
                    className="w-full h-8 px-2 border border-slate-300 rounded-lg text-xs bg-white outline-none"
                  >
                    <option value="greenweb">Greenweb SMS</option>
                    <option value="bulksmsbd">BulkSMS BD</option>
                    <option value="elitbuzz">ElitBuzz SMS</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Sender ID / Masking
                  </label>
                  <input
                    type="text"
                    value={sms.sender_id || ''}
                    onChange={(e) => setSms({ ...sms, sender_id: e.target.value })}
                    placeholder="e.g. SHUDDHO"
                    className="w-full h-8 px-3 border border-slate-300 rounded-lg text-xs uppercase font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  SMS API Token / Key
                </label>
                <input
                  type="password"
                  value={sms.api_key || ''}
                  onChange={(e) => setSms({ ...sms, api_key: e.target.value })}
                  className="w-full h-8 px-3 border border-slate-300 rounded-lg text-xs font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  অর্ডার কনফার্মেশন SMS টেমপ্লেট
                </label>
                <textarea
                  rows={2}
                  value={sms.order_placed_template || ''}
                  onChange={(e) => setSms({ ...sms, order_placed_template: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Order & Loyalty */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Order & Loyalty Points</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  অফিসিয়াল WhatsApp নম্বর (কাস্টমার যেখানে অর্ডার পাঠাবে)
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="w-full h-8 px-3 border border-slate-300 rounded-lg text-xs font-mono outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="font-bold text-slate-800">1-Click WhatsApp Order বাটন</div>
                  <div className="text-[11px] text-slate-500">প্রডাক্ট পেজ ও চেকআউটে WhatsApp অর্ডার অপশন দেখান</div>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappEnabled}
                  onChange={(e) => setWhatsappEnabled(e.target.checked)}
                  className="accent-[#E25C1D] w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="font-bold text-slate-800">Customer Loyalty Rewards</div>
                  <div className="text-[11px] text-slate-500">কেনাকাটায় রিওয়ার্ড পয়েন্ট ও পরবর্তী অর্ডারে ক্যাশ ডিসকাউন্ট</div>
                </div>
                <input
                  type="checkbox"
                  checked={loyaltyEnabled}
                  onChange={(e) => setLoyaltyEnabled(e.target.checked)}
                  className="accent-[#E25C1D] w-4 h-4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
