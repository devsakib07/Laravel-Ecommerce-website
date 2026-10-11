import React, { useState } from 'react';
import { Order } from '../../types/ecommerce';
import { storage } from '../../services/storage';
import { InvoiceModal } from '../admin/InvoiceModal';
import { CheckCircle, Truck, ShoppingBag, Download, Printer, FileText } from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order;
  onClose: () => void;
  onTrackOrder: (orderNumber: string) => void;
  onContinueShopping: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onTrackOrder,
  onContinueShopping,
}) => {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const settings = storage.getSettings();

  const handleDirectPrintInvoice = () => {
    setShowInvoiceModal(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
        <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Order Successfully Placed!
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-3">
            ধন্যবাদ! আপনার অর্ডারটি গ্রহণ করা হয়েছে
          </h2>

          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            আপনার অর্ডারের নিশ্চিতকরণ মেসেজ <span className="font-semibold text-slate-800">{order.customer_phone}</span> নাম্বারে পাঠানো হয়েছে।
          </p>

          {/* Order Details Badge */}
          <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Order Number:</span>
              <span className="font-mono font-bold text-emerald-900">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Payable:</span>
              <span className="font-extrabold text-[#E25C1D] text-sm">৳{order.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment:</span>
              <span className="font-semibold text-slate-800">{order.payment_method.toUpperCase()} ({order.payment_status.toUpperCase()})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Destination:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[200px]">{order.full_address}, {order.district}</span>
            </div>
          </div>

          {/* Customer Self-Service Invoice Download Action */}
          <div className="mb-4">
            <button
              onClick={handleDirectPrintInvoice}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-[#0A281E] hover:from-emerald-700 hover:to-emerald-900 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-600/30 group"
            >
              <Download className="w-4 h-4 text-emerald-300 group-hover:-translate-y-0.5 transition-transform" />
              <span>ইনভয়েস ডাউনলোড / প্রিন্ট করুন (Download Invoice)</span>
            </button>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-center gap-1">
              <FileText className="w-3 h-3 text-emerald-600" />
              <span>আপনার অর্ডারের অফিশিয়াল ট্যাক্স ইনভয়েস পিডিএফ সেভ বা প্রিন্ট করতে পারবেন</span>
            </p>
          </div>

          {/* Secondary Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => onTrackOrder(order.order_number)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#E25C1D] hover:bg-[#c94f17] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Track Order Now</span>
            </button>

            <button
              onClick={onContinueShopping}
              className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Tax Invoice Modal for Download & Print */}
      {showInvoiceModal && (
        <InvoiceModal
          order={order}
          settings={settings}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </>
  );
};

