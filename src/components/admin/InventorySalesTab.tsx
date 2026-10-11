import React, { useState, useMemo } from 'react';
import { Product, Order, Category } from '../../types/ecommerce';
import { storage } from '../../services/storage';
import {
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  CheckCircle,
  Filter,
  Calendar,
  Search,
  ArrowUpDown,
  Download,
  Plus,
  Minus,
  Save,
  Check,
  RefreshCw
} from 'lucide-react';

interface InventorySalesTabProps {
  products: Product[];
  orders: Order[];
  currencySymbol: string;
  onProductsUpdated: (products: Product[]) => void;
}

export const InventorySalesTab: React.FC<InventorySalesTabProps> = ({
  products,
  orders,
  currencySymbol,
  onProductsUpdated,
}) => {
  // Sales Filter States
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | '7days' | 'month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Inventory Filter States
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockVal, setEditingStockVal] = useState<number>(0);
  const [stockSavedId, setStockSavedId] = useState<string | null>(null);

  // Active sub-section: 'sales' or 'inventory'
  const [activeSection, setActiveSection] = useState<'sales' | 'inventory'>('sales');

  // Filter Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = new Date(order.created_at);
      const now = new Date();

      // Date filtration
      if (dateFilter === 'today') {
        const todayStr = now.toISOString().slice(0, 10);
        if (order.created_at.slice(0, 10) !== todayStr) return false;
      } else if (dateFilter === 'yesterday') {
        const yest = new Date(now);
        yest.setDate(yest.getDate() - 1);
        const yestStr = yest.toISOString().slice(0, 10);
        if (order.created_at.slice(0, 10) !== yestStr) return false;
      } else if (dateFilter === '7days') {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        if (orderDate < sevenDaysAgo) return false;
      } else if (dateFilter === 'month') {
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        if (orderDate < thirtyDaysAgo) return false;
      } else if (dateFilter === 'custom') {
        if (customStartDate && new Date(order.created_at) < new Date(customStartDate)) return false;
        if (customEndDate && new Date(order.created_at) > new Date(customEndDate + 'T23:59:59')) return false;
      }

      // Order Status
      if (statusFilter !== 'all' && order.order_status !== statusFilter) return false;

      // Payment Status
      if (paymentFilter !== 'all' && order.payment_status !== paymentFilter) return false;

      // Payment Method
      if (methodFilter !== 'all' && order.payment_method !== methodFilter) return false;

      // Search Query
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase().trim();
        const matchNumber = order.order_number.toLowerCase().includes(q);
        const matchCustomer = order.customer_name.toLowerCase().includes(q);
        const matchPhone = order.customer_phone.includes(q);
        if (!matchNumber && !matchCustomer && !matchPhone) return false;
      }

      return true;
    });
  }, [orders, dateFilter, customStartDate, customEndDate, statusFilter, paymentFilter, methodFilter, orderSearchQuery]);

  // Analytics Metrics
  const metrics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const deliveredRevenue = filteredOrders
      .filter(o => o.order_status === 'delivered' || o.payment_status === 'paid')
      .reduce((sum, o) => sum + o.total, 0);
    const totalItemsSold = filteredOrders.reduce(
      (sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0),
      0
    );
    const orderCount = filteredOrders.length;
    const aov = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

    return { totalRevenue, deliveredRevenue, totalItemsSold, orderCount, aov };
  }, [filteredOrders]);

  // Filter Inventory Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (stockStatusFilter === 'in_stock' && (p.stock_quantity <= 5 || p.stock_quantity === 0)) return false;
      if (stockStatusFilter === 'low_stock' && (p.stock_quantity > 5 || p.stock_quantity === 0)) return false;
      if (stockStatusFilter === 'out_of_stock' && p.stock_quantity > 0) return false;

      if (inventorySearchQuery.trim()) {
        const q = inventorySearchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q) || p.name_bn.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        if (!matchName && !matchSku) return false;
      }

      return true;
    });
  }, [products, stockStatusFilter, inventorySearchQuery]);

  // Total stock valuation
  const totalInventoryValue = useMemo(() => {
    return products.reduce((sum, p) => sum + (p.stock_quantity * p.sale_price), 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter(p => p.stock_quantity <= 5 && p.stock_quantity > 0).length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter(p => p.stock_quantity === 0).length;
  }, [products]);

  // Quick Inline Stock Update
  const handleQuickStockUpdate = (productId: string, newStock: number) => {
    const p = products.find(prod => prod.id === productId);
    if (!p) return;
    const safeStock = Math.max(0, newStock);
    const updated = storage.saveProduct({
      ...p,
      stock_quantity: safeStock,
    });
    onProductsUpdated(storage.getProducts());
    setStockSavedId(productId);
    setTimeout(() => setStockSavedId(null), 2000);
    setEditingStockId(null);
  };

  const handleExportSalesCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer', 'Phone', 'Items Qty', 'Total', 'Payment Method', 'Payment Status', 'Order Status'];
    const rows = filteredOrders.map(o => [
      o.order_number,
      new Date(o.created_at).toLocaleDateString(),
      `"${o.customer_name}"`,
      o.customer_phone,
      o.items.reduce((s, i) => s + i.quantity, 0),
      o.total,
      o.payment_method.toUpperCase(),
      o.payment_status.toUpperCase(),
      o.order_status.toUpperCase()
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales-report-${dateFilter}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 p-6 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">Inventory Management & Total Sales Filtration</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Multi-dimensional sales filtration system by date range, order status, and payment method. Real-time warehouse inventory tracking and one-click stock replenishment.
          </p>
        </div>

        {/* Action Toggle */}
        <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-xl text-xs font-bold text-white border border-white/15">
          <button
            onClick={() => setActiveSection('sales')}
            className={`px-4 py-2 rounded-lg transition-all ${activeSection === 'sales' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:bg-white/10 text-slate-300'}`}
          >
            Sales Analytics ({filteredOrders.length})
          </button>
          <button
            onClick={() => setActiveSection('inventory')}
            className={`px-4 py-2 rounded-lg transition-all ${activeSection === 'inventory' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:bg-white/10 text-slate-300'}`}
          >
            Stock Inventory ({products.length})
          </button>
        </div>
      </div>

      {/* SECTION 1: SALES ANALYTICS & FILTRATION */}
      {activeSection === 'sales' && (
        <div className="space-y-6">
          {/* Filtration Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                Sales Filtration System
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportSalesCSV}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Sales CSV</span>
                </button>
                <button
                  onClick={() => {
                    setDateFilter('all');
                    setStatusFilter('all');
                    setPaymentFilter('all');
                    setMethodFilter('all');
                    setOrderSearchQuery('');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-1"
                  title="Reset Filters"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Filter Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Date Preset */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Date Period</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800"
                >
                  <option value="all">All Time History</option>
                  <option value="today">Today Only</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="custom">Custom Date Range</option>
                </select>
              </div>

              {/* Order Status */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Order Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800"
                >
                  <option value="all">All Order Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Status */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Payment Status</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800"
                >
                  <option value="all">All Payments</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending (Unpaid)</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Payment Method</label>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800"
                >
                  <option value="all">All Payment Methods</option>
                  <option value="cod">Cash on Delivery (COD)</option>
                  <option value="bkash">bKash Digital Payment</option>
                  <option value="nagad">Nagad Digital Payment</option>
                  <option value="card">Debit / Credit Card</option>
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Order / Customer</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search phone or ORD-..."
                    className="w-full pl-8 pr-2.5 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Custom Date Range picker if selected */}
            {dateFilter === 'custom' && (
              <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700">Custom Range:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                />
                <span className="text-xs text-slate-400">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
            )}
          </div>

          {/* DYNAMIC KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filtered Total Sales</span>
              <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
                {currencySymbol}{metrics.totalRevenue.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Across {metrics.orderCount} orders</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivered / Paid Sales</span>
              <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">
                {currencySymbol}{metrics.deliveredRevenue.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 mt-0.5">Net realized cashflow</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Items Sold</span>
              <div className="text-2xl font-black text-blue-700 mt-1 font-mono">
                {metrics.totalItemsSold.toLocaleString()}
              </div>
              <div className="text-[11px] text-blue-600 mt-0.5">Physical product units</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Order Value (AOV)</span>
              <div className="text-2xl font-black text-purple-700 mt-1 font-mono">
                {currencySymbol}{metrics.aov.toLocaleString()}
              </div>
              <div className="text-[11px] text-purple-600 mt-0.5">Per placed basket</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Stock Valuation</span>
              <div className="text-2xl font-black text-amber-700 mt-1 font-mono">
                {currencySymbol}{totalInventoryValue.toLocaleString()}
              </div>
              <div className="text-[11px] text-amber-600 mt-0.5">Current inventory asset</div>
            </div>
          </div>

          {/* Filtered Orders Breakdown Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Filtered Orders Record ({filteredOrders.length})
              </h3>
              <span className="text-xs text-slate-500">
                Displaying matching orders based on active filters
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Order Number</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3 text-center">Items Qty</th>
                    <th className="py-2.5 px-3 text-right">Order Total</th>
                    <th className="py-2.5 px-3 text-center">Payment</th>
                    <th className="py-2.5 px-3 text-center">Order Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        No orders match the selected filtration criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                          {order.order_number}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-800">{order.customer_name}</div>
                          <div className="text-[10px] text-slate-400">{order.customer_phone}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                          {order.items.reduce((s, i) => s + i.quantity, 0)} pcs
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                          {currencySymbol}{order.total.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            order.payment_status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.payment_method.toUpperCase()} ({order.payment_status})
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                            {order.order_status.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: STOCK INVENTORY MANAGEMENT */}
      {activeSection === 'inventory' && (
        <div className="space-y-6">
          {/* Low Stock Warning Banner if applicable */}
          {(lowStockCount > 0 || outOfStockCount > 0) && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs">Inventory Replenishment Alert</h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    You have <strong className="underline">{outOfStockCount} out-of-stock</strong> and <strong className="underline">{lowStockCount} low-stock</strong> items requiring restocking.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStockStatusFilter('out_of_stock')}
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-[11px] shadow-xs hover:bg-red-700"
                >
                  View Out of Stock ({outOfStockCount})
                </button>
                <button
                  onClick={() => setStockStatusFilter('low_stock')}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-[11px] shadow-xs hover:bg-amber-700"
                >
                  View Low Stock ({lowStockCount})
                </button>
              </div>
            </div>
          )}

          {/* Inventory Controls */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Warehouse Stock & Inventory Roster</h3>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setStockStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    stockStatusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Items ({products.length})
                </button>
                <button
                  onClick={() => setStockStatusFilter('in_stock')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    stockStatusFilter === 'in_stock' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  In Stock (&gt;5)
                </button>
                <button
                  onClick={() => setStockStatusFilter('low_stock')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    stockStatusFilter === 'low_stock' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Low Stock (≤5)
                </button>
                <button
                  onClick={() => setStockStatusFilter('out_of_stock')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    stockStatusFilter === 'out_of_stock' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Out of Stock (0)
                </button>
              </div>
            </div>

            {/* Inventory Search */}
            <div className="max-w-md relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inventorySearchQuery}
                onChange={(e) => setInventorySearchQuery(e.target.value)}
                placeholder="Search inventory by product name or SKU..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              />
            </div>

            {/* Inventory Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Product Info</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Normal / Sale Price</th>
                    <th className="py-2.5 px-3 text-center">Stock Level</th>
                    <th className="py-2.5 px-3 text-right">Stock Valuation</th>
                    <th className="py-2.5 px-3 text-right">Quick Stock Adjustment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map(product => {
                    const isEditing = editingStockId === product.id;
                    const isSaved = stockSavedId === product.id;
                    const stockValuation = product.stock_quantity * product.sale_price;

                    return (
                      <tr key={product.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-9 h-9 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-800">{product.name}</div>
                              <div className="text-[10px] text-slate-400">{product.name_bn} • {product.weight}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-600">
                          {product.sku}
                        </td>

                        <td className="py-2.5 px-3 text-slate-600">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium">
                            {product.category_name || product.category_id}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono">
                          <div>
                            <span className="font-bold text-slate-900">{currencySymbol}{product.sale_price}</span>
                          </div>
                          {product.regular_price > product.sale_price && (
                            <div className="text-[10px] text-slate-400 line-through">
                              {currencySymbol}{product.regular_price}
                            </div>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              product.stock_quantity === 0
                                ? 'bg-red-100 text-red-800'
                                : product.stock_quantity <= 5
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {product.stock_quantity} {product.unit || 'Units'}
                            </span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  product.stock_quantity === 0 ? 'bg-red-500' : product.stock_quantity <= 5 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, (product.stock_quantity / 30) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                          {currencySymbol}{stockValuation.toLocaleString()}
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={editingStockVal}
                                  onChange={(e) => setEditingStockVal(Number(e.target.value))}
                                  className="w-16 px-1.5 py-1 text-center font-bold font-mono text-xs rounded border border-emerald-500 bg-white"
                                  min="0"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleQuickStockUpdate(product.id, editingStockVal)}
                                  className="p-1 rounded bg-emerald-700 text-white hover:bg-emerald-800"
                                  title="Save Stock"
                                >
                                  <Save className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleQuickStockUpdate(product.id, product.stock_quantity - 1)}
                                  disabled={product.stock_quantity <= 0}
                                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center disabled:opacity-30"
                                  title="Minus 1"
                                >
                                  -1
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickStockUpdate(product.id, product.stock_quantity + 5)}
                                  className="px-1.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px]"
                                  title="Add 5"
                                >
                                  +5
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickStockUpdate(product.id, product.stock_quantity + 10)}
                                  className="px-1.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px]"
                                  title="Add 10"
                                >
                                  +10
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingStockId(product.id);
                                    setEditingStockVal(product.stock_quantity);
                                  }}
                                  className="text-[10px] text-slate-500 underline ml-1 hover:text-slate-900"
                                >
                                  Edit
                                </button>
                              </div>
                            )}

                            {isSaved && (
                              <span className="text-[10px] text-emerald-600 font-bold ml-1">
                                ✓ Updated
                              </span>
                            )}
                          </div>
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
    </div>
  );
};
