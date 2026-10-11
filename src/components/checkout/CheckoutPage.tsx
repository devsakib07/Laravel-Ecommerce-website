import React, { useState, useEffect } from 'react';
import { storage } from '../../services/storage';
import { CartItem, Order } from '../../types/ecommerce';
import { Trash2, ChevronUp, ChevronDown, Check, ArrowLeft, AlertCircle, MessageCircle, Sparkles, Coins } from 'lucide-react';

interface CheckoutPageProps {
  onBack: () => void;
  onOrderPlaced: (order: Order) => void;
  onOpenLoginModal?: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onBack,
  onOrderPlaced,
  onOpenLoginModal,
}) => {
  const [cart, setCart] = useState<CartItem[]>(() => storage.getCart());
  const settings = storage.getSettings();

  // Form states matching screenshot
  const [fullName, setFullName] = useState('Mahmudur Rahman');
  const [phone, setPhone] = useState('01712345678');
  const [email, setEmail] = useState('example@gmail.com');
  const [address, setAddress] = useState('House 42, Road 11, Block D, Banani');
  const [district, setDistrict] = useState('Dhaka');
  const [thana, setThana] = useState('Banani');
  const [notes, setNotes] = useState('');
  const [sameAsBilling, setSameAsBilling] = useState(true);

  // Loyalty points state
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const loyaltyPointsAvailable = storage.getLoyaltyPoints();

  // Payment method: 'cod' | 'online' | 'bkash'
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online' | 'bkash'>('cod');
  const [bkashTrxId, setBkashTrxId] = useState('');

  // Coupon state
  const [couponOpen, setCouponOpen] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Terms agreement
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Cart syncing
  const syncCart = () => {
    setCart(storage.getCart());
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    storage.updateCartQuantity(itemId, delta);
    syncCart();
  };

  const handleRemoveItem = (itemId: string) => {
    storage.removeFromCart(itemId);
    syncCart();
  };

  // Subtotal & Delivery
  const subtotal = cart.reduce((sum, item) => sum + item.total_price, 0);
  const freeThreshold = settings.free_delivery_threshold || 2500;
  const isFreeDelivery = subtotal >= freeThreshold;
  const deliveryCost = isFreeDelivery
    ? 0
    : district.toLowerCase() === 'dhaka'
    ? settings.delivery_inside_dhaka || 70
    : settings.delivery_outside_dhaka || 130;

  const loyaltyDiscount = useLoyaltyPoints ? Math.min(loyaltyPointsAvailable, subtotal) : 0;
  const total = Math.max(0, subtotal - couponDiscount - loyaltyDiscount + deliveryCost);

  // Abandoned cart auto-tracking: record when phone and name are entered
  useEffect(() => {
    if (phone.length >= 10 && cart.length > 0) {
      storage.saveAbandonedCart({
        customer_name: fullName.trim(),
        customer_phone: phone.trim(),
        customer_address: `${address}, ${district}`,
        items: cart,
        cart_total: total,
      });
    }
  }, [phone, fullName, address, district, total, cart]);

  // Apply Coupon
  const handleApplyCouponCode = (codeToApply?: string) => {
    const code = codeToApply || couponCode;
    if (!code.trim()) return;

    if (code.toUpperCase().trim() === 'MR30') {
      const disc = Math.round(subtotal * 0.1);
      setAppliedCoupon('MR30');
      setCouponDiscount(disc);
      setCouponMsg({ text: `MR30 applied: Flat 10% OFF (-৳${disc})`, isError: false });
      return;
    }

    const res = storage.validateCoupon(code, subtotal);
    if (res.valid) {
      setAppliedCoupon(code.toUpperCase().trim());
      setCouponDiscount(res.discount);
      setCouponMsg({ text: res.message, isError: false });
    } else {
      setCouponMsg({ text: res.message, isError: true });
    }
  };

  // Submit Order
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (cart.length === 0) {
      setFormError('Your cart is empty. Please add items to proceed.');
      return;
    }

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setFormError('Please fill in required fields (Name, Phone number, Address).');
      return;
    }

    if (!termsAgreed) {
      setFormError('Please agree to the Terms and Conditions to proceed.');
      return;
    }

    setSubmitting(true);

    try {
      const order = storage.createOrder({
        customer_name: fullName.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim(),
        division: 'Dhaka',
        district,
        upazila: thana,
        full_address: address.trim(),
        notes: notes.trim(),
        items: cart,
        coupon_code: appliedCoupon || undefined,
        payment_method: paymentMethod === 'bkash' ? 'bkash' : paymentMethod === 'online' ? 'card' : 'cod',
        delivery_zone: district.toLowerCase() === 'dhaka' ? 'inside_dhaka' : 'outside_dhaka',
      });

      if (paymentMethod === 'bkash' && bkashTrxId.trim()) {
        storage.updatePaymentStatus(order.id, 'paid', bkashTrxId.trim());
      }

      onOrderPlaced(order);
    } catch (err) {
      console.error(err);
      setFormError('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const bangladeshDistricts = [
    'Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur',
    'Mymensingh', 'Comilla', 'Gazipur', 'Narayanganj', 'Bogra', 'Jessore', 'Cox\'s Bazar'
  ];

  if (cart.length === 0) {
    return (
      <div className="bg-[#FAF9F7] min-h-screen py-16 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="text-4xl">🛒</div>
          <h2 className="text-lg font-bold text-slate-800">Your cart is currently empty</h2>
          <p className="text-xs text-slate-500">
            Please add some fresh natural grocery items before proceeding to checkout.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-[#E25C1D] text-white text-xs font-bold rounded-lg hover:bg-[#c94f17] transition-colors"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F7] min-h-screen py-6 sm:py-8 text-slate-800">
      <div className="max-w-[1240px] mx-auto px-4">
        {/* Title & Breadcrumbs matching screenshot */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Checkout</h1>
          <div className="text-xs text-slate-400 font-medium mt-1">
            <span className="hover:text-emerald-800 cursor-pointer" onClick={onBack}>Home</span>
            <span className="mx-1.5">&gt;</span>
            <span className="text-[#E25C1D]">Checkout</span>
          </div>
        </div>

        {/* Top Login Prompt Bar matching screenshot */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-xs sm:text-[13px] text-slate-700 font-medium">
            Have any account? please login or register
          </span>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="px-4 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 text-xs font-semibold text-slate-700 bg-white transition-colors"
            >
              Login
            </button>
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="px-4 py-1.5 rounded-lg bg-[#E25C1D] hover:bg-[#c94f17] text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              Register
            </button>
          </div>
        </div>

        {formError && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Order Review, Shipping Address, Billing Address (7 Columns on LG) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. ORDER REVIEW */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-1 h-4 bg-[#E25C1D] rounded-full" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">Order review</h2>
              </div>

              <div className="divide-y divide-slate-100">
                {cart.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-lg border border-slate-200 bg-[#FAF9F6] p-1 flex items-center justify-center shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                          {item.product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-slate-500">Qty:</span>
                          <div className="flex items-center border border-slate-200 rounded bg-slate-50">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.id, -1)}
                              className="w-5 h-5 flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-slate-200"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.id, 1)}
                              className="w-5 h-5 flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-slate-200"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        ৳{item.total_price.toLocaleString()}.00
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-rose-500 hover:text-rose-700 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. SHIPPING ADDRESS */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-1 h-4 bg-[#E25C1D] rounded-full" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">Shipping Address</h2>
              </div>

              <div className="space-y-3">
                {/* Row 1: Full name + Phone with 88 prefix box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name *"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-xs sm:text-[13px] outline-none focus:border-[#E25C1D] bg-white"
                    />
                  </div>

                  <div className="flex rounded-lg border border-slate-300 overflow-hidden focus-within:border-[#E25C1D]">
                    <span className="px-3 h-11 bg-slate-100 border-r border-slate-300 text-xs font-bold text-slate-600 flex items-center justify-center">
                      88
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="017********"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-11 px-3 text-xs sm:text-[13px] outline-none bg-white font-medium"
                    />
                  </div>
                </div>

                {/* Row 2: Email */}
                <div>
                  <input
                    type="email"
                    placeholder="example@gmail.com (Optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-xs sm:text-[13px] outline-none focus:border-[#E25C1D] bg-white"
                  />
                </div>

                {/* Row 3: Street Address */}
                <div>
                  <input
                    type="text"
                    required
                    placeholder="ex: House no. / building / street / area"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-xs sm:text-[13px] outline-none focus:border-[#E25C1D] bg-white"
                  />
                </div>

                {/* Row 4: Select District & Select Thana */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-slate-300 text-xs sm:text-[13px] outline-none focus:border-[#E25C1D] bg-white appearance-none cursor-pointer"
                    >
                      {bangladeshDistricts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Select Thana (Optional)"
                      value={thana}
                      onChange={(e) => setThana(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-xs sm:text-[13px] outline-none focus:border-[#E25C1D] bg-white"
                    />
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. BILLING ADDRESS */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1 h-4 bg-[#E25C1D] rounded-full" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">Billing Address</h2>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sameAsBilling}
                  onChange={(e) => setSameAsBilling(e.target.checked)}
                  className="w-4 h-4 rounded-full accent-[#E25C1D]"
                />
                <span className="text-xs text-slate-600 hidden sm:inline">Same as shipping address</span>
              </label>
            </div>
          </div>

          {/* RIGHT COLUMN: Payment Method, Coupons, Totals, Notes, Place Order (5 Columns on LG) */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. PAYMENT METHOD */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-1 h-4 bg-[#E25C1D] rounded-full" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">Payment method</h2>
              </div>

              <div className="space-y-2.5">
                {/* Cash on Delivery (active state with orange checkmark circle) */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#E25C1D] bg-orange-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">💵</span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-800">Cash On Delivery</span>
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className="w-5 h-5 rounded-full bg-[#E25C1D] text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Online Payment */}
                <div
                  onClick={() => setPaymentMethod('online')}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'online'
                      ? 'border-[#E25C1D] bg-orange-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">💳</span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-800">Online Payment</span>
                  </div>
                  {paymentMethod === 'online' && (
                    <div className="w-5 h-5 rounded-full bg-[#E25C1D] text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Bkash */}
                <div
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'bkash'
                      ? 'border-[#E25C1D] bg-orange-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded">bKash</span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-800">Bkash</span>
                  </div>
                  {paymentMethod === 'bkash' && (
                    <div className="w-5 h-5 rounded-full bg-[#E25C1D] text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {paymentMethod === 'bkash' && (
                  <div className="p-3 bg-pink-50/70 border border-pink-200 rounded-xl space-y-2 mt-2">
                    <p className="text-[11px] text-pink-900">
                      Please send payment to our bKash merchant number <strong className="font-mono">01844232321</strong> and enter the Transaction ID:
                    </p>
                    <input
                      type="text"
                      placeholder="Transaction ID (e.g. 9BKS124)"
                      value={bkashTrxId}
                      onChange={(e) => setBkashTrxId(e.target.value)}
                      className="w-full h-9 px-3 rounded border border-pink-300 text-xs font-mono uppercase bg-white outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 2. COUPON ACCORDION */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-3">
              <div
                onClick={() => setCouponOpen(!couponOpen)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <h3 className="text-xs sm:text-sm font-semibold text-slate-800">
                  Have any coupon or gift voucher?
                </h3>
                <button type="button" className="text-slate-400">
                  {couponOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {couponOpen && (
                <div className="space-y-3 pt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Coupon"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 h-10 px-3 rounded-lg border border-slate-300 text-xs uppercase font-mono outline-none focus:border-[#E25C1D]"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCouponCode()}
                      className="px-4 h-10 rounded-lg bg-[#E25C1D] hover:bg-[#c94f17] text-white text-xs font-bold transition-colors"
                    >
                      Apply coupon
                    </button>
                  </div>

                  {couponMsg && (
                    <p className={`text-[11px] font-medium ${couponMsg.isError ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {couponMsg.text}
                    </p>
                  )}

                  {/* Eligible promo codes matching screenshot */}
                  <div className="pt-2">
                    <p className="text-[11px] text-slate-500 font-semibold mb-1.5">Eligible promo codes</p>
                    <div
                      onClick={() => handleApplyCouponCode('MR30')}
                      className="inline-block p-2.5 rounded-lg border border-dashed border-[#E25C1D] bg-orange-50/50 cursor-pointer hover:bg-orange-100/50 transition-colors"
                    >
                      <p className="text-xs font-extrabold text-slate-900 font-mono">MR30</p>
                      <p className="text-[10px] text-slate-500 font-medium">Flat 10% OFF</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2.5. CUSTOMER LOYALTY REWARD POINTS */}
            {settings.loyalty_enabled !== false && loyaltyPointsAvailable > 0 && (
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-100/30 to-amber-500/10 rounded-2xl border border-amber-200 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-amber-500 text-white">
                      <Coins className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-xs font-bold text-amber-950">
                        আপনার অ্যাকাউন্টে {loyaltyPointsAvailable} রিওয়ার্ড পয়েন্ট আছে
                      </div>
                      <div className="text-[10px] text-amber-800">
                        ১ পয়েন্ট = ৳১ নগদ ক্যাশ ছাড় হিসেবে ব্যবহারযোগ্য
                      </div>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs">
                    <input
                      type="checkbox"
                      checked={useLoyaltyPoints}
                      onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                      className="accent-[#E25C1D] w-3.5 h-3.5"
                    />
                    <span className="text-xs font-bold text-slate-800 select-none">
                      ছাড় নিন
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* 3. TOTALS BREAKDOWN matching screenshot */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Sub total</span>
                <span className="font-semibold text-slate-900">{subtotal.toLocaleString()}.00 BDT</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon discount ({appliedCoupon})</span>
                  <span>- {couponDiscount.toLocaleString()}.00 BDT</span>
                </div>
              )}

              {loyaltyDiscount > 0 && (
                <div className="flex justify-between text-amber-700 font-semibold">
                  <span>Loyalty Points Discount</span>
                  <span>- {loyaltyDiscount.toLocaleString()}.00 BDT</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Delivery cost</span>
                <span className="font-semibold text-slate-900">{deliveryCost} BDT</span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-200">
                <span>Total</span>
                <span className="text-lg font-black text-slate-900">
                  {total.toLocaleString()}.00BDT
                </span>
              </div>
            </div>

            {/* 4. SPECIAL NOTES */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-2">
              <div className="flex items-center gap-2 pb-1">
                <span className="w-1 h-4 bg-[#E25C1D] rounded-full" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Special notes <span className="text-slate-400 font-normal">(Optional)</span>
                </h3>
              </div>

              <textarea
                rows={3}
                maxLength={90}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write any note for delivery rider..."
                className="w-full p-3 rounded-lg border border-slate-300 text-xs outline-none focus:border-[#E25C1D] bg-white resize-none"
              />
              <div className="text-right text-[11px] text-slate-400">
                {notes.length} / 90 characters
              </div>
            </div>

            {/* 5. TERMS AGREEMENT CHECKBOX */}
            <div className="flex items-start gap-2 pt-1 text-xs text-slate-600">
              <input
                type="checkbox"
                required
                id="terms"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#E25C1D] accent-[#E25C1D]"
              />
              <label htmlFor="terms" className="cursor-pointer select-none leading-relaxed">
                I have read and agree to the{' '}
                <span className="text-[#E25C1D] hover:underline">Terms and Conditions</span>,{' '}
                <span className="text-[#E25C1D] hover:underline">Privacy Policy</span> &{' '}
                <span className="text-[#E25C1D] hover:underline">Refund and Return Policy</span>.
              </label>
            </div>

            {/* 6. PLACE ORDER BUTTON */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-[#E25C1D] hover:bg-[#c94f17] text-white font-extrabold text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'PROCESSING ORDER...' : 'PLACE ORDER'}
            </button>

            {/* 7. DIRECT ORDER CONFIRMATION VIA WHATSAPP */}
            {settings.whatsapp_order_enabled !== false && (
              <button
                type="button"
                onClick={() => {
                  const wpNumber = settings.whatsapp_number || settings.phone || '01712345678';
                  const cleanPhone = wpNumber.replace(/\D/g, '').replace(/^0/, '880');
                  const itemsList = cart.map((i) => `• ${i.product.name} (Qty: ${i.quantity}) - ৳${i.total_price}`).join('\n');
                  const msg = encodeURIComponent(
                    `আসসালামু আলাইকুম, আমি সরাসরি WhatsApp-এ অর্ডার কনফার্ম করতে চাই:\n\n` +
                    `👤 নাম: ${fullName}\n` +
                    `📞 ফোন: ${phone}\n` +
                    `📍 ঠিকানা: ${address}, ${district}\n\n` +
                    `🛒 পণ্যের তালিকা:\n${itemsList}\n\n` +
                    `💰 মোট মূল্য: ৳${total.toLocaleString()} (${paymentMethod.toUpperCase()})\n\n` +
                    `দয়া করে পার্সেলটি পাঠিয়ে দিন।`
                  );
                  window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
                }}
                className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>📱 হোয়াটসঅ্যাপে সরাসরি অর্ডার করুন (Order via WhatsApp)</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
