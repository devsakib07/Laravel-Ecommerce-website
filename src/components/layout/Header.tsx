import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, Heart, User, Compass, Menu, X, ChevronDown, ChevronRight, ShieldCheck } from 'lucide-react';
import { storage } from '../../services/storage';
import { Product } from '../../types/ecommerce';
import { INITIAL_SETTINGS } from '../../data/initialData';

interface HeaderProps {
  onNavigate: (route: string, param?: string) => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  currentRoute: string;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  onOpenCart,
  onOpenAuth,
  currentRoute,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cartBump, setCartBump] = useState(false);
  const [settings, setSettings] = useState(() => storage.getSettings());
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const syncState = () => {
    const cart = storage.getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + item.total_price, 0);
    setCartCount(count);
    setCartTotal(total);

    const wishlist = storage.getWishlist();
    setWishlistCount(wishlist.length);
    setSettings(storage.getSettings());
  };

  useEffect(() => {
    syncState();
    let bumpTimer: ReturnType<typeof setTimeout>;
    const handleBump = () => {
      setCartBump(true);
      clearTimeout(bumpTimer);
      bumpTimer = setTimeout(() => setCartBump(false), 500);
    };

    window.addEventListener('cart-updated', syncState);
    window.addEventListener('wishlist-updated', syncState);
    window.addEventListener('settings-updated', syncState);
    window.addEventListener('cart-bump', handleBump);
    return () => {
      clearTimeout(bumpTimer);
      window.removeEventListener('cart-updated', syncState);
      window.removeEventListener('wishlist-updated', syncState);
      window.removeEventListener('settings-updated', syncState);
      window.removeEventListener('cart-bump', handleBump);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase().trim();
      const all = storage.getProducts();
      const filtered = all
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.name_bn.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q)) ||
            (p.category_name && p.category_name.toLowerCase().includes(q))
        )
        .slice(0, 6);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchFocused(false);
      onNavigate('shop', `search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const activeMenuItems = settings.menu_items?.filter(m => m.is_active) || [];
  const sourceMenuItems = activeMenuItems.length > 0 ? activeMenuItems : (INITIAL_SETTINGS.menu_items || []);
  const navCategories = sourceMenuItems.map(m => {
    const activeSubItems = m.sub_items?.filter(s => s.is_active !== false) || [];
    return {
      id: m.id,
      label: m.label,
      slug: m.slug,
      isOffer: m.isOffer,
      sub_items: activeSubItems,
      // ONLY true if there are actually active sub-items!
      hasDropdown: activeSubItems.length > 0,
    };
  });

  const resp = settings.responsive_design;
  const showCategoryBarPhone = resp?.show_category_bar_phone ?? false;
  const showCategoryBarTab = resp?.show_category_bar_tab ?? true;
  const showCategoryBarPc = resp?.show_category_bar_pc ?? true;

  const categoryBarVisibilityClass = [
    showCategoryBarPhone ? 'block' : 'hidden',
    showCategoryBarTab ? 'md:block' : 'md:hidden',
    showCategoryBarPc ? 'lg:block' : 'lg:hidden',
  ].join(' ');

  const showTaglinePhone = resp?.show_tagline_phone ?? false;
  const showTaglineTab = resp?.show_tagline_tab ?? true;
  const showTaglinePc = resp?.show_tagline_pc ?? true;

  const taglineVisibilityClass = [
    showTaglinePhone ? 'block' : 'hidden',
    showTaglineTab ? 'md:block' : 'md:hidden',
    showTaglinePc ? 'lg:block' : 'lg:hidden',
  ].join(' ');

  const logoHeightPhone = resp?.logo_height_phone || 28;
  const logoHeightTab = resp?.logo_height_tab || 36;
  const logoHeightPc = resp?.logo_height_pc || 44;

  const logoTextSizePhone = resp?.logo_text_size_phone || 15;
  const logoTextSizeTab = resp?.logo_text_size_tab || 18;
  const logoTextSizePc = resp?.logo_text_size_pc || 22;

  const catFontSizePhone = resp?.category_bar_font_size_phone || 11;
  const catFontSizeTab = resp?.category_bar_font_size_tab || 11;
  const catFontSizePc = resp?.category_bar_font_size_pc || 12;

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs">
      <style>{`
        .site-header-logo-img {
          height: ${logoHeightPhone}px !important;
        }
        .site-header-logo-text {
          font-size: ${logoTextSizePhone}px !important;
        }
        .site-header-cat-link {
          font-size: ${catFontSizePhone}px !important;
        }
        @media (min-width: 768px) {
          .site-header-logo-img { height: ${logoHeightTab}px !important; }
          .site-header-logo-text { font-size: ${logoTextSizeTab}px !important; }
          .site-header-cat-link { font-size: ${catFontSizeTab}px !important; }
        }
        @media (min-width: 1024px) {
          .site-header-logo-img { height: ${logoHeightPc}px !important; }
          .site-header-logo-text { font-size: ${logoTextSizePc}px !important; }
          .site-header-cat-link { font-size: ${catFontSizePc}px !important; }
        }
      `}</style>
      {/* ROW 1: White Main Navigation Row (Logo + Search in + Action Icons) */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-[1360px] mx-auto px-4 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo on Left */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 text-left group cursor-pointer"
            >
              {/* Logo rendering: Image only, Text only, or Both (no icons) */}
              {settings.logo_type === 'image' && settings.logo ? (
                <img
                  src={settings.logo}
                  alt={settings.website_name || 'Logo'}
                  className="site-header-logo-img w-auto max-w-[220px] object-contain group-hover:scale-105 transition-transform"
                />
              ) : settings.logo_type === 'both' && settings.logo ? (
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <img
                    src={settings.logo}
                    alt="Logo"
                    className="site-header-logo-img w-auto object-contain rounded-md group-hover:scale-105 transition-transform"
                  />
                  <div className="flex flex-col">
                    <span
                      className="site-header-logo-text font-extrabold tracking-tight leading-none"
                      style={{ color: settings.accent_color || '#E25C1D' }}
                    >
                      {settings.logo_text || settings.website_name || 'GHORER BAZAR'}
                    </span>
                    {settings.tagline && (
                      <span className={`text-[9px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5 ${taglineVisibilityClass}`}>
                        {settings.tagline}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                /* Text Only Logo */
                <div className="flex flex-col">
                  <span
                    className="site-header-logo-text font-black tracking-tight leading-none"
                    style={{ color: settings.accent_color || '#E25C1D' }}
                  >
                    {settings.logo_text || settings.website_name || 'GHORER BAZAR'}
                  </span>
                  {settings.tagline && (
                    <span className={`text-[9px] text-slate-400 font-semibold tracking-wider uppercase mt-1 ${taglineVisibilityClass}`}>
                      {settings.tagline}
                    </span>
                  )}
                </div>
              )}
            </button>
          </div>

          {/* Center Search Bar with 'Search in...' placeholder (Responsive on both mobile & desktop) */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-xl mx-1.5 sm:mx-4">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search in..."
                className="w-full h-8 sm:h-10 pl-3 sm:pl-5 pr-8 sm:pr-11 rounded-full border border-slate-200 bg-[#FBFBFA] hover:bg-white focus:bg-white focus:border-[#E25C1D] focus:ring-1 focus:ring-[#E25C1D] outline-none text-[11px] sm:text-sm text-slate-800 transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="absolute right-2.5 sm:right-3.5 text-slate-400 hover:text-[#E25C1D] transition-colors"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </form>

            {/* Live Autocomplete Dropdown */}
            {searchFocused && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in duration-150">
                <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Found {searchResults.length} Products</span>
                  <span className="text-emerald-700">Click to view</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSearchFocused(false);
                        onNavigate('product', item.slug);
                      }}
                      className="p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3 hover:bg-orange-50/40 cursor-pointer transition-colors"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded bg-slate-50 border border-slate-100 p-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">{item.category_name}</p>
                      </div>
                      <span className="text-xs font-bold text-[#E25C1D] shrink-0">
                        ৳{item.sale_price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Right Action Icons */}
          <div className="hidden md:flex items-center gap-4 sm:gap-5 md:gap-6 text-slate-700">
            {/* Track Order */}
            <button
              onClick={() => onNavigate('track-order')}
              className={`flex flex-col items-center gap-0.5 group hover:text-[#E25C1D] transition-colors ${
                currentRoute === 'track-order' ? 'text-[#E25C1D]' : ''
              }`}
            >
              <Compass className="w-5 h-5 text-slate-600 group-hover:text-[#E25C1D] transition-colors" />
              <span className="text-[10px] sm:text-[11px] font-medium leading-none whitespace-nowrap">
                Track Order
              </span>
            </button>

            {/* Sign In */}
            <button
              onClick={onOpenAuth}
              className="flex flex-col items-center gap-0.5 group hover:text-[#E25C1D] transition-colors"
            >
              <User className="w-5 h-5 text-slate-600 group-hover:text-[#E25C1D] transition-colors" />
              <span className="text-[10px] sm:text-[11px] font-medium leading-none whitespace-nowrap">
                Sign In
              </span>
            </button>

            {/* Wishlist */}
            <button
              onClick={() => onNavigate('wishlist')}
              className={`relative flex flex-col items-center gap-0.5 group hover:text-[#E25C1D] transition-colors ${
                currentRoute === 'wishlist' ? 'text-[#E25C1D]' : ''
              }`}
            >
              <div className="relative">
                <Heart className="w-5 h-5 text-slate-600 group-hover:text-[#E25C1D] transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#E25C1D] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium leading-none whitespace-nowrap">
                Wishlist
              </span>
            </button>

            {/* Cart with Badge (e.g. 1) */}
            <button
              id="header-cart-btn"
              onClick={onOpenCart}
              className={`relative flex flex-col items-center gap-0.5 group hover:text-[#E25C1D] transition-all duration-300 ${
                cartBump ? 'scale-125 text-[#E25C1D]' : ''
              }`}
              aria-label="View Cart"
            >
              <div className="relative">
                <ShoppingCart className={`w-5 h-5 transition-transform duration-300 ${
                  cartBump ? 'text-[#E25C1D] scale-110' : 'text-slate-600 group-hover:text-[#E25C1D]'
                }`} />
                {cartCount > 0 && (
                  <span className={`absolute -top-1.5 -right-2 bg-[#E25C1D] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none transition-transform duration-300 ${
                    cartBump ? 'scale-125 ring-2 ring-orange-300' : ''
                  }`}>
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium leading-none whitespace-nowrap">
                Cart
              </span>
            </button>

            {/* Admin Dashboard Entry */}
            <button
              onClick={() => onNavigate('admin')}
              className={`flex flex-col items-center gap-0.5 group hover:text-emerald-700 transition-colors cursor-pointer ${
                currentRoute === 'admin' ? 'text-emerald-700' : ''
              }`}
              title="Admin Dashboard (এডমিন প্যানেল)"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-700 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 leading-none whitespace-nowrap">
                Admin
              </span>
            </button>

            {/* More Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex flex-col items-center gap-0.5 group hover:text-[#E25C1D] transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-600 group-hover:text-[#E25C1D] transition-colors" />
              <span className="text-[10px] sm:text-[11px] font-medium leading-none whitespace-nowrap">
                More
              </span>
            </button>
          </div>

          {/* Phone / Mobile View Right: ONLY Menu Button! */}
          <div className="md:hidden flex items-center shrink-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#E25C1D] transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
              aria-label="Open Menu"
              title="Menu"
            >
              <Menu className="w-4 h-4 text-slate-800" />
              <span className="text-xs font-bold text-slate-800">Menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* ROW 2: Dark Green Category Bar (#0A281E / #0B291D) - Fully controllable on PC, Tab, Phone */}
      <div className={`${categoryBarVisibilityClass} bg-[#0A281E] text-white font-medium border-t border-emerald-950 relative z-30 transition-all`}>
        <div className="max-w-[1360px] mx-auto px-4 flex items-center justify-between h-10 overflow-x-auto lg:overflow-visible no-scrollbar">
          <div className="flex items-center gap-5 sm:gap-7 whitespace-nowrap">
            {navCategories.map((item, idx) => (
              <div key={item.id || idx} className="relative group py-2 flex items-center">
                <button
                  type="button"
                  onClick={() => onNavigate('shop', item.slug === 'offer-zone' ? 'offers=true' : `category=${item.slug}`)}
                  className={`site-header-cat-link flex items-center gap-1 transition-colors hover:text-[#E25C1D] cursor-pointer ${
                    item.isOffer
                      ? 'text-amber-300 font-bold hover:text-amber-200'
                      : 'text-slate-200'
                  }`}
                >
                  <span>{item.label}</span>
                  {/* Dropdown Chevron ONLY when sub-menus actually exist! */}
                  {item.hasDropdown && (
                    <ChevronDown className="w-3 h-3 opacity-70 group-hover:rotate-180 group-hover:opacity-100 transition-all duration-200 ml-0.5 text-slate-300 group-hover:text-[#E25C1D]" />
                  )}
                </button>

                {/* Submenu Dropdown Card (Only when sub_items exist) */}
                {item.hasDropdown && item.sub_items && item.sub_items.length > 0 && (
                  <div className="absolute top-full left-0 pt-1 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="w-56 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200/90 py-1.5 overflow-hidden">
                      <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                        <span>{item.label}</span>
                        <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full font-bold text-[9px] border border-emerald-100">
                          {item.sub_items.length}টি সাব-ক্যাটাগরি
                        </span>
                      </div>
                      <div className="py-1">
                        {item.sub_items.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate('shop', `category=${sub.slug}`);
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center justify-between group/sub cursor-pointer"
                          >
                            <span>{sub.label}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/sub:text-emerald-700 group-hover/sub:translate-x-0.5 transition-all" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer (Opened by Menu button on mobile or More on desktop) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="p-4 bg-[#0A281E] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌿</span>
                <span className="font-extrabold text-sm tracking-wide">
                  {settings.website_name || 'GHORER BAZAR'}
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions in Mobile Drawer */}
            <div className="p-3 border-b border-slate-100 grid grid-cols-2 gap-2 bg-slate-50">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('track-order');
                }}
                className="py-2 px-2.5 text-left rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <Compass className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="truncate">Track Order</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCart();
                }}
                className="py-2 px-2.5 text-left rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#E25C1D] font-semibold text-xs flex items-center justify-between cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ShoppingCart className="w-4 h-4 text-[#E25C1D] shrink-0" />
                  <span className="truncate">Cart</span>
                </div>
                {cartCount > 0 && (
                  <span className="bg-[#E25C1D] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('wishlist');
                }}
                className="py-2 px-2.5 text-left rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#E25C1D] font-semibold text-xs flex items-center justify-between cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="truncate">Wishlist</span>
                </div>
                {wishlistCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="py-2 px-2.5 text-left rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <User className="w-4 h-4 text-slate-600 shrink-0" />
                <span className="truncate">Sign In</span>
              </button>
            </div>

            {/* Quick Admin Dashboard in Mobile Drawer */}
            <div className="px-3 pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('admin');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-between shadow-md transition-colors cursor-pointer border border-emerald-500/30"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Admin Dashboard</span>
                </div>
                <span className="text-[10px] bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded-full font-medium">
                  এডমিন প্যানেল
                </span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Categories</p>
              {navCategories.map((cat, i) => {
                const hasSubs = cat.hasDropdown && cat.sub_items && cat.sub_items.length > 0;
                const isExpanded = expandedMobileMenu === (cat.id || String(i));
                return (
                  <div key={cat.id || i} className="border-b border-slate-100 last:border-0 pb-1">
                    <div className="flex items-center justify-between py-2 px-2 rounded hover:bg-slate-50 transition-colors">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onNavigate('shop', cat.slug === 'offer-zone' ? 'offers=true' : `category=${cat.slug}`);
                        }}
                        className={`text-xs font-semibold text-left flex-1 ${
                          cat.isOffer ? 'text-orange-600 font-bold' : 'text-slate-700'
                        }`}
                      >
                        {cat.label}
                      </button>

                      {/* Dropdown Chevron ONLY when sub-menus actually exist! */}
                      {hasSubs && (
                        <button
                          type="button"
                          onClick={() => setExpandedMobileMenu(isExpanded ? null : (cat.id || String(i)))}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                          title="Toggle sub-menus"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-emerald-600' : ''}`} />
                        </button>
                      )}
                    </div>

                    {/* Mobile Submenu Accordion */}
                    {hasSubs && isExpanded && (
                      <div className="pl-4 pr-2 py-1 space-y-1 bg-slate-50/80 rounded-lg my-1">
                        {cat.sub_items.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              onNavigate('shop', `category=${sub.slug}`);
                            }}
                            className="w-full text-left py-1.5 px-2 text-[11px] text-slate-600 hover:text-emerald-700 font-medium flex items-center justify-between"
                          >
                            <span>{sub.label}</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500">
              <p className="font-semibold text-slate-700">Rampura, Dhaka, Bangladesh</p>
              <p>Hotline: +8809642922922</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
