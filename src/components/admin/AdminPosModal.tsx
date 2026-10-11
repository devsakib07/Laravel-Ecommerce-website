import React, { useState } from 'react';
import { Product, CartItem, Order } from '../../types/ecommerce';
import { storage } from '../../services/storage';
import {
  X,
  Plus,
  Trash2,
  ShoppingCart,
  User,
  Phone,
  MapPin,
  Check,
  Search,
  Sparkles,
} from 'lucide-react';

interface AdminPosModalProps {
  products: Product[];
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
}

export const AdminPosModal: React.FC<AdminPosModalProps> = ({
  products,
  onClose,
  onOrderCreated,
}) => {
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [manualDiscount, setManualDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [notes, setNotes] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.category_name || '').toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleAddProduct = (prod: Product) => {
    const existingIndex = selectedItems.findIndex((i) => i.product_id === prod.id);
    if (existingIndex >= 0) {
      const updated = [...selectedItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total_price = updated[existingIndex].quantity * updated[existingIndex].unit_price;
      setSelectedItems(updated);
    } else {
      const newItem: CartItem = {
        id: `${prod.id}_${Date.now()}`,
        product_id: prod.id,
        product: prod,
        quantity: 1,
        unit_price: prod.sale_price,
        total_price: prod.sale_price,
      };
      setSelectedItems([newItem, ...selectedItems]);
    }
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    const updated = selectedItems
      .map((item) => {
        if (item.product_id === productId) {
          const newQty = item.quantity + delta;
          return {
            ...item,
            quantity: newQty,
            total_price: newQty * item.unit_price,
          };
        }
        return item;
      })
      .filter((i) => i.quantity > 0);
    setSelectedItems(updated);
  };

  const subtotal = selectedItems.reduce((s, i) => s + i.total_price, 0);
  const delivery = district.toLowerCase() === 'dhaka' ? 70 : 130;
  const grandTotal = Math.max(0, subtotal - manualDiscount + delivery);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedItems.length === 0) {
      setError('দয়া করে অন্তত একটি পণ্য যোগ করুন।');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 11) {
      setError('সঠিক ১১ ডিজিটের ফোন নম্বর দিন।');
      return;
    }
    if (!customerAddress.trim()) {
      setError('ডেলিভারি ঠিকানা প্রদান করুন।');
      return;
    }

    const newOrder = storage.createPosOrder({
      customer_name: customerName.trim() || 'Phone Customer',
      customer_phone: customerPhone.trim(),
      customer_address: customerAddress.trim(),
      district,
      items: selectedItems,
      discount: manualDiscount,
      payment_method: paymentMethod,
      notes,
    });

    onOrderCreated(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-600 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-white" />
            </span>
            <div>
              <h2 className="text-base font-bold">Admin POS / Quick Manual Order (ফোন অর্ডার এন্ট্রি)</h2>
              <p className="text-[11px] text-slate-300">ফোন বা ফেসবুক ইনবক্স থেকে দ্রুত অর্ডার তৈরির ইন্টারফেস</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Product Selector (5 cols) */}
          <div className="lg:col-span-5 space-y-3 flex flex-col">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="প্রোডাক্ট খুঁজুন..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="flex-1 max-h-[380px] overflow-y-auto space-y-2 pr-1 border border-slate-100 rounded-xl p-1">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleAddProduct(p)}
                  className="p-2 rounded-xl border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/40 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-9 h-9 object-contain rounded bg-white border border-slate-100 p-0.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Stock: {p.stock_quantity}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-emerald-800">৳{p.sale_price}</div>
                    <span className="text-[10px] text-emerald-600 font-bold">+ যোগ করুন</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Order Details & Customer Form (7 cols) */}
          <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              {error && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Selected Cart Items Table */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  অর্ডারের পণ্যসমূহ ({selectedItems.length} টি)
                </span>
                {selectedItems.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-400">
                    বাম পাশ থেকে পণ্য ক্লিক করে যুক্ত করুন
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {selectedItems.map((item) => (
                      <div
                        key={item.product_id}
                        className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="font-semibold text-slate-800 truncate max-w-[160px]">
                          {item.product.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-slate-200 rounded bg-slate-50">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.product_id, -1)}
                              className="px-2 py-0.5 font-bold hover:bg-slate-200"
                            >
                              -
                            </button>
                            <span className="px-2 font-bold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.product_id, 1)}
                              className="px-2 py-0.5 font-bold hover:bg-slate-200"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-bold text-slate-900 w-16 text-right">
                            ৳{item.total_price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">কাস্টমারের নাম</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asif Mahmud"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full h-8 px-2.5 border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ফোন নম্বর (১১ ডিজিট)</label>
                  <input
                    type="text"
                    required
                    placeholder="017xxxxxxxx"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full h-8 px-2.5 border border-slate-300 rounded-lg font-mono outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">সম্পূর্ণ ঠিকানা</label>
                  <input
                    type="text"
                    required
                    placeholder="বাসা নং, রোড নং, এলাকা..."
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full h-8 px-2.5 border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">জেলা (District)</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full h-8 px-2 border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    <option value="Dhaka">Dhaka (ডেলিভারি ৳৭০)</option>
                    <option value="Chattogram">Chattogram (ডেলিভারি ৳১৩০)</option>
                    <option value="Sylhet">Sylhet (ডেলিভারি ৳১৩০)</option>
                    <option value="Rajshahi">Rajshahi (ডেলিভারি ৳১৩০)</option>
                    <option value="Khulna">Khulna (ডেলিভারি ৳১৩০)</option>
                    <option value="Other">Other District (৳১৩০)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">পেমেন্ট মেথড</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full h-8 px-2 border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    <option value="cod">Cash on Delivery (COD)</option>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">স্পেশাল ডিসকাউন্ট (৳)</label>
                  <input
                    type="number"
                    value={manualDiscount}
                    onChange={(e) => setManualDiscount(Number(e.target.value))}
                    className="w-full h-8 px-2.5 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Total & Submit */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-500">সর্বমোট প্রদেয় বিল:</span>
                <div className="text-lg font-black text-slate-900">
                  ৳{grandTotal.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>অর্ডার তৈরি করুন (Create Order)</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
