import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, ShieldCheck, Heart } from 'lucide-react';
import { storage } from '../../services/storage';

interface FooterProps {
  onNavigate: (route: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [settings, setSettings] = useState(() => storage.getSettings());

  useEffect(() => {
    const handleUpdate = () => setSettings(storage.getSettings());
    window.addEventListener('settings-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('settings-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return (
    <footer className="bg-white border-t border-slate-200 mt-16 pt-12 pb-8 text-slate-600 text-sm">
      <div className="max-w-[1360px] mx-auto px-4">
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 pb-12 border-b border-slate-100">
          {/* Brand Info (2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              {settings.logo_type === 'image' && settings.logo ? (
                <img
                  src={settings.logo}
                  alt={settings.website_name || 'Logo'}
                  className="h-10 w-auto max-w-[180px] object-contain"
                />
              ) : settings.logo_type === 'both' && settings.logo ? (
                <div className="flex items-center gap-2">
                  <img
                    src={settings.logo}
                    alt="Logo"
                    className="h-9 w-auto object-contain rounded-md"
                  />
                  <div className="flex flex-col">
                    <span
                      className="text-lg font-black tracking-tight leading-none"
                      style={{ color: settings.accent_color || '#E25C1D' }}
                    >
                      {settings.logo_text || settings.website_name || 'SHUDDHO BAZAR'}
                    </span>
                    {settings.tagline && (
                      <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-0.5">
                        {settings.tagline}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  <span
                    className="text-xl font-extrabold tracking-tight leading-none"
                    style={{ color: settings.accent_color || '#E25C1D' }}
                  >
                    {settings.logo_text || settings.website_name || 'SHUDDHO BAZAR'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-1">
                    {settings.tagline || 'PURE NATURAL LIVING'}
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Shuddho Bazar is an ecommerce platform dedicated to providing safe, chemical-free and reliable natural food to every home in Bangladesh.
            </p>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>Rampura, Dhaka, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>+8809642922922</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>contact@shuddhobazar.com</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-1">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#E25C1D] hover:text-white flex items-center justify-center transition-colors text-slate-600">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#E25C1D] hover:text-white flex items-center justify-center transition-colors text-slate-600">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#E25C1D] hover:text-white flex items-center justify-center transition-colors text-slate-600">
                <Instagram className="w-4 h-4" />
              </a>
            </div>

            {/* App Badges */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold text-slate-700 mb-2">Download App on Mobile :</p>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-black text-white rounded text-[11px] font-medium flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 transition-colors">
                  <span>📱</span>
                  <div>
                    <p className="text-[8px] leading-tight text-slate-400">GET IT ON</p>
                    <p className="text-[11px] font-bold leading-none">Google Play</p>
                  </div>
                </div>
                <div className="px-3 py-1.5 bg-black text-white rounded text-[11px] font-medium flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 transition-colors">
                  <span>🍏</span>
                  <div>
                    <p className="text-[8px] leading-tight text-slate-400">Download on the</p>
                    <p className="text-[11px] font-bold leading-none">App Store</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column: Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Information</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('shop')} className="hover:text-emerald-700">About Us</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-emerald-700">Contact Us</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-emerald-700">Company Information</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-emerald-700">Shuddho Bazar Stories</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-emerald-700">Terms & Conditions</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-emerald-700">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-emerald-700">Careers</button></li>
            </ul>
          </div>

          {/* Column: Shop By */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Shop By</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('shop', 'category=oil-and-ghee')} className="hover:text-emerald-700">Oil & Ghee</button></li>
              <li><button onClick={() => onNavigate('shop', 'category=honey')} className="hover:text-emerald-700">Honey</button></li>
              <li><button onClick={() => onNavigate('shop', 'category=dates')} className="hover:text-emerald-700">Dates</button></li>
              <li><button onClick={() => onNavigate('shop', 'category=spices')} className="hover:text-emerald-700">Spices</button></li>
              <li><button onClick={() => onNavigate('shop', 'category=nuts-and-seeds')} className="hover:text-emerald-700">Nuts & Seeds</button></li>
              <li><button onClick={() => onNavigate('shop', 'category=beverage')} className="hover:text-emerald-700">Beverage</button></li>
              <li><button onClick={() => onNavigate('shop', 'category=organic')} className="hover:text-emerald-700">Functional Foods</button></li>
            </ul>
          </div>

          {/* Column: Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('shop')} className="hover:text-emerald-700">Support Center</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-emerald-700">How to Order</button></li>
              <li><button onClick={() => onNavigate('track-order')} className="hover:text-emerald-700 text-emerald-800 font-medium">Order Tracking</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-emerald-700">Payment Methods</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-emerald-700">Shipping Delivery</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-emerald-700">FAQ</button></li>
            </ul>
          </div>

          {/* Column: Consumer Policy */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Consumer Policy</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('shop')} className="hover:text-emerald-700">Happy Return</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-emerald-700">Refund Policy</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-emerald-700">Exchange</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-emerald-700">Cancellation</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-emerald-700">Pre-Order</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-emerald-700">Extra Discount</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-3">
            <p>© 2026 Shuddho Bazar. Built for Pure & Safe Organic Living in Bangladesh.</p>
            <button
              onClick={() => onNavigate('admin')}
              className="text-[10px] text-slate-400 hover:text-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
              title="Staff & Management Login"
            >
              <span>🔒</span>
              <span>Staff Login</span>
            </button>
          </div>

          {/* Pay With badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-700 mr-1">Pay With:</span>
            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold border border-rose-200 rounded text-[10px]">
              bKash
            </span>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold border border-amber-200 rounded text-[10px]">
              Nagad
            </span>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 rounded text-[10px]">
              Rocket
            </span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold border border-blue-200 rounded text-[10px]">
              VISA
            </span>
            <span className="px-2 py-0.5 bg-red-50 text-red-700 font-bold border border-red-200 rounded text-[10px]">
              MasterCard
            </span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 rounded text-[10px]">
              Cash on Delivery (COD)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
