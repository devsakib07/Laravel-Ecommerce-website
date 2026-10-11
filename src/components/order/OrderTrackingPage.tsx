import React, { useState, useEffect } from 'react';
import { storage } from '../../services/storage';
import { Order, OrderStatus } from '../../types/ecommerce';
import { InvoiceModal } from '../admin/InvoiceModal';
import { Search, CheckCircle2, Clock, Package, Truck, Home, AlertCircle, ArrowLeft, Phone, MapPin, Download, Printer } from 'lucide-react';

interface OrderTrackingPageProps {
  initialOrderNumber?: string;
  onBackToHome: () => void;
}

const ORDER_STEPS: { status: OrderStatus; label: string; icon: any; desc: string }[] = [
  { status: 'pending', label: 'Order Placed', icon: Clock, desc: 'We received your order request' },
  { status: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2, desc: 'Order verified by team' },
  { status: 'processing', label: 'Processing', icon: Package, desc: 'Quality inspection & prep' },
  { status: 'packed', label: 'Packed', icon: Package, desc: 'Carefully packed with seal' },
  { status: 'shipped', label: 'Shipped', icon: Truck, desc: 'Handed over to courier' },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, desc: 'Rider is on the way' },
  { status: 'delivered', label: 'Delivered', icon: Home, desc: 'Package delivered safely' },
];

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  initialOrderNumber,
  onBackToHome,
}) => {
  const [query, setQuery] = useState(initialOrderNumber || 'ORD-20260927-0001');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const settings = storage.getSettings();

  const handleSearch = (targetQuery?: string) => {
    const q = targetQuery || query;
    if (!q.trim()) return;
    setSearched(true);
    const order = storage.findOrderByTrackQuery(q.trim());
    setFoundOrder(order || null);
  };

  useEffect(() => {
    if (initialOrderNumber) {
      setQuery(initialOrderNumber);
      handleSearch(initialOrderNumber);
    } else {
      // Default to first sample order for immediate visual demo
      handleSearch('ORD-20260927-0001');
    }
  }, [initialOrderNumber]);

  // Determine current active step index
  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'processing': return 2;
      case 'packed': return 3;
      case 'shipped': return 4;
      case 'out_for_delivery': return 5;
      case 'delivered': return 6;
      default: return 0;
    }
  };

  const currentStepIdx = foundOrder ? getStepIndex(foundOrder.order_status) : -1;

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-8">
      {/* Top back button */}
      <button
        onClick={onBackToHome}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </button>

      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 text-2xl">
          🚚
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Track Your Order</h1>
        <p className="text-xs text-slate-500 mt-1">
          Enter your Order Number (e.g. ORD-20260927-0001) or customer phone number
        </p>

        {/* Tracking Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex gap-2 mt-5 max-w-md mx-auto"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. ORD-20260927-0001 or 01712345678"
              className="w-full h-11 pl-4 pr-3 rounded-xl border border-slate-300 focus:border-[#E25C1D] outline-none text-xs font-medium bg-white shadow-xs"
            />
          </div>
          <button
            type="submit"
            className="px-5 h-11 rounded-xl bg-[#E25C1D] hover:bg-[#c94f17] text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Track</span>
          </button>
        </form>

        {/* Quick Demo Order Links */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[11px] text-slate-500">
          <span>Try Demo Orders:</span>
          <button
            onClick={() => {
              setQuery('ORD-20260927-0001');
              handleSearch('ORD-20260927-0001');
            }}
            className="text-emerald-700 font-semibold underline hover:text-emerald-900"
          >
            ORD-20260927-0001 (Out for delivery)
          </button>
          <span>·</span>
          <button
            onClick={() => {
              setQuery('ORD-20260927-0002');
              handleSearch('ORD-20260927-0002');
            }}
            className="text-emerald-700 font-semibold underline hover:text-emerald-900"
          >
            ORD-20260927-0002 (Delivered)
          </button>
        </div>
      </div>

      {/* Order Status Display */}
      {searched && !foundOrder ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">Order Not Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            We could not find any order matching "{query}". Please verify the order number or phone number and try again.
          </p>
        </div>
      ) : foundOrder ? (
        <div className="space-y-6">
          {/* Order Banner Info Card */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Order Number:</span>
                <span className="text-base font-extrabold text-[#0D3823] font-mono">
                  {foundOrder.order_number}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                  foundOrder.order_status === 'delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : foundOrder.order_status === 'out_for_delivery'
                    ? 'bg-orange-100 text-[#E25C1D]'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {foundOrder.order_status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Placed on {new Date(foundOrder.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-left md:text-right">
                <span className="text-xs text-slate-500">Total Payable:</span>
                <p className="text-xl font-black text-[#E25C1D]">৳{foundOrder.total.toLocaleString()}</p>
                <span className="text-[11px] text-slate-500 font-medium">
                  Payment: {foundOrder.payment_method.toUpperCase()} ({foundOrder.payment_status.toUpperCase()})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-800 to-[#0A281E] hover:from-emerald-700 hover:to-emerald-900 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer border border-emerald-700/50 shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-emerald-300" />
                <span>ইনভয়েস ডাউনলোড</span>
              </button>
            </div>
          </div>

          {/* Stepper Timeline Tracker */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-6">Delivery Progress</h3>
            
            {/* Horizontal Stepper (Desktop) */}
            <div className="hidden md:grid grid-cols-7 gap-2 relative">
              {/* Connecting line */}
              <div className="absolute top-5 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
              <div
                className="absolute top-5 left-6 h-0.5 bg-emerald-600 transition-all duration-500 -z-0"
                style={{ width: `${(currentStepIdx / (ORDER_STEPS.length - 1)) * 90}%` }}
              />

              {ORDER_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                const IconComponent = step.icon;

                return (
                  <div key={idx} className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
                        isCurrent
                          ? 'bg-[#E25C1D] text-white ring-4 ring-orange-100 scale-110'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-bold mt-2 ${isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                    <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {step.desc}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Vertical Stepper for Mobile */}
            <div className="md:hidden space-y-4">
              {ORDER_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                const IconComponent = step.icon;

                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isCurrent
                          ? 'bg-[#E25C1D] text-white ring-4 ring-orange-100'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.label}
                      </p>
                      <p className="text-[11px] text-slate-500">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details & Itemized List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Details */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                Delivery Details
              </h3>
              <div className="space-y-2 text-xs text-slate-600">
                <p><span className="font-semibold text-slate-800">Customer:</span> {foundOrder.customer_name}</p>
                <p><span className="font-semibold text-slate-800">Phone:</span> {foundOrder.customer_phone}</p>
                {foundOrder.customer_email && (
                  <p><span className="font-semibold text-slate-800">Email:</span> {foundOrder.customer_email}</p>
                )}
                <p className="flex items-start gap-1">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{foundOrder.full_address}, {foundOrder.upazila}, {foundOrder.district}, {foundOrder.division}</span>
                </p>
                {foundOrder.notes && (
                  <p className="p-2 bg-amber-50 text-amber-800 rounded text-[11px]">
                    <span className="font-bold">Instructions:</span> {foundOrder.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Status History Timeline */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                Activity Logs
              </h3>
              <div className="space-y-3 max-h-56 overflow-y-auto">
                {foundOrder.status_history.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1 shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{log.note}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                        {new Date(log.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {/* Invoice Modal for Customer Download & Print */}
      {showInvoiceModal && foundOrder && (
        <InvoiceModal
          order={foundOrder}
          settings={settings}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  );
};
