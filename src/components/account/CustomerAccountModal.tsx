import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { X, User, Package, LogOut, CheckCircle2 } from 'lucide-react';
import { Order } from '../../types/ecommerce';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder: (orderNumber: string) => void;
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
  onTrackOrder,
}) => {
  const [currentUser, setCurrentUser] = useState(() => storage.getCurrentUser());
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [name, setName] = useState(currentUser?.name || 'Mahmudur Rahman');
  const [email, setEmail] = useState(currentUser?.email || 'customer@shuddhobazar.com');
  const [phone, setPhone] = useState(currentUser?.phone || '01712345678');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const orders: Order[] = storage.getOrders();

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      id: currentUser?.id || 'usr-1',
      name,
      email,
      phone,
      role: (currentUser?.role || 'customer') as 'customer' | 'admin',
    };
    storage.setCurrentUser(updated);
    setCurrentUser(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-[#0D3823] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-sm">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">{currentUser?.name || 'Customer Account'}</h3>
              <p className="text-[11px] text-emerald-200">{currentUser?.phone}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-[#E25C1D] text-[#E25C1D] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            My Profile
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-[#E25C1D] text-[#E25C1D] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>My Orders ({orders.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
              {savedSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Your profile details have been updated successfully!</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs outline-none focus:border-[#E25C1D]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs outline-none focus:border-[#E25C1D]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs outline-none focus:border-[#E25C1D]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-colors"
                >
                  Save Profile Details
                </button>
              </div>
            </form>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">You have not placed any orders yet.</p>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-600 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{ord.order_number}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase">
                          {ord.order_status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-1">
                        {ord.items.length} items · ৳{ord.total.toLocaleString()} · {new Date(ord.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onTrackOrder(ord.order_number);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-[#E25C1D] hover:bg-[#c94f17] text-white font-semibold text-xs transition-colors"
                    >
                      Track Order
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
