import React, { useState } from 'react';
import { SiteSettings, Banner, MenuItem, Category, ResponsiveDesignSettings, DeviceType } from '../../types/ecommerce';
import { storage } from '../../services/storage';
import {
  Palette,
  Image as ImageIcon,
  Menu as MenuIcon,
  Sliders,
  Plus,
  Trash2,
  Edit,
  Save,
  Check,
  Upload,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Layers,
  ChevronDown,
  FolderTree,
  X,
  Monitor,
  Tablet,
  Smartphone,
  Grid,
  Eye,
  EyeOff,
  Maximize2,
  CheckCircle2,
  HelpCircle,
  ShoppingBag,
  Compass,
  Heart,
  User,
  Search,
} from 'lucide-react';

interface BrandingThemeTabProps {
  settings: SiteSettings;
  onSettingsUpdated: (updated: SiteSettings) => void;
  onBannersUpdated?: () => void;
}

export const BrandingThemeTab: React.FC<BrandingThemeTabProps> = ({
  settings,
  onSettingsUpdated,
  onBannersUpdated,
}) => {
  // Active Sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'theme' | 'logo' | 'menu' | 'hero' | 'banners' | 'layout'>('logo');
  // Global Responsive Device Mode for editing & previewing
  const [activeDevice, setActiveDevice] = useState<DeviceType>('pc');
  const [saved, setSaved] = useState(false);

  // Theme Colors
  const [themeColor, setThemeColor] = useState(settings.theme_color || '#0D3823');
  const [accentColor, setAccentColor] = useState(settings.accent_color || '#E25C1D');

  // Logo Settings
  const [logoType, setLogoType] = useState<'text' | 'image' | 'both'>(settings.logo_type || 'both');
  const [logoText, setLogoText] = useState(settings.logo_text || 'GHORER BAZAR');
  const [tagline, setTagline] = useState(settings.tagline || 'খাঁটি ও স্বাস্থ্যকর প্রাকৃতিক পণ্যের বিশ্বস্ত প্রতিষ্ঠান');
  const [logoImageUrl, setLogoImageUrl] = useState(settings.logo || '/logo.svg');

  // Responsive Design Settings State
  const [respSettings, setRespSettings] = useState<ResponsiveDesignSettings>(() => {
    return settings.responsive_design || {
      logo_height_pc: 44,
      logo_height_tab: 36,
      logo_height_phone: 28,
      logo_text_size_pc: 22,
      logo_text_size_tab: 18,
      logo_text_size_phone: 15,
      logo_format_pc: settings.logo_type || 'both',
      logo_format_tab: settings.logo_type || 'both',
      logo_format_phone: settings.logo_type || 'both',
      show_tagline_pc: true,
      show_tagline_tab: true,
      show_tagline_phone: false,

      show_category_bar_pc: true,
      show_category_bar_tab: true,
      show_category_bar_phone: false,
      category_bar_font_size_pc: 12,
      category_bar_font_size_tab: 11,
      category_bar_font_size_phone: 11,
      show_search_pc: true,
      show_search_tab: true,
      show_search_phone: true,

      hero_height_pc: 440,
      hero_height_tab: 340,
      hero_height_phone: 220,
      hero_title_size_pc: 34,
      hero_title_size_tab: 26,
      hero_title_size_phone: 20,
      show_side_banner_pc: true,
      show_side_banner_tab: true,
      show_side_banner_phone: false,

      promo_banner_height_pc: 280,
      promo_banner_height_tab: 200,
      promo_banner_height_phone: 150,
      show_promo_banner_pc: true,
      show_promo_banner_tab: true,
      show_promo_banner_phone: true,

      product_cols_pc: 5,
      product_cols_tab: 3,
      product_cols_phone: 2,

      container_max_width: '1360',
      mobile_quick_bar_enabled: true,
    };
  });

  // Menu Items
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    return settings.menu_items && settings.menu_items.length > 0
      ? settings.menu_items
      : [
          { id: 'm-1', label: 'Offer Zone', slug: 'offer-zone', isOffer: true, hasDropdown: false, is_active: true, sort_order: 1 },
          { id: 'm-2', label: 'Honey', slug: 'honey', hasDropdown: true, is_active: true, sort_order: 2 },
          { id: 'm-3', label: 'Oil & Ghee', slug: 'oil-and-ghee', hasDropdown: false, is_active: true, sort_order: 3 },
          { id: 'm-4', label: 'Dates', slug: 'dates', hasDropdown: true, is_active: true, sort_order: 4 },
          { id: 'm-5', label: 'Spices', slug: 'spices', hasDropdown: true, is_active: true, sort_order: 5 },
          { id: 'm-6', label: 'Nuts & Seeds', slug: 'nuts-and-seeds', hasDropdown: true, is_active: true, sort_order: 6 },
        ];
  });

  const [newMenuLabel, setNewMenuLabel] = useState('');
  const [newMenuSlug, setNewMenuSlug] = useState('');
  const [newMenuIsOffer, setNewMenuIsOffer] = useState(false);
  const [newMenuHasDropdown, setNewMenuHasDropdown] = useState(false);

  // Sub-menus management state
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);
  const [newSubLabel, setNewSubLabel] = useState('');
  const [newSubSlug, setNewSubSlug] = useState('');

  // Banners state
  const [banners, setBanners] = useState<Banner[]>(() => storage.getBanners());
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Color Presets
  const themePresets = [
    { label: 'Forest Green (Default)', color: '#0D3823' },
    { label: 'Emerald Pure', color: '#065F46' },
    { label: 'Deep Organic Olive', color: '#365314' },
    { label: 'Midnight Navy', color: '#0F172A' },
    { label: 'Royal Indigo', color: '#1E1B4B' },
    { label: 'Warm Cocoa', color: '#451A03' },
  ];

  const accentPresets = [
    { label: 'Brand Orange (Default)', color: '#E25C1D' },
    { label: 'Amber Gold', color: '#D97706' },
    { label: 'Crimson Red', color: '#DC2626' },
    { label: 'Leaf Emerald', color: '#059669' },
    { label: 'Golden Honey', color: '#F59E0B' },
    { label: 'Vibrant Coral', color: '#F97316' },
  ];

  const presetImages = [
    { label: 'Organic Harvest Hero', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&h=700&fit=crop' },
    { label: 'Pure Honey Banner', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1600&h=700&fit=crop' },
    { label: 'Spices & Culinary', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&h=700&fit=crop' },
    { label: 'Dates & Nuts Feast', url: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=1600&h=700&fit=crop' },
  ];

  // Helper to update responsive settings
  const updateResp = (key: keyof ResponsiveDesignSettings, val: any) => {
    setRespSettings(prev => ({
      ...prev,
      [key]: val,
    }));
  };

  // Save Settings
  const handleSaveSettings = () => {
    if (!logoText.trim() && !logoImageUrl.trim()) {
      alert('দয়া করে ব্র্যান্ডের নাম অথবা লোগো ইমেজ (বা উভয়ই) দিন। (Please provide brand text or logo image, or both.)');
      return;
    }
    const updated = storage.updateSettings({
      theme_color: themeColor,
      accent_color: accentColor,
      logo_type: logoType,
      logo_text: logoText.trim(),
      logo_icon: '',
      tagline: tagline.trim(),
      logo: logoImageUrl.trim(),
      menu_items: menuItems,
      responsive_design: respSettings,
    });
    onSettingsUpdated(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Add Menu Item
  const handleAddMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuLabel.trim()) return;
    const newItem: MenuItem = {
      id: `menu-${Date.now()}`,
      label: newMenuLabel.trim(),
      slug: newMenuSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || newMenuLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      isOffer: newMenuIsOffer,
      hasDropdown: newMenuHasDropdown,
      is_active: true,
      sort_order: menuItems.length + 1,
      device_visibility: 'all',
    };
    const updated = [...menuItems, newItem];
    setMenuItems(updated);
    setNewMenuLabel('');
    setNewMenuSlug('');
    setNewMenuIsOffer(false);
    setNewMenuHasDropdown(false);
  };

  const handleDeleteMenuItem = (id: string) => {
    setMenuItems(menuItems.filter(m => m.id !== id));
  };

  const handleMoveMenuItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === menuItems.length - 1) return;
    const newItems = [...menuItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setMenuItems(newItems);
  };

  // Sub-menu handlers
  const handleAddSubItem = (parentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubLabel.trim()) return;
    const parent = menuItems.find(m => m.id === parentId);
    if (!parent) return;

    const subItem = {
      id: `sub-${Date.now()}`,
      label: newSubLabel.trim(),
      slug: newSubSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || newSubLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      is_active: true,
      sort_order: ((parent.sub_items?.length) || 0) + 1,
      device_visibility: 'all' as const,
    };

    setMenuItems(prev => prev.map(m => {
      if (m.id === parentId) {
        const updatedSubs = [...(m.sub_items || []), subItem];
        return {
          ...m,
          sub_items: updatedSubs,
          hasDropdown: updatedSubs.length > 0,
        };
      }
      return m;
    }));

    setNewSubLabel('');
    setNewSubSlug('');
  };

  const handleDeleteSubItem = (parentId: string, subId: string) => {
    setMenuItems(prev => prev.map(m => {
      if (m.id === parentId) {
        const updatedSubs = (m.sub_items || []).filter(s => s.id !== subId);
        return {
          ...m,
          sub_items: updatedSubs,
          hasDropdown: updatedSubs.length > 0,
        };
      }
      return m;
    }));
  };

  // Banner CRUD
  const handleSaveBannerModal = (bannerData: Partial<Banner>) => {
    if (!bannerData.title || !bannerData.image_desktop) return;
    storage.saveBanner({
      id: editingBanner ? editingBanner.id : undefined,
      title: bannerData.title,
      subtitle: bannerData.subtitle || '',
      image_desktop: bannerData.image_desktop,
      image_mobile: bannerData.image_mobile || '',
      button_text: bannerData.button_text || 'Shop Now',
      button_url: bannerData.button_url || '/shop',
      position: bannerData.position || 'hero_main',
      status: bannerData.status || 'active',
      sort_order: bannerData.sort_order || 1,
    });
    setBanners(storage.getBanners());
    setEditingBanner(null);
    if (onBannersUpdated) onBannersUpdated();
  };

  const handleDeleteBanner = (id: string) => {
    if (confirm('Delete this banner slide?')) {
      storage.deleteBanner(id);
      setBanners(storage.getBanners());
      if (onBannersUpdated) onBannersUpdated();
    }
  };

  // File upload to base64 helper
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          callback(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const heroMainBanners = banners.filter(b => b.position === 'hero_main');
  const sideBanner = banners.find(b => b.position === 'hero_side');
  const middleBanner = banners.find(b => b.position === 'middle_promo');

  // Active device parameters for Logo & Header
  const activeLogoHeight = activeDevice === 'pc' ? respSettings.logo_height_pc : activeDevice === 'tab' ? respSettings.logo_height_tab : respSettings.logo_height_phone;
  const activeLogoTextSize = activeDevice === 'pc' ? respSettings.logo_text_size_pc : activeDevice === 'tab' ? respSettings.logo_text_size_tab : respSettings.logo_text_size_phone;
  const activeLogoFormat = activeDevice === 'pc' ? respSettings.logo_format_pc : activeDevice === 'tab' ? respSettings.logo_format_tab : respSettings.logo_format_phone;
  const activeShowTagline = activeDevice === 'pc' ? respSettings.show_tagline_pc : activeDevice === 'tab' ? respSettings.show_tagline_tab : respSettings.show_tagline_phone;

  return (
    <div className="space-y-6">
      {/* Top Banner with Device Mode Switcher */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 p-5 sm:p-6 rounded-2xl text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Palette className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">Responsive Theme & Visual Designer</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            কোনো ডিজাইনই ফিক্সড বা পার্মানেন্ট নয়! আপনি PC, Tab এবং Phone (Mobile) এর জন্য আলাদাভাবে লোগোর আকার, ফন্ট সাইজ, মেনু বার এবং গ্রিড সম্পূর্ণ রেসপন্সিভভাবে কাস্টমাইজ করতে পারবেন।
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={handleSaveSettings}
            className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#E25C1D] hover:bg-[#c94f17] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'সব পরিবর্তন সেভ হয়েছে!' : 'Save & Apply All Changes'}</span>
          </button>
        </div>
      </div>

      {/* GLOBAL DEVICE VIEW SWITCHER (PC / Tab / Phone) */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">ডিভাইস ভিউ মোড নির্বাচন করুন:</span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">(Select device breakpoint to customize)</span>
        </div>

        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 w-full sm:w-auto justify-center">
          <button
            type="button"
            onClick={() => setActiveDevice('pc')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeDevice === 'pc'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-4 h-4 text-emerald-700" />
            <span>🖥️ PC / Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDevice('tab')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeDevice === 'tab'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tablet className="w-4 h-4 text-blue-600" />
            <span>📱 Tablet (ট্যাব)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDevice('phone')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeDevice === 'phone'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-[#E25C1D]" />
            <span>📲 Phone (মোবাইল)</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('theme')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'theme'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Website Theme Colors</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logo')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'logo'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Store Logo & Tagline (PC / Tab / Phone)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('menu')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'menu'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <MenuIcon className="w-4 h-4" />
          <span>Navigation Menu Manager (ক্যাটাগরি বার)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('hero')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'hero'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Hero Slider Slides ({heroMainBanners.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('banners')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'banners'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Side & Middle Promo Banners</span>
        </button>

        <button
          onClick={() => setActiveSubTab('layout')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'layout'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <Grid className="w-4 h-4 text-emerald-600" />
          <span>Responsive Grids & Layout (পণ্য কলাম)</span>
        </button>
      </div>

      {/* 1. THEME COLOR SETTINGS */}
      {activeSubTab === 'theme' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Primary Theme Color (মূল থিম কালার)</h3>
              <p className="text-xs text-slate-500 mb-3">
                Used for header accents, category bar, buttons, borders, and footer branding.
              </p>

              <div className="flex items-center gap-4 mb-4">
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-12 h-12 rounded-xl border border-slate-300 cursor-pointer p-0.5"
                />
                <div>
                  <div className="font-mono font-bold text-sm text-slate-800">{themeColor}</div>
                  <div className="text-[11px] text-slate-400">Click swatch to pick custom color</div>
                </div>
              </div>

              <div className="text-xs font-semibold text-slate-600 mb-2">Preset Palettes:</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {themePresets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setThemeColor(p.color)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                      themeColor.toLowerCase() === p.color.toLowerCase()
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: p.color }} />
                    <span className="truncate">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Accent & Call-to-Action Color (একসেন্ট ও বাটন কালার)</h3>
              <p className="text-xs text-slate-500 mb-3">
                Used for primary "Buy Now", "Add to Cart", discount badges, price highlights, and action buttons.
              </p>

              <div className="flex items-center gap-4 mb-4">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-12 h-12 rounded-xl border border-slate-300 cursor-pointer p-0.5"
                />
                <div>
                  <div className="font-mono font-bold text-sm text-slate-800">{accentColor}</div>
                  <div className="text-[11px] text-slate-400">Click swatch to pick custom accent</div>
                </div>
              </div>

              <div className="text-xs font-semibold text-slate-600 mb-2">Preset Accents:</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {accentPresets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAccentColor(p.color)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                      accentColor.toLowerCase() === p.color.toLowerCase()
                        ? 'border-orange-600 bg-orange-50 text-orange-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: p.color }} />
                    <span className="truncate">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Theme Colors</span>
            </button>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Live Color Swatch Simulation</h4>
              <div className="p-4 rounded-xl space-y-3" style={{ backgroundColor: themeColor, color: '#fff' }}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Theme Preview Header</span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">100% Pure Organic</span>
                </div>
                <p className="text-xs text-slate-200">
                  This background reflects your primary theme color selection across desktop & mobile.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    className="px-4 py-2 rounded-lg text-white font-bold text-xs shadow-sm"
                    style={{ backgroundColor: accentColor }}
                  >
                    Accent Button (৳১,৯৯০)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. STORE LOGO & TAGLINE WITH PC / TAB / PHONE CONTROLS */}
      {activeSubTab === 'logo' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Website Logo, Brand Name & Tagline (PC, Tab ও Phone সেটিংস)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  লোগোর ছবি ও নাম আপলোড করুন এবং PC, Tablet ও Phone এর জন্য আলাদা সাইজ ও ডিসপ্লে স্টাইল সেট করুন।
                </p>
              </div>

              {/* Quick device pills inside logo tab */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveDevice('pc')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    activeDevice === 'pc' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>PC</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDevice('tab')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    activeDevice === 'tab' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Tab</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDevice('phone')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    activeDevice === 'phone' ? 'bg-white text-[#E25C1D] shadow-2xs font-extrabold' : 'text-slate-500'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Phone</span>
                </button>
              </div>
            </div>

            {/* Global Logo Image & Name inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Logo Image */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Logo Image (লোগো ছবি)</label>
                  {logoImageUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoImageUrl('')}
                      className="text-[11px] text-rose-600 hover:underline font-medium cursor-pointer"
                    >
                      ছবি মুছুন (Remove)
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {logoImageUrl ? (
                    <div className="w-16 h-12 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center shrink-0 shadow-2xs">
                      <img src={logoImageUrl} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : null}

                  <input
                    type="text"
                    value={logoImageUrl}
                    onChange={(e) => setLogoImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                    placeholder="https://... logo image URL"
                  />

                  <label className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileUpload(e, (url) => setLogoImageUrl(url))}
                    />
                  </label>
                </div>
              </div>

              {/* Brand Name & Tagline */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Brand Name / Website Name (ব্র্যান্ড নাম)
                  </label>
                  <input
                    type="text"
                    value={logoText}
                    onChange={(e) => setLogoText(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-bold bg-white"
                    placeholder="GHORER BAZAR"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Brand Tagline (ট্যাগলাইন)
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                    placeholder="Natural & Safe Food"
                  />
                </div>
              </div>
            </div>

            {/* DEVICE-BY-DEVICE SPECIFIC CONTROLS (PC, TAB, PHONE) */}
            <div className="p-4 rounded-2xl border-2 border-emerald-600/30 bg-emerald-50/20 space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-emerald-100 text-emerald-800">
                    {activeDevice === 'pc' ? <Monitor className="w-4 h-4" /> : activeDevice === 'tab' ? <Tablet className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                    {activeDevice === 'pc' ? '🖥️ PC / Desktop ভিউ সেটিংস' : activeDevice === 'tab' ? '📱 Tablet (ট্যাব) ভিউ সেটিংস' : '📲 Phone (মোবাইল) ভিউ সেটিংস'}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  সরাসরি লাইভ ইফেক্ট
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Presentation format */}
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    প্রদর্শন পদ্ধতি ({activeDevice.toUpperCase()})
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['both', 'image', 'text'] as const).map(fmt => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => {
                          if (activeDevice === 'pc') updateResp('logo_format_pc', fmt);
                          else if (activeDevice === 'tab') updateResp('logo_format_tab', fmt);
                          else updateResp('logo_format_phone', fmt);
                        }}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                          activeLogoFormat === fmt
                            ? 'bg-[#E25C1D] text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {fmt === 'both' ? 'Both' : fmt === 'image' ? 'Image' : 'Text'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Logo Height */}
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Logo Image Height</label>
                    <span className="font-mono font-bold text-xs text-[#E25C1D]">{activeLogoHeight}px</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="80"
                    value={activeLogoHeight}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (activeDevice === 'pc') updateResp('logo_height_pc', val);
                      else if (activeDevice === 'tab') updateResp('logo_height_tab', val);
                      else updateResp('logo_height_phone', val);
                    }}
                    className="w-full accent-[#E25C1D] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>18px (Small)</span>
                    <span>80px (Large)</span>
                  </div>
                </div>

                {/* 3. Text Size & Tagline */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Brand Text Size</label>
                    <span className="font-mono font-bold text-xs text-[#E25C1D]">{activeLogoTextSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="32"
                    value={activeLogoTextSize}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (activeDevice === 'pc') updateResp('logo_text_size_pc', val);
                      else if (activeDevice === 'tab') updateResp('logo_text_size_tab', val);
                      else updateResp('logo_text_size_phone', val);
                    }}
                    className="w-full accent-[#E25C1D] cursor-pointer"
                  />
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600">ট্যাগলাইন দেখান:</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (activeDevice === 'pc') updateResp('show_tagline_pc', !respSettings.show_tagline_pc);
                        else if (activeDevice === 'tab') updateResp('show_tagline_tab', !respSettings.show_tagline_tab);
                        else updateResp('show_tagline_phone', !respSettings.show_tagline_phone);
                      }}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                        activeShowTagline ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {activeShowTagline ? 'ON (প্রদর্শিত)' : 'OFF (লুকানো)'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* REAL-TIME DEVICE VIEWPORT SIMULATION (Live Preview) */}
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-700" />
                  <span>লাইভ ডিভাইস সিমুলেটর (Live Device Viewport Preview):</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Selected viewport: <strong className="text-slate-800 capitalize">{activeDevice} View</strong>
                </span>
              </div>

              {/* Viewport Frame */}
              <div className="flex justify-center p-2 sm:p-4 bg-slate-200/70 rounded-xl overflow-x-auto">
                <div
                  className={`bg-white rounded-2xl border-2 border-slate-300 shadow-md transition-all duration-300 overflow-hidden ${
                    activeDevice === 'phone'
                      ? 'w-[375px] max-w-full'
                      : activeDevice === 'tab'
                      ? 'w-[720px] max-w-full'
                      : 'w-full max-w-[1000px]'
                  }`}
                >
                  {/* Top phone bezel indicator */}
                  {activeDevice === 'phone' && (
                    <div className="bg-slate-900 text-white px-4 py-1 flex items-center justify-between text-[10px]">
                      <span>9:41</span>
                      <div className="w-16 h-3 bg-black rounded-full" />
                      <span>5G 100%</span>
                    </div>
                  )}

                  {/* Header Preview Row */}
                  <div className="p-3 sm:p-4 flex items-center justify-between gap-2 border-b border-slate-100 bg-white">
                    {/* Logo preview */}
                    <div className="flex items-center gap-2 min-w-0">
                      {(activeLogoFormat === 'image' || activeLogoFormat === 'both') && logoImageUrl && (
                        <img
                          src={logoImageUrl}
                          alt="Logo"
                          style={{ height: `${activeLogoHeight}px` }}
                          className="w-auto object-contain shrink-0"
                        />
                      )}
                      {(activeLogoFormat === 'text' || activeLogoFormat === 'both') && (
                        <div className="flex flex-col min-w-0">
                          <span
                            className="font-extrabold tracking-tight leading-none truncate"
                            style={{ fontSize: `${activeLogoTextSize}px`, color: accentColor }}
                          >
                            {logoText || 'GHORER BAZAR'}
                          </span>
                          {activeShowTagline && tagline && (
                            <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5 truncate">
                              {tagline}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Search preview */}
                    <div className="flex-1 max-w-xs mx-2 hidden sm:block">
                      <div className="h-8 rounded-full border border-slate-200 bg-slate-50 px-3 flex items-center justify-between text-xs text-slate-400">
                        <span>Search in...</span>
                        <Search className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Right actions preview */}
                    {activeDevice === 'phone' ? (
                      <div className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1 shrink-0">
                        <MenuIcon className="w-3.5 h-3.5" />
                        <span>Menu</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-slate-600 text-xs shrink-0">
                        <span className="flex items-center gap-1 font-semibold text-emerald-800">
                          <Compass className="w-3.5 h-3.5" /> Track
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-[#E25C1D]">
                          <ShoppingBag className="w-3.5 h-3.5" /> Cart (2)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Category bar preview */}
                  {((activeDevice === 'pc' && respSettings.show_category_bar_pc) ||
                    (activeDevice === 'tab' && respSettings.show_category_bar_tab) ||
                    (activeDevice === 'phone' && respSettings.show_category_bar_phone)) && (
                    <div className="bg-[#0A281E] text-white px-4 py-2 flex items-center gap-4 text-[11px] overflow-x-auto">
                      <span className="text-amber-300 font-bold">Offer Zone</span>
                      <span>Honey</span>
                      <span>Oil & Ghee</span>
                      <span>Dates</span>
                      <span>Spices</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Logo & Tagline Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. NAVIGATION MENU MANAGER (With PC/Tab/Phone category bar toggles) */}
      {activeSubTab === 'menu' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            {/* RESPONSIVE CATEGORY BAR TOGGLES */}
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                    গাঢ় সবুজ ক্যাটাগরি মেনু বার (Category Navbar Responsive Visibility)
                  </h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    হেডারের নিচের সবুজ ক্যাটাগরি বারটি PC, Tablet ও Phone এ দেখাবেন কি না তা এখান থেকে সুইচ করুন।
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* PC Toggle */}
                <div className="bg-white p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-emerald-700" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">PC / Desktop</div>
                      <div className="text-[10px] text-slate-400">কম্পিউটার ও ল্যাপটপ</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateResp('show_category_bar_pc', !respSettings.show_category_bar_pc)}
                    className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                      respSettings.show_category_bar_pc ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {respSettings.show_category_bar_pc ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Tablet Toggle */}
                <div className="bg-white p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tablet className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">Tablet (ট্যাব)</div>
                      <div className="text-[10px] text-slate-400">আইপ্যাড ও ট্যাবলেট</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateResp('show_category_bar_tab', !respSettings.show_category_bar_tab)}
                    className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                      respSettings.show_category_bar_tab ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {respSettings.show_category_bar_tab ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Phone Toggle */}
                <div className="bg-white p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#E25C1D]" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">Phone (মোবাইল)</div>
                      <div className="text-[10px] text-slate-400">স্মার্টফোন ভিউ</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateResp('show_category_bar_phone', !respSettings.show_category_bar_phone)}
                    className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                      respSettings.show_category_bar_phone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {respSettings.show_category_bar_phone ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Website Header Navigation Links</h3>
                <p className="text-xs text-slate-500">
                  Add, remove, or reorder the category links shown in the top navigation bar.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                Total Links: {menuItems.length}
              </span>
            </div>

            {/* Menu Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3 w-12 text-center">Order</th>
                    <th className="py-2.5 px-3">Menu Label</th>
                    <th className="py-2.5 px-3">Target Slug / Category</th>
                    <th className="py-2.5 px-3 text-center">Special Offer Badge</th>
                    <th className="py-2.5 px-3 text-center">Sub-menus (সাব-মেনু ও ড্রপডাউন)</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {menuItems.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <tr className={`hover:bg-slate-50/60 transition-colors ${expandedMenuId === item.id ? 'bg-emerald-50/20' : ''}`}>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveMenuItem(index, 'up')}
                              disabled={index === 0}
                              className="p-1 hover:bg-slate-200 rounded disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3 text-slate-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveMenuItem(index, 'down')}
                              disabled={index === menuItems.length - 1}
                              className="p-1 hover:bg-slate-200 rounded disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3 text-slate-600" />
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {item.label}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">
                          {item.slug}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {item.isOffer ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                              Offer Zone
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setExpandedMenuId(expandedMenuId === item.id ? null : item.id);
                              setNewSubLabel('');
                              setNewSubSlug('');
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              item.sub_items && item.sub_items.length > 0
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 shadow-2xs'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            <FolderTree className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              {item.sub_items && item.sub_items.length > 0
                                ? `${item.sub_items.length}টি সাব-মেনু`
                                : '+ সাব-মেনু যোগ'}
                            </span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                expandedMenuId === item.id ? 'rotate-180 text-emerald-700' : ''
                              }`}
                            />
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteMenuItem(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete menu link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>

                      {/* Sub-menus expander */}
                      {expandedMenuId === item.id && (
                        <tr>
                          <td colSpan={6} className="bg-slate-50/80 p-4 border-y border-slate-200">
                            <div className="max-w-xl mx-auto space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <h5 className="font-bold text-xs text-slate-800">
                                  {item.label} এর সাব-মেনু (Sub-categories)
                                </h5>
                                <button
                                  type="button"
                                  onClick={() => setExpandedMenuId(null)}
                                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              {item.sub_items && item.sub_items.length > 0 ? (
                                <div className="space-y-1.5">
                                  {item.sub_items.map((sub) => (
                                    <div
                                      key={sub.id}
                                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                                    >
                                      <span className="font-semibold text-slate-800">{sub.label}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-slate-400 text-[11px]">{sub.slug}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteSubItem(item.id, sub.id)}
                                          className="text-rose-600 hover:bg-rose-50 p-1 rounded cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic">কোনো সাব-মেনু যোগ করা হয়নি।</p>
                              )}

                              <form onSubmit={(e) => handleAddSubItem(item.id, e)} className="flex gap-2 pt-2">
                                <input
                                  type="text"
                                  placeholder="সাব-মেনুর নাম (যেমন: সুন্দরবনের মধু)"
                                  value={newSubLabel}
                                  onChange={(e) => setNewSubLabel(e.target.value)}
                                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                                />
                                <button
                                  type="submit"
                                  className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>যোগ করুন</span>
                                </button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add New Top Menu Item Form */}
            <form onSubmit={handleAddMenuItem} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[180px]">
                <label className="text-xs font-semibold text-slate-700 block mb-1">নতুন মেনুর নাম</label>
                <input
                  type="text"
                  placeholder="যেমন: ঘি ও মাখন"
                  value={newMenuLabel}
                  onChange={(e) => setNewMenuLabel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div className="flex-1 min-w-[180px]">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Target Slug / Link</label>
                <input
                  type="text"
                  placeholder="ghee-and-butter"
                  value={newMenuSlug}
                  onChange={(e) => setNewMenuSlug(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pb-2">
                <input
                  type="checkbox"
                  id="offerBadgeCheck"
                  checked={newMenuIsOffer}
                  onChange={(e) => setNewMenuIsOffer(e.target.checked)}
                  className="rounded text-orange-600 cursor-pointer"
                />
                <label htmlFor="offerBadgeCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Offer Zone (Yellow badge)
                </label>
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Navigation Link</span>
              </button>
            </form>

            <button
              onClick={handleSaveSettings}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Navigation Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. HERO SLIDER SLIDES (Responsive heights & Mobile image) */}
      {activeSubTab === 'hero' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            {/* Responsive Slider Heights for PC, Tab, Phone */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                হিরো স্লাইডারের উচ্চতা ও টাইটেল সাইজ (Hero Slider Responsive Dimensions)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {/* PC */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-emerald-700" /> PC Slider Height
                    </span>
                    <span className="text-[#E25C1D]">{respSettings.hero_height_pc}px</span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="600"
                    value={respSettings.hero_height_pc}
                    onChange={(e) => updateResp('hero_height_pc', Number(e.target.value))}
                    className="w-full accent-[#E25C1D] cursor-pointer"
                  />
                </div>

                {/* Tab */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Tablet className="w-3.5 h-3.5 text-blue-600" /> Tab Slider Height
                    </span>
                    <span className="text-[#E25C1D]">{respSettings.hero_height_tab}px</span>
                  </div>
                  <input
                    type="range"
                    min="220"
                    max="450"
                    value={respSettings.hero_height_tab}
                    onChange={(e) => updateResp('hero_height_tab', Number(e.target.value))}
                    className="w-full accent-[#E25C1D] cursor-pointer"
                  />
                </div>

                {/* Phone */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-[#E25C1D]" /> Phone Slider Height
                    </span>
                    <span className="text-[#E25C1D]">{respSettings.hero_height_phone}px</span>
                  </div>
                  <input
                    type="range"
                    min="160"
                    max="320"
                    value={respSettings.hero_height_phone}
                    onChange={(e) => updateResp('hero_height_phone', Number(e.target.value))}
                    className="w-full accent-[#E25C1D] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Slider cards list */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hero Slider Slides List</h3>
                <p className="text-xs text-slate-500">Manage large hero slides and upload dedicated phone banner images.</p>
              </div>
              <button
                onClick={() => setEditingBanner({
                  id: `b-${Date.now()}`,
                  title: 'Pure Organic Collection',
                  subtitle: 'প্রাকৃতিক ও নির্ভেজাল খাদ্যের নিশ্চয়তা',
                  image_desktop: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&h=700&fit=crop',
                  image_mobile: '',
                  button_text: 'Shop Now',
                  button_url: '/shop',
                  position: 'hero_main',
                  status: 'active',
                  sort_order: heroMainBanners.length + 1,
                })}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Slide</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {heroMainBanners.map((slide, index) => (
                <div key={slide.id} className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-slate-50 flex flex-col justify-between">
                  <div className="relative aspect-[16/8] bg-slate-900 overflow-hidden group">
                    <img
                      src={slide.image_desktop}
                      alt={slide.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-emerald-300">Slide #{index + 1}</span>
                        {slide.image_mobile && (
                          <span className="text-[9px] bg-emerald-500 text-slate-900 font-bold px-1.5 py-0.2 rounded-full">
                            Phone Image Attached
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-sm leading-tight text-white line-clamp-1">{slide.title}</h4>
                      <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">{slide.subtitle}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white flex items-center justify-between border-t border-slate-100">
                    <div className="text-[11px] text-slate-500">
                      CTA: <strong className="text-slate-800">{slide.button_text}</strong> ({slide.button_url})
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingBanner(slide)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit Slide"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(slide.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveSettings}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Hero Slider Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. SIDE PROMO & MIDDLE BANNER MANAGER (Responsive visibility) */}
      {activeSubTab === 'banners' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Side Hero Promo Banner */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Side Hero Promotional Banner</h3>
                  <p className="text-[11px] text-slate-500">Displayed next to the hero slider (Honey Promo)</p>
                </div>
                {sideBanner && (
                  <button
                    onClick={() => setEditingBanner(sideBanner)}
                    className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit Banner</span>
                  </button>
                )}
              </div>

              {/* Responsive Visibility Controls for Side Banner */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">সাইড ব্যানার কোথায় দেখাবেন:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => updateResp('show_side_banner_pc', !respSettings.show_side_banner_pc)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      respSettings.show_side_banner_pc ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    PC: {respSettings.show_side_banner_pc ? 'ON' : 'OFF'}
                  </button>

                  <button
                    type="button"
                    onClick={() => updateResp('show_side_banner_tab', !respSettings.show_side_banner_tab)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      respSettings.show_side_banner_tab ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    Tab: {respSettings.show_side_banner_tab ? 'ON' : 'OFF'}
                  </button>

                  <button
                    type="button"
                    onClick={() => updateResp('show_side_banner_phone', !respSettings.show_side_banner_phone)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      respSettings.show_side_banner_phone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    Phone: {respSettings.show_side_banner_phone ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              {sideBanner && (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-[16/10] relative">
                  <img
                    src={sideBanner.image_desktop}
                    alt={sideBanner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end text-white space-y-1">
                    <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Side Promo</span>
                    <h4 className="text-sm font-bold text-white line-clamp-2">{sideBanner.title}</h4>
                    <p className="text-[11px] text-slate-300 line-clamp-1">{sideBanner.subtitle}</p>
                    <div className="pt-1">
                      <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#E25C1D] text-white inline-block">
                        {sideBanner.button_text}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Middle Wide Promo Banner */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Middle Promotional Banner</h3>
                  <p className="text-[11px] text-slate-500">Wide showcase banner in middle of homepage</p>
                </div>
                {middleBanner && (
                  <button
                    onClick={() => setEditingBanner(middleBanner)}
                    className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit Banner</span>
                  </button>
                )}
              </div>

              {/* Middle Banner Responsive Toggles & Heights */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">মিডল ব্যানার ডিসপ্লে নিয়ন্ত্রণ:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => updateResp('show_promo_banner_pc', !respSettings.show_promo_banner_pc)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      respSettings.show_promo_banner_pc ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    PC: {respSettings.show_promo_banner_pc ? 'ON' : 'OFF'}
                  </button>

                  <button
                    type="button"
                    onClick={() => updateResp('show_promo_banner_tab', !respSettings.show_promo_banner_tab)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      respSettings.show_promo_banner_tab ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    Tab: {respSettings.show_promo_banner_tab ? 'ON' : 'OFF'}
                  </button>

                  <button
                    type="button"
                    onClick={() => updateResp('show_promo_banner_phone', !respSettings.show_promo_banner_phone)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      respSettings.show_promo_banner_phone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    Phone: {respSettings.show_promo_banner_phone ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              {middleBanner && (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-[16/10] relative">
                  <img
                    src={middleBanner.image_desktop}
                    alt={middleBanner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end text-white space-y-1">
                    <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Cooking Essentials Banner</span>
                    <h4 className="text-sm font-bold text-white line-clamp-2">{middleBanner.title}</h4>
                    <p className="text-[11px] text-slate-300 line-clamp-1">{middleBanner.subtitle}</p>
                    <div className="pt-1">
                      <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#E25C1D] text-white inline-block">
                        {middleBanner.button_text}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Banner Settings</span>
          </button>
        </div>
      )}

      {/* 6. RESPONSIVE PRODUCT GRIDS & LAYOUT (NEW TAB) */}
      {activeSubTab === 'layout' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Responsive Product Grid Columns & Container Layout
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              PC, Tablet এবং Phone (মোবাইল) এ প্রতি সারিতে কতটি করে প্রোডাক্ট কার্ড প্রদর্শিত হবে তা নিজের ইচ্ছেমতো সেট করুন।
            </p>
          </div>

          {/* Product Columns per device */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* PC Product Columns */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-800">🖥️ PC / Desktop Columns</span>
              </div>
              <p className="text-[11px] text-slate-500">কম্পিউটার বা বড় মনিটরে প্রতি সারিতে প্রোডাক্ট সংখ্যা:</p>
              <div className="grid grid-cols-4 gap-2">
                {[3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => updateResp('product_cols_pc', num)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      respSettings.product_cols_pc === num
                        ? 'border-emerald-600 bg-emerald-700 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {num} টি
                  </button>
                ))}
              </div>
            </div>

            {/* Tablet Product Columns */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center gap-2">
                <Tablet className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">📱 Tablet Columns</span>
              </div>
              <p className="text-[11px] text-slate-500">ট্যাবলেট বা আইপ্যাডে প্রতি সারিতে প্রোডাক্ট সংখ্যা:</p>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 4].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => updateResp('product_cols_tab', num)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      respSettings.product_cols_tab === num
                        ? 'border-blue-600 bg-blue-700 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {num} টি
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Product Columns */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#E25C1D]" />
                <span className="text-xs font-bold text-slate-800">📲 Phone (Mobile) Columns</span>
              </div>
              <p className="text-[11px] text-slate-500">স্মার্টফোনের স্ক্রিনে প্রতি সারিতে প্রোডাক্ট সংখ্যা:</p>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => updateResp('product_cols_phone', num)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      respSettings.product_cols_phone === num
                        ? 'border-[#E25C1D] bg-[#E25C1D] text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {num === 1 ? '১টি (Single Card)' : '২টি (Dual Grid)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Container Max Width */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">ওয়েবসাইট কনটেইনারের সর্বোচ্চ প্রস্থ (Page Container Width)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Boxed (1200px)', val: '1200' },
                { label: 'Standard (1360px)', val: '1360' },
                { label: 'Wide (1440px)', val: '1440' },
                { label: 'Full Width (100%)', val: '100%' },
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => updateResp('container_max_width', opt.val as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    respSettings.container_max_width === opt.val
                      ? 'border-emerald-700 bg-emerald-800 text-white shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Grid & Layout Settings</span>
          </button>
        </div>
      )}

      {/* BANNER EDIT MODAL (Supports both Desktop and Mobile Phone Image Upload!) */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Edit Banner Slide (ডেস্কটপ ও মোবাইল ছবি)
              </h3>
              <button
                onClick={() => setEditingBanner(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Banner Title</label>
                <input
                  type="text"
                  value={editingBanner.title}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Subtitle / Bengali Description</label>
                <textarea
                  rows={2}
                  value={editingBanner.subtitle}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              {/* 1. Desktop Image */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-emerald-700" />
                    <span>PC & Desktop Image URL (Landscape) *</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={editingBanner.image_desktop}
                  onChange={(e) => setEditingBanner({ ...editingBanner, image_desktop: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  required
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-white text-[11px] font-semibold cursor-pointer">
                  <Upload className="w-3 h-3" />
                  <span>Upload Desktop Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFileUpload(e, (url) => setEditingBanner({ ...editingBanner, image_desktop: url }))}
                  />
                </label>
              </div>

              {/* 2. Mobile Phone Image */}
              <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-[#E25C1D]" />
                    <span>Phone / Mobile Image (ঐচ্ছিক - মোবাইলের জন্য অপ্টিমাইজড ছবি)</span>
                  </label>
                  {editingBanner.image_mobile && (
                    <button
                      type="button"
                      onClick={() => setEditingBanner({ ...editingBanner, image_mobile: '' })}
                      className="text-[10px] text-rose-600 hover:underline"
                    >
                      রিমুভ
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={editingBanner.image_mobile || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, image_mobile: e.target.value })}
                  placeholder="https://... phone-optimized banner image"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#E25C1D] text-white text-[11px] font-semibold cursor-pointer">
                  <Upload className="w-3 h-3" />
                  <span>Upload Phone Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFileUpload(e, (url) => setEditingBanner({ ...editingBanner, image_mobile: url }))}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Button Text</label>
                  <input
                    type="text"
                    value={editingBanner.button_text}
                    onChange={(e) => setEditingBanner({ ...editingBanner, button_text: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Button Target Link</label>
                  <input
                    type="text"
                    value={editingBanner.button_url}
                    onChange={(e) => setEditingBanner({ ...editingBanner, button_url: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveBannerModal(editingBanner)}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Banner</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
