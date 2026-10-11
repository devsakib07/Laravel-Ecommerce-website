import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { Product, Order, Coupon, OrderStatus, SiteSettings, Category, Brand } from '../../types/ecommerce';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Ticket,
  Settings,
  FileCode,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Truck,
  Plus,
  Trash2,
  Edit,
  Copy,
  Printer,
  X,
  ExternalLink,
  ChevronRight,
  Search,
  ArrowLeft,
  BarChart3,
  Palette,
  SlidersHorizontal,
  Globe,
  FolderTree,
  Calendar,
  Clock,
  Star,
  ShieldCheck,
  LogOut,
  User,
  Activity,
  Users,
  ShoppingCart,
  MessageSquare,
  PhoneCall,
  Send,
  Flame,
} from 'lucide-react';
import { InvoiceModal } from './InvoiceModal';
import { ProductFormModal } from './ProductFormModal';
import { SeoSettingsTab } from './SeoSettingsTab';
import { CheckoutSettingsTab } from './CheckoutSettingsTab';
import { BrandingThemeTab } from './BrandingThemeTab';
import { InventorySalesTab } from './InventorySalesTab';
import { CategoriesTab } from './CategoriesTab';
import { ReviewsTab } from './ReviewsTab';
import { AdminSecurityTab } from './AdminSecurityTab';
import { PixelServerTrackingTab } from './PixelServerTrackingTab';
import { TrafficVisitorsTab } from './TrafficVisitorsTab';
import { AbandonedCartsTab } from './AbandonedCartsTab';
import { CourierSmsTab } from './CourierSmsTab';
import { AdminPosModal } from './AdminPosModal';

// Helper to format order date and time cleanly
const formatOrderDate = (created_at?: string, order_number?: string) => {
  if (created_at) {
    const d = new Date(created_at);
    if (!isNaN(d.getTime())) {
      const datePart = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return { date: datePart, time: timePart };
    }
  }
  if (order_number) {
    const match = order_number.match(/ORD-(\d{4})(\d{2})(\d{2})-/i);
    if (match) {
      const year = match[1];
      const month = match[2];
      const day = match[3];
      const d = new Date(`${year}-${month}-${day}`);
      if (!isNaN(d.getTime())) {
        const datePart = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        return { date: datePart, time: '' };
      }
    }
  }
  return { date: '28 Sep 2026', time: '12:00 PM' };
};

interface AdminDashboardProps {
  onExitAdmin: () => void;
}

export type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'abandoned_carts'
  | 'products'
  | 'categories'
  | 'inventory_sales'
  | 'traffic_analytics'
  | 'branding'
  | 'checkout_settings'
  | 'coupons'
  | 'reviews'
  | 'courier_sms'
  | 'settings'
  | 'seo'
  | 'pixel_tracking'
  | 'laravel'
  | 'security';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExitAdmin }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Storage data state
  const [orders, setOrders] = useState<Order[]>(() => storage.getOrders());
  const [products, setProducts] = useState<Product[]>(() => storage.getProducts());
  const [coupons, setCoupons] = useState<Coupon[]>(() => storage.getCoupons());
  const [settings, setSettings] = useState<SiteSettings>(() => storage.getSettings());
  const [categories, setCategories] = useState<Category[]>(() => storage.getCategories());
  const [brands] = useState<Brand[]>(() => storage.getBrands());
  const [testimonialsCount, setTestimonialsCount] = useState(() => storage.getTestimonials().length);
  const [adminSession, setAdminSession] = useState(() => storage.getAdminSession());

  const handleLogout = () => {
    storage.adminLogout();
    onExitAdmin();
  };

  // Filter & Search states
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // New POS / Quick Order modal state
  const [showPosModal, setShowPosModal] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const handleBookCourier = (orderId: string, provider: 'steadfast' | 'pathao') => {
    const res = storage.bookCourier(orderId, provider);
    if (res.success) {
      setOrders(storage.getOrders());
      setActionFeedback(res.message);
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  const handleSendOrderSms = (orderId: string, type: 'placed' | 'shipped') => {
    const res = storage.sendOrderSms(orderId, type);
    setActionFeedback(res.message);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  // New product form modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New coupon form modal
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percent' as 'percent' | 'fixed',
    discount_amount: 10,
    min_spend: 1000,
    usage_limit: 100,
    expiry_date: '2026-12-31',
  });

  // Settings form
  const [settingsForm, setSettingsForm] = useState({ ...settings });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // KPI Calculations
  const totalSales = orders.reduce((sum, o) => sum + (o.payment_status === 'paid' || o.order_status === 'delivered' ? o.total : 0), 0);
  const pendingOrders = orders.filter(o => o.order_status === 'pending');
  const completedOrders = orders.filter(o => o.order_status === 'delivered');
  const lowStockProducts = products.filter(p => p.stock_quantity <= 5);

  // Status Updater
  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = storage.updateOrderStatus(orderId, newStatus);
    if (updated) {
      setOrders(storage.getOrders());
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
    }
  };

  // Payment Status Updater
  const handleUpdatePayment = (orderId: string, newStatus: 'pending' | 'paid' | 'failed') => {
    const updated = storage.updatePaymentStatus(orderId, newStatus);
    if (updated) {
      setOrders(storage.getOrders());
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
    }
  };

  // Product CRUD
  const handleSaveProductFromModal = (savedProduct: Product) => {
    storage.saveProduct(savedProduct);
    setProducts(storage.getProducts());
    setShowProductModal(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      storage.deleteProduct(id);
      setProducts(storage.getProducts());
    }
  };

  const handleDuplicateProduct = (p: Product) => {
    storage.saveProduct({
      ...p,
      id: undefined,
      sku: `${p.sku}-COPY`,
      name: `${p.name} (Copy)`,
      name_bn: `${p.name_bn} (কপি)`,
    });
    setProducts(storage.getProducts());
  };

  // Coupon Save
  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveCoupon(couponForm);
    setCoupons(storage.getCoupons());
    setShowCouponModal(false);
  };

  // Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateSettings(settingsForm);
    setSettings(storage.getSettings());
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter !== 'all' && o.order_status !== orderStatusFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      return (
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Admin Top Navbar */}
      <header className="bg-[#0D3823] text-white px-6 py-3 flex items-center justify-between border-b border-emerald-950 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white text-lg font-bold">
            🌿
          </div>
          <div>
            <span className="font-extrabold text-base tracking-wide text-white">
              SHUDDHO<span className="text-[#E25C1D] ml-1">ADMIN</span>
            </span>
            <span className="text-[10px] text-emerald-300 block -mt-0.5">
              Production Management Dashboard (Laravel 11 Ready)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:flex items-center gap-2 text-xs text-emerald-200 bg-emerald-900/50 px-3 py-1.5 rounded-lg border border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Server Connected (MySQL/SQLite Sync)</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-200 bg-emerald-950/80 px-2.5 py-1.5 rounded-lg border border-emerald-800/80">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline text-slate-300">Admin:</span>
            <span className="font-bold text-white font-mono">{adminSession?.userId || 'admin'}</span>
          </div>

          <button
            onClick={() => setShowPosModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E25C1D] hover:bg-[#c94f17] text-white text-xs font-bold transition-all shadow-sm cursor-pointer hover:scale-102"
            title="ফোন বা কাউন্টার কাস্টমারের জন্য সরাসরি অর্ডার তৈরি করুন"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ POS Order</span>
          </button>

          <button
            onClick={onExitAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/60 text-xs font-bold transition-colors cursor-pointer"
            title="মূল ওয়েবসাইটে ফিরে যান"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Storefront</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
            title="এডমিন সেশন লগআউট করুন"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>লগআউট</span>
          </button>
        </div>
      </header>

      {/* Main Admin Layout with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 space-y-4 shrink-0">
          {/* Group 1: Operations */}
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3">
              Operations & Sales
            </span>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Orders Management</span>
              </div>
              {pendingOrders.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'orders' ? 'bg-[#E25C1D] text-white' : 'bg-orange-100 text-[#E25C1D]'
                }`}>
                  {pendingOrders.length}
                </span>
              )}
            </button>

            {/* Abandoned Carts Recovery */}
            <button
              onClick={() => setActiveTab('abandoned_carts')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'abandoned_carts'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-950 bg-amber-50/70 hover:bg-amber-100/90'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-4 h-4 text-amber-600" />
                <span>Abandoned Carts (অসম্পূর্ণ অর্ডার)</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-200 text-amber-900">
                Recovery
              </span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'products'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Catalog & Products</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'categories'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderTree className="w-4 h-4" />
                <span>Categories (ক্যাটাগরি)</span>
              </div>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'categories' ? 'bg-[#E25C1D] text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {categories.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('inventory_sales')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'inventory_sales'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Inventory & Sales</span>
            </button>
          </div>

          {/* Group 2: Storefront & Customizer */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3">
              Storefront Customizer
            </span>

            <button
              onClick={() => setActiveTab('branding')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'branding'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Branding, Theme & Menu</span>
            </button>

            <button
              onClick={() => setActiveTab('checkout_settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'checkout_settings'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Checkout Page Builder</span>
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'coupons'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>Coupons & Promos</span>
            </button>

            <button
              onClick={() => setActiveTab('seo')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'seo'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>SEO & Social Share</span>
            </button>

            {/* Live Traffic & Visitor Analytics */}
            <button
              onClick={() => setActiveTab('traffic_analytics')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'traffic_analytics'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-950 bg-emerald-50/70 hover:bg-emerald-100/90'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Live Traffic & Visitors</span>
              </div>
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-200 text-emerald-900">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                Live
              </span>
            </button>

            <button
              onClick={() => setActiveTab('pixel_tracking')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'pixel_tracking'
                  ? 'bg-indigo-900 text-white shadow-xs'
                  : 'text-indigo-950 bg-indigo-50/70 hover:bg-indigo-100/90'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-indigo-500 animate-pulse" />
                <span>Pixel & Server CAPI</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-indigo-200 text-indigo-900">
                Server
              </span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'reviews'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Reviews (কাস্টমার রিভিউ)</span>
              </div>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'reviews' ? 'bg-[#E25C1D] text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {testimonialsCount}
              </span>
            </button>
          </div>

          {/* Group 3: Backend & Gateway */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3">
              Production & Backend
            </span>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Delivery & Gateways</span>
            </button>

            {/* Courier & SMS Gateway Settings */}
            <button
              onClick={() => setActiveTab('courier_sms')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'courier_sms'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Courier & SMS API</span>
            </button>

            <button
              onClick={() => setActiveTab('laravel')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'laravel'
                  ? 'bg-indigo-900 text-white shadow-xs'
                  : 'text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100'
              }`}
            >
              <FileCode className="w-4 h-4 text-indigo-500" />
              <span>Laravel 11 Code & Setup</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'security'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Admin Security & Login</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                User ID
              </span>
            </button>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">E-Commerce Metrics Overview</h1>
                  <p className="text-xs text-slate-500">Live operational snapshot of orders, inventory, and customer purchases</p>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-2xl font-black text-slate-900">৳{totalSales.toLocaleString()}</p>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Paid & Delivered
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-2xl font-black text-slate-900">{orders.length}</p>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      Lifetime Orders
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Orders</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-2xl font-black text-[#E25C1D]">{pendingOrders.length}</p>
                    <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded">
                      Requires Action
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Alert</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-2xl font-black text-rose-600">{lowStockProducts.length}</p>
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                      ≤ 5 Units Left
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="font-bold text-slate-900 text-sm">Recent Store Orders</h2>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-emerald-800 hover:text-[#E25C1D] flex items-center gap-1"
                  >
                    <span>View All Orders</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Items</th>
                        <th className="p-3">Total (৳)</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Payment</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.slice(0, 5).map((o) => {
                        const dateInfo = formatOrderDate(o.created_at, o.order_number);
                        return (
                          <tr key={o.id} className="hover:bg-slate-50">
                            <td className="p-3">
                              <span className="font-mono font-bold text-slate-900 block">{o.order_number}</span>
                              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{dateInfo.date}</span>
                              </span>
                            </td>
                            <td className="p-3">
                              <p className="font-bold text-slate-800">{o.customer_name}</p>
                              <p className="text-[11px] text-slate-400">{o.customer_phone}</p>
                            </td>
                            <td className="p-3">{o.items.length} items</td>
                            <td className="p-3 font-bold text-slate-900">৳{o.total.toLocaleString()}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                o.order_status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : o.order_status === 'out_for_delivery'
                                  ? 'bg-orange-100 text-[#E25C1D]'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {o.order_status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="p-3 font-semibold uppercase text-[11px] text-slate-600">
                              {o.payment_method} ({o.payment_status})
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => {
                                  setSelectedOrder(o);
                                  setActiveTab('orders');
                                }}
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 cursor-pointer"
                              >
                                Manage
                              </button>
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

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {actionFeedback && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{actionFeedback}</span>
                  </div>
                  <button onClick={() => setActionFeedback(null)} className="text-emerald-700 hover:text-emerald-950 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Order Management ({filteredOrders.length})</h1>
                  <p className="text-xs text-slate-500">Track orders, Steadfast & Pathao courier booking, fraud check, and invoices</p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
                  <button
                    onClick={() => setShowPosModal(true)}
                    className="px-3.5 py-2 bg-[#E25C1D] hover:bg-[#c94f17] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ POS Order (ফোন/কাউন্টার)</span>
                  </button>

                  <div className="relative flex-1 sm:w-56">
                    <input
                      type="text"
                      placeholder="Search order ID or phone..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full h-9 pl-8 pr-3 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:border-[#E25C1D]"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>

                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-300 text-xs bg-white font-medium outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Order List Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Order Number & Source</th>
                        <th className="p-3">Order Date & Time</th>
                        <th className="p-3">Customer Details</th>
                        <th className="p-3">Fraud Check</th>
                        <th className="p-3">Items & Total</th>
                        <th className="p-3">Courier Booking</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.map((ord) => {
                        const dateInfo = formatOrderDate(ord.created_at, ord.order_number);
                        const fraud = storage.checkPhoneFraudScore(ord.customer_phone);
                        return (
                          <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-mono font-bold text-[#0D3823] whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span>{ord.order_number}</span>
                                {ord.source === 'pos_admin' ? (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800">POS</span>
                                ) : (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800">WEB</span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-sans font-medium mt-0.5 sm:hidden">
                                {dateInfo.date}
                              </div>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                                <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                <span>{dateInfo.date}</span>
                              </div>
                              {dateInfo.time && (
                                <div className="flex items-center gap-1 text-[11px] text-slate-400 pl-5 mt-0.5 font-medium">
                                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{dateInfo.time}</span>
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              <p className="font-bold text-slate-800">{ord.customer_name}</p>
                              <p className="text-[11px] text-slate-500 font-mono">{ord.customer_phone}</p>
                              <p className="text-[10px] text-slate-400 max-w-[150px] truncate">{ord.district}</p>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <div className="flex flex-col gap-0.5">
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold w-fit ${
                                  fraud.risk_level === 'low'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : fraud.risk_level === 'medium'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>{fraud.success_rate}% Success</span>
                                </span>
                                <span className="text-[9px] text-slate-400">
                                  {fraud.returned_parcels > 0 ? `⚠️ ${fraud.returned_parcels} return` : '✅ Safe history'}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <p className="font-black text-slate-900">৳{ord.total.toLocaleString()}</p>
                              <p className="text-[10px] text-slate-500">{ord.items.length} items • {ord.payment_method.toUpperCase()}</p>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              {ord.courier_tracking_code ? (
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="font-bold text-[10px] uppercase text-emerald-800">{ord.courier_provider}</span>
                                  </div>
                                  <span className="font-mono text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded block text-slate-700">
                                    {ord.courier_tracking_code}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleBookCourier(ord.id, 'steadfast')}
                                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold border border-emerald-200 transition-colors"
                                    title="Steadfast কুরিয়ার বুকিং করুন"
                                  >
                                    Steadfast
                                  </button>
                                  <button
                                    onClick={() => handleBookCourier(ord.id, 'pathao')}
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded text-[10px] font-bold border border-rose-200 transition-colors"
                                    title="Pathao কুরিয়ার বুকিং করুন"
                                  >
                                    Pathao
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <select
                                value={ord.order_status}
                                onChange={(e) => handleUpdateStatus(ord.id, e.target.value as OrderStatus)}
                                className="px-2 py-1 rounded text-[11px] font-bold uppercase border border-slate-200 bg-white"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="packed">Packed</option>
                                <option value="shipped">Shipped</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                              <button
                                onClick={() => handleSendOrderSms(ord.id, ord.order_status === 'shipped' ? 'shipped' : 'placed')}
                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                title="কাস্টমারকে SMS পাঠান"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setSelectedOrder(ord)}
                                className="px-2.5 py-1 bg-emerald-800 text-white rounded text-xs font-semibold hover:bg-emerald-900 transition-colors cursor-pointer"
                              >
                                Invoice
                              </button>
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

          {/* TAB 3: PRODUCTS & INVENTORY */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Products & Inventory ({products.length})</h1>
                  <p className="text-xs text-slate-500">Manage catalog pricing, stock quantities, and SKU variations</p>
                </div>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowProductModal(true);
                  }}
                  className="px-4 py-2 bg-[#E25C1D] hover:bg-[#c94f17] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Product Name</th>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Regular / Sale Price</th>
                        <th className="p-3">Stock Units</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-3 flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 object-contain rounded bg-slate-50 border border-slate-100 p-0.5 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-800 line-clamp-1">{p.name}</p>
                              <p className="text-[11px] text-slate-400">{p.name_bn}</p>
                            </div>
                          </td>
                          <td className="p-3 font-mono font-medium text-slate-600">{p.sku}</td>
                          <td className="p-3 font-medium text-emerald-800">{p.category_name}</td>
                          <td className="p-3">
                            <span className="font-bold text-slate-900">৳{p.sale_price.toLocaleString()}</span>
                            {p.regular_price > p.sale_price && (
                              <span className="text-slate-400 line-through text-[11px] ml-1.5">
                                ৳{p.regular_price.toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              p.stock_quantity <= 5
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {p.stock_quantity} {p.unit}s
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => handleDuplicateProduct(p)}
                              title="Duplicate Product"
                              className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setShowProductModal(true);
                              }}
                              title="Edit Product"
                              className="p-1.5 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              title="Delete Product"
                              className="p-1.5 text-rose-600 hover:text-rose-800 rounded hover:bg-rose-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COUPONS & PROMOS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Coupon Code Management</h1>
                  <p className="text-xs text-slate-500">Create promotional discount voucher codes with minimum spend rules</p>
                </div>
                <button
                  onClick={() => setShowCouponModal(true)}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {coupons.map((c) => (
                  <div key={c.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-extrabold text-[#E25C1D] bg-orange-50 px-2.5 py-1 rounded border border-orange-200">
                        {c.code}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-semibold">
                      {c.discount_type === 'percent' ? `${c.discount_amount}% Discount` : `৳${c.discount_amount} Flat Discount`}
                    </p>

                    <div className="text-[11px] text-slate-500 space-y-1 border-t border-slate-100 pt-2">
                      <p>Min Spend: ৳{c.min_spend}</p>
                      <p>Used: {c.usage_count} / {c.usage_limit} times</p>
                      <p>Expires: {c.expiry_date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS & PAYMENT GATEWAYS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h1 className="text-xl font-bold text-slate-900">E-Commerce & Delivery Settings</h1>
                <p className="text-xs text-slate-500">Configure Bangladesh shipping zones, payment gateways, and company details</p>
              </div>

              {settingsSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Settings successfully saved and live across the store!</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                <h2 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
                  Bangladesh Delivery Charges
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Inside Dhaka Charge (৳)</label>
                    <input
                      type="number"
                      value={settingsForm.delivery_inside_dhaka}
                      onChange={(e) => setSettingsForm({ ...settingsForm, delivery_inside_dhaka: Number(e.target.value) })}
                      className="w-full h-9 px-3 border border-slate-300 rounded-lg outline-none focus:border-[#E25C1D]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Outside Dhaka Charge (৳)</label>
                    <input
                      type="number"
                      value={settingsForm.delivery_outside_dhaka}
                      onChange={(e) => setSettingsForm({ ...settingsForm, delivery_outside_dhaka: Number(e.target.value) })}
                      className="w-full h-9 px-3 border border-slate-300 rounded-lg outline-none focus:border-[#E25C1D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Free Delivery Threshold (৳)</label>
                  <input
                    type="number"
                    value={settingsForm.free_delivery_threshold}
                    onChange={(e) => setSettingsForm({ ...settingsForm, free_delivery_threshold: Number(e.target.value) })}
                    className="w-full h-9 px-3 border border-slate-300 rounded-lg outline-none focus:border-[#E25C1D]"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Orders equal or above this amount receive free shipping automatically.</p>
                </div>

                <h2 className="font-bold text-slate-900 text-sm pt-4 pb-2 border-b border-slate-100">
                  Mobile Financial Services (MFS Gateways)
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">bKash Merchant / Personal No</label>
                    <input
                      type="text"
                      value={settingsForm.bkash_merchant_number}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bkash_merchant_number: e.target.value })}
                      className="w-full h-9 px-3 border border-slate-300 rounded-lg font-mono outline-none focus:border-[#E25C1D]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nagad Merchant No</label>
                    <input
                      type="text"
                      value={settingsForm.nagad_merchant_number}
                      onChange={(e) => setSettingsForm({ ...settingsForm, nagad_merchant_number: e.target.value })}
                      className="w-full h-9 px-3 border border-slate-300 rounded-lg font-mono outline-none focus:border-[#E25C1D]"
                    />
                  </div>
                </div>

                <h2 className="font-bold text-slate-900 text-sm pt-4 pb-2 border-b border-slate-100">
                  Store Contact Info
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Support Phone</label>
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="w-full h-9 px-3 border border-slate-300 rounded-lg outline-none focus:border-[#E25C1D]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Support Email</label>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      className="w-full h-9 px-3 border border-slate-300 rounded-lg outline-none focus:border-[#E25C1D]"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#E25C1D] hover:bg-[#c94f17] text-white font-bold rounded-xl transition-colors shadow-sm"
                  >
                    Save All Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: LARAVEL ARCHITECTURE & CODE EXPORT */}
          {activeTab === 'laravel' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Laravel 11/12 Architecture & Deployment Guide</h1>
                <p className="text-xs text-slate-500">
                  Complete production code architecture matching Laravel standard conventions for cPanel & VPS deployment.
                </p>
              </div>

              {/* Deployment Quick Commands */}
              <div className="p-5 bg-slate-900 text-slate-100 rounded-2xl shadow-sm space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
                  <span>Production Setup Commands</span>
                  <span>PHP 8.2+ / MySQL</span>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <p><span className="text-amber-400"># 1. Clone repository & install dependencies</span></p>
                  <p className="bg-slate-950 p-2 rounded">composer install --no-dev --optimize-autoloader</p>
                  <p><span className="text-amber-400"># 2. Copy environment file and generate key</span></p>
                  <p className="bg-slate-950 p-2 rounded">cp .env.example .env && php artisan key:generate</p>
                  <p><span className="text-amber-400"># 3. Run database migrations & seeders</span></p>
                  <p className="bg-slate-950 p-2 rounded">php artisan migrate --seed</p>
                  <p><span className="text-amber-400"># 4. Storage link & optimize cache</span></p>
                  <p className="bg-slate-950 p-2 rounded">php artisan storage:link && php artisan config:cache && php artisan route:cache</p>
                </div>
              </div>

              {/* Laravel Project Structure Explorer */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 text-xs">
                <h2 className="font-bold text-slate-900 text-sm">Laravel Project Directory Structure</h2>
                <pre className="bg-slate-50 p-4 rounded-xl font-mono text-[11px] text-slate-700 leading-relaxed overflow-x-auto">
{`app/
├── Http/
│   ├── Controllers/
│   │   ├── HomeController.php
│   │   ├── ProductController.php
│   │   ├── CartController.php
│   │   ├── CheckoutController.php
│   │   ├── OrderTrackingController.php
│   │   └── Admin/
│   │       ├── DashboardController.php
│   │       ├── ProductController.php
│   │       ├── OrderController.php
│   │       └── CouponController.php
│   ├── Middleware/
│   │   ├── AdminAuthenticate.php
│   │   └── VerifyCsrfToken.php
│   └── Requests/
│       ├── CheckoutRequest.php
│       └── ProductStoreRequest.php
├── Models/
│   ├── User.php
│   ├── Product.php
│   ├── Category.php
│   ├── Brand.php
│   ├── Order.php
│   ├── OrderItem.php
│   ├── OrderStatusHistory.php
│   ├── Coupon.php
│   └── Review.php
database/
├── migrations/
│   ├── 2026_09_27_000001_create_ecommerce_tables.php
└── seeders/
    ├── DatabaseSeeder.php
    └── ShuddhoBazarSeeder.php
resources/
└── views/
    ├── layouts/
    │   ├── app.blade.php
    │   └── admin.blade.php
    ├── components/
    │   ├── product-card.blade.php
    │   ├── header.blade.php
    │   └── footer.blade.php
    ├── home.blade.php
    ├── shop.blade.php
    ├── product.blade.php
    ├── cart.blade.php
    ├── checkout.blade.php
    └── track-order.blade.php`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB: PRODUCT CATEGORIES (CREATE / EDIT / DELETE) */}
          {activeTab === 'categories' && (
            <CategoriesTab
              categories={categories}
              products={products}
              onCategoriesUpdated={(updated) => setCategories(updated)}
            />
          )}

          {/* TAB 7: INVENTORY & SALES ANALYTICS */}
          {activeTab === 'inventory_sales' && (
            <InventorySalesTab
              products={products}
              orders={orders}
              currencySymbol="৳"
              onProductsUpdated={(updated) => setProducts(updated)}
            />
          )}

          {/* TAB 8: BRANDING, THEME & MENU BUILDER */}
          {activeTab === 'branding' && (
            <BrandingThemeTab
              settings={settings}
              onSettingsUpdated={(updated) => setSettings(updated)}
            />
          )}

          {/* TAB 9: CHECKOUT PAGE BUILDER */}
          {activeTab === 'checkout_settings' && (
            <CheckoutSettingsTab
              settings={settings}
              onSettingsUpdated={(updated) => setSettings(updated)}
            />
          )}

          {/* TAB 10: SEO & SOCIAL SHARING ENGINE */}
          {activeTab === 'seo' && (
            <SeoSettingsTab
              settings={settings}
              onSettingsUpdated={(updated) => setSettings(updated)}
            />
          )}

          {/* TAB: LIVE WEBSITE TRAFFIC & REAL-TIME VISITOR TRACKER */}
          {activeTab === 'traffic_analytics' && (
            <TrafficVisitorsTab
              onNavigateToPixelSettings={() => setActiveTab('pixel_tracking')}
            />
          )}

          {/* TAB: META PIXEL & SERVER-SIDE TRACKING (CAPI) */}
          {activeTab === 'pixel_tracking' && (
            <PixelServerTrackingTab
              settings={settings}
              onSettingsUpdated={(updated) => setSettings(updated)}
            />
          )}

          {/* TAB 11: CUSTOMER REVIEWS & TESTIMONIALS */}
          {activeTab === 'reviews' && (
            <ReviewsTab
              onReviewsUpdated={() => setTestimonialsCount(storage.getTestimonials().length)}
            />
          )}

          {/* TAB 12: ADMIN SECURITY & CREDENTIALS */}
          {activeTab === 'security' && (
            <AdminSecurityTab onLogout={handleLogout} />
          )}
        </main>
      </div>

      {/* Official Tax Invoice Modal */}
      {selectedOrder && (
        <InvoiceModal
          order={selectedOrder}
          settings={settings}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Add / Edit Product Modal with Variations and Gallery */}
      {showProductModal && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          brands={brands}
          currencySymbol="৳"
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProductFromModal}
        />
      )}

      {/* Create Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">Create New Coupon</h3>
              <button onClick={() => setShowCouponModal(false)} className="p-1 rounded text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER20"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg uppercase font-mono outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Discount Type</label>
                  <select
                    value={couponForm.discount_type}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value as 'percent' | 'fixed' })}
                    className="w-full h-9 px-2 border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Discount Amount</label>
                  <input
                    type="number"
                    required
                    value={couponForm.discount_amount}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_amount: Number(e.target.value) })}
                    className="w-full h-9 px-3 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min Order Spend (৳)</label>
                  <input
                    type="number"
                    value={couponForm.min_spend}
                    onChange={(e) => setCouponForm({ ...couponForm, min_spend: Number(e.target.value) })}
                    className="w-full h-9 px-3 border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={couponForm.usage_limit}
                    onChange={(e) => setCouponForm({ ...couponForm, usage_limit: Number(e.target.value) })}
                    className="w-full h-9 px-3 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 text-white font-bold rounded-lg shadow-sm"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Admin POS Modal for Manual Phone/Counter Orders */}
      {showPosModal && (
        <AdminPosModal
          products={products}
          onClose={() => setShowPosModal(false)}
          onOrderCreated={(newOrder) => {
            setOrders(storage.getOrders());
            setSelectedOrder(newOrder);
          }}
        />
      )}
    </div>
  );
};
