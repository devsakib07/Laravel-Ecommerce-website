import React, { useState, useEffect } from 'react';
import { AbandonedCart } from '../../types/ecommerce';
import { storage } from '../../services/storage';
import {
  ShoppingCart,
  MessageCircle,
  Phone,
  CheckCircle2,
  Trash2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Search,
  Check,
  TrendingUp,
  Clock,
} from 'lucide-react';

export const AbandonedCartsTab: React.FC = () => {
  const [carts, setCarts] = useState<AbandonedCart[]>(() => storage.getAbandonedCarts());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'recovered'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const reloadCarts = () => {
    setCarts(storage.getAbandonedCarts());
  };

  useEffect(() => {
    window.addEventListener('abandoned-carts-updated', reloadCarts);
    return () => {
      window.removeEventListener('abandoned-carts-updated', reloadCarts);
    };
  }, []);

  const handleSendWhatsApp = (cart: AbandonedCart) => {
    const cleanPhone = cart.customer_phone.replace(/\D/g, '').replace(/^0/, '880');
    const itemsList = cart.items.map((i) => `• ${i.product.name} (${i.quantity} টি)`).join('\n');
    const msg = encodeURIComponent(
      `আসসালামু আলাইকুম ${cart.customer_name},\n\n` +
      `আমরা লক্ষ্য করেছি আপনি Shuddho Bazar থেকে কিছু পণ্য অর্ডারের জন্য কার্টে রেখেছিলেন কিন্তু অর্ডারটি সম্পন্ন করেননি:\n\n` +
      `${itemsList}\n\n` +
      `মোট মূল্য: ৳${cart.cart_total.toLocaleString()}\n\n` +
      `🎁 আপনার জন্য স্পেশাল অফার! কুপন কোড "COMEBACK50" ব্যবহার করে ৫০ টাকা ছাড় পেতে পারেন।\n` +
      `আপনি কি অর্ডারটি কনফার্ম করতে চান? জানালে আমরা এখনই পাঠিয়ে দেব। ধন্যবাদ!`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
    storage.markAbandonedCartRecovered(cart.id);
    reloadCarts();
  };

  const handleMarkRecovered = (id: string) => {
    storage.markAbandonedCartRecovered(id);
    reloadCarts();
  };

  const handleDelete = (id: string) => {
    if (confirm('অসম্পূর্ণ কার্ট রেকর্ডটি মুছে ফেলতে চান?')) {
      storage.deleteAbandonedCart(id);
      reloadCarts();
    }
  };

  const filteredCarts = carts.filter((c) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.customer_name.toLowerCase().includes(q) ||
      c.customer_phone.includes(q) ||
      (c.customer_address && c.customer_address.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (filter === 'pending') return !c.recovered;
    if (filter === 'recovered') return c.recovered;
    return true;
  });

  const totalLostRevenue = carts.filter((c) => !c.recovered).reduce((s, c) => s + c.cart_total, 0);
  const recoveredCount = carts.filter((c) => c.recovered).length;
  const recoveryRate = carts.length > 0 ? Math.round((recoveredCount / carts.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 p-5 sm:p-6 rounded-3xl text-white shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 border border-amber-900/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
              <ShoppingCart className="w-5 h-5 animate-pulse" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">
              Abandoned Cart Recovery (অসম্পূর্ণ অর্ডার পুনরুদ্ধার)
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            যেসব কাস্টমার কার্টে পণ্য যোগ করেছে বা চেকআউটে নাম ও ফোন নম্বর দিয়ে অর্ডার ফাইনাল না করেই বের হয়ে গেছে, তাদের তালিকা। সরাসরি WhatsApp রিমাইন্ডার বা কল দিয়ে অর্ডার রিকভার করুন।
          </p>
        </div>

        <button
          onClick={reloadCarts}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
          title="Refresh List"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">মোট অসম্পূর্ণ কার্ট</span>
            <ShoppingCart className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{carts.length} টি</div>
          <div className="text-[11px] text-slate-400">ড্রপ অফ কাস্টমার</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">সম্ভাব্য উদ্ধারযোগ্য সেলস</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">
            ৳{totalLostRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">পেন্ডিং কার্টের মোট মূল্য</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">রিকভারি সফলতার হার</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {recoveryRate}% ({recoveredCount} টি উদ্ধার)
          </div>
          <div className="text-[11px] text-slate-400">WhatsApp ফলো-আপের মাধ্যমে</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="নাম বা ফোন নম্বর দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            সব ({carts.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'pending' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            পেন্ডিং ({carts.filter((c) => !c.recovered).length})
          </button>
          <button
            onClick={() => setFilter('recovered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'recovered' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            উদ্ধারকৃত ({recoveredCount})
          </button>
        </div>
      </div>

      {/* 4. Abandoned Carts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredCarts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <ShoppingCart className="w-10 h-10 mx-auto text-slate-300" />
            <div className="text-sm font-bold text-slate-700">কোনো অসম্পূর্ণ কার্ট পাওয়া যায়নি</div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredCarts.map((cart) => (
              <div key={cart.id} className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{cart.customer_name}</span>
                    <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {cart.customer_phone}
                    </span>
                    {cart.recovered ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                        ✓ উদ্ধারকৃত (Recovered)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
                        ● ড্রপ অফ (Pending)
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-medium">
                      {cart.created_at}
                    </span>
                  </div>

                  {cart.customer_address && (
                    <div className="text-xs text-slate-500">
                      ঠিকানা: {cart.customer_address}
                    </div>
                  )}

                  {/* Items in cart */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {cart.items.map((item, i) => (
                      <span key={i} className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg font-medium">
                        {item.product.name} × {item.quantity}
                      </span>
                    ))}
                    <span className="text-xs font-black text-slate-900 ml-1">
                      মোট: ৳{cart.cart_total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    onClick={() => handleSendWhatsApp(cart)}
                    className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>WhatsApp রিমাইন্ডার</span>
                  </button>

                  <a
                    href={`tel:${cart.customer_phone}`}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Direct Call"
                  >
                    <Phone className="w-4 h-4" />
                  </a>

                  {!cart.recovered && (
                    <button
                      onClick={() => handleMarkRecovered(cart.id)}
                      className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                      title="Mark as Recovered"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(cart.id)}
                    className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
