import React, { useState, useRef } from 'react';
import { Testimonial } from '../../types/ecommerce';
import { storage } from '../../services/storage';
import {
  Star,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle,
  AlertTriangle,
  X,
  Upload,
  MessageSquare,
  Quote,
  Eye,
  EyeOff,
  User,
  Filter,
  CheckCircle2,
} from 'lucide-react';

interface ReviewsTabProps {
  onReviewsUpdated?: () => void;
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({ onReviewsUpdated }) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => storage.getTestimonials());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerRole, setCustomerRole] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [customerPhoto, setCustomerPhoto] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [formError, setFormError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize helper
  const reloadData = () => {
    const list = storage.getTestimonials();
    setTestimonials(list);
    if (onReviewsUpdated) {
      onReviewsUpdated();
    }
  };

  // Open modal for adding
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setCustomerName('');
    setCustomerRole('নিয়মিত ক্রেতা (Regular Customer)');
    setRating(5);
    setComment('');
    setCustomerPhoto('');
    setStatus('active');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (item: Testimonial) => {
    setEditingItem(item);
    setCustomerName(item.customer_name);
    setCustomerRole(item.customer_role || '');
    setRating(item.rating);
    setComment(item.comment);
    setCustomerPhoto(item.customer_photo || '');
    setStatus(item.status);
    setFormError('');
    setIsModalOpen(true);
  };

  // Save form handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setFormError('দয়া করে গ্রাহকের নাম লিখুন (Please enter customer name)');
      return;
    }
    if (!comment.trim()) {
      setFormError('দয়া করে রিভিউ বা মন্তব্যের বিবরণ দিন (Please enter review comment)');
      return;
    }

    storage.saveTestimonial({
      id: editingItem ? editingItem.id : undefined,
      customer_name: customerName,
      customer_role: customerRole,
      rating: rating,
      comment: comment,
      comment_bn: comment,
      customer_photo: customerPhoto,
      status: status,
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsModalOpen(false);
      reloadData();
    }, 400);
  };

  // Quick toggle status
  const handleToggleStatus = (id: string) => {
    storage.toggleTestimonialStatus(id);
    reloadData();
  };

  // Delete handler
  const handleDelete = (id: string) => {
    storage.deleteTestimonial(id);
    setDeletingId(null);
    reloadData();
  };

  // Image file upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('ছবির আকার সর্বোচ্চ ২ মেগাবাইট হতে হবে (Max 2MB file size)');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomerPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Filtered testimonials
  const filteredList = testimonials.filter((item) => {
    // Status filter
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    // Rating filter
    if (ratingFilter !== 'all' && item.rating !== Number(ratingFilter)) return false;
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.customer_name.toLowerCase().includes(q) ||
        (item.customer_role && item.customer_role.toLowerCase().includes(q)) ||
        item.comment.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // KPI metrics
  const totalReviews = testimonials.length;
  const activeReviews = testimonials.filter((t) => t.status === 'active').length;
  const inactiveReviews = totalReviews - activeReviews;
  const avgRating = totalReviews > 0
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / totalReviews).toFixed(1)
    : '5.0';
  const fiveStarReviews = testimonials.filter((t) => t.rating === 5).length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Customer Reviews & Testimonials (গ্রাহক রিভিউ)
              </h2>
              <p className="text-xs text-slate-500">
                হোমপেজ স্লাইডার ক্যারোজেলের জন্য রিভিউ যুক্ত, এডিট ও নিয়ন্ত্রণ করুন
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E25C1D] hover:bg-[#c94f17] text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ নতুন রিভিউ যোগ করুন</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block mb-1">মোট রিভিউ (Total)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalReviews}</span>
            <span className="text-xs text-slate-400">টি</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-emerald-600 font-medium block mb-1">সক্রিয় (Active in Slider)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{activeReviews}</span>
            <span className="text-xs text-emerald-500">টি দৃশ্যমান</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-amber-600 font-medium block mb-1">গড় রেটিং (Avg Rating)</span>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-black text-amber-600">{avgRating}</span>
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block mb-1">৫-স্টার রিভিউ (5 Star)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{fiveStarReviews}</span>
            <span className="text-xs text-slate-400">
              ({totalReviews > 0 ? Math.round((fiveStarReviews / totalReviews) * 100) : 100}%)
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="গ্রাহকের নাম বা মন্তব্য খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-[#E25C1D] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              সব ({totalReviews})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              সক্রিয় ({activeReviews})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                statusFilter === 'inactive'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              লুকানো ({inactiveReviews})
            </button>
          </div>

          {/* Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-hidden focus:border-[#E25C1D]"
          >
            <option value="all">সব রেটিং</option>
            <option value="5">৫ স্টার (★★★★★)</option>
            <option value="4">৪ স্টার (★★★★)</option>
            <option value="3">৩ স্টার (★★★)</option>
          </select>
        </div>
      </div>

      {/* Reviews Table / Card Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">কোনো রিভিউ পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              আপনার ফিল্টারের সাথে মিলে এমন কোনো রিভিউ নেই
            </p>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E25C1D] text-white text-xs font-bold hover:bg-[#c94f17] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>প্রথম রিভিউ যোগ করুন</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredList.map((item) => (
              <div
                key={item.id}
                className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Avatar / Photo */}
                  {item.customer_photo ? (
                    <img
                      src={item.customer_photo}
                      alt={item.customer_name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-300 shrink-0 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-300 flex items-center justify-center text-emerald-900 font-bold text-base shrink-0 shadow-xs">
                      {item.customer_name.trim().slice(0, 1).toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {item.customer_name}
                      </span>
                      {item.customer_role && (
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {item.customer_role}
                        </span>
                      )}
                      {/* Active Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          item.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {item.status === 'active' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            সক্রিয় (Slider Visible)
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-slate-400" />
                            লুকানো (Hidden)
                          </>
                        )}
                      </span>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < item.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-200 text-slate-200'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-1">
                        {item.rating}.0
                      </span>
                    </div>

                    {/* Review Comment */}
                    <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed line-clamp-3 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/60">
                      "{item.comment}"
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto justify-end">
                  {/* Quick Toggle Status */}
                  <button
                    onClick={() => handleToggleStatus(item.id)}
                    title={item.status === 'active' ? 'ক্যারোজেল থেকে লুকান' : 'ক্যারোজেলে প্রদর্শন করুন'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                      item.status === 'active'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {item.status === 'active' ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>সক্রিয়</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>লুকানো</span>
                      </>
                    )}
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    title="এডিট করুন"
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setDeletingId(item.id)}
                    title="ডিলিট করুন"
                    className="p-2 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 text-center animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              রিভিউটি ডিলিট করতে চান?
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              এই রিভিউটি সম্পূর্ণভাবে মুছে ফেলা হবে এবং হোমপেজ ক্যারোজেল থেকেও আর দেখা যাবে না।
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                বাতিল (Cancel)
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  ★
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingItem ? 'রিভিউ সম্পাদন করুন (Edit Review)' : 'নতুন রিভিউ যোগ করুন (Add Review)'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    হোমপেজ স্লাইডার ক্যারোজেলের জন্য রিভিউ প্রস্তুত করুন
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  গ্রাহকের নাম (Customer Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মোঃ আহসান হাবীব / Farhana Islam"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-[#E25C1D] focus:bg-white transition-all"
                />
              </div>

              {/* Customer Role / Location */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  পদবি বা এলাকা (Role / Location)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: নিয়মিত ক্রেতা, ধানমন্ডি, ঢাকা / Verified Buyer, Chittagong"
                  value={customerRole}
                  onChange={(e) => setCustomerRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-[#E25C1D] focus:bg-white transition-all"
                />
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  রেটিং সিলেক্ট করুন (Star Rating) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-amber-50/60 p-2 rounded-xl border border-amber-200/60">
                    {[1, 2, 3, 4, 5].map((starNum) => (
                      <button
                        type="button"
                        key={starNum}
                        onClick={() => setRating(starNum)}
                        className="p-1 hover:scale-125 transition-transform"
                        title={`${starNum} Star`}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            starNum <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-200 text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-700">
                    {rating === 5 && '★★★★★ ৫/৫ (চমৎকার / Excellent)'}
                    {rating === 4 && '★★★★☆ ৪/৫ (খুব ভালো / Very Good)'}
                    {rating === 3 && '★★★☆☆ ৩/৫ (সন্তোষজনক / Satisfactory)'}
                    {rating === 2 && '★★☆☆☆ ২/৫ (সাধারণ / Fair)'}
                    {rating === 1 && '★☆☆☆☆ ১/৫ (উন্নতি দরকার / Poor)'}
                  </span>
                </div>
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  গ্রাহকের মতামত বা রিভিউ (Customer Comment) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="গ্রাহক পণ্য ও সেবা নিয়ে কী বলেছেন লিখুন..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-[#E25C1D] focus:bg-white transition-all"
                />
              </div>

              {/* Customer Photo (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  গ্রাহকের ছবি (Customer Photo - Optional)
                </label>
                <div className="flex items-center gap-3">
                  {/* Photo Preview / Avatar */}
                  {customerPhoto ? (
                    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#E25C1D] shrink-0 shadow-xs">
                      <img
                        src={customerPhoto}
                        alt="Customer preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setCustomerPhoto('')}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        title="ছবি মুছুন"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="url"
                      placeholder="ছবির লিংক (Image URL)"
                      value={customerPhoto}
                      onChange={(e) => setCustomerPhoto(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-[#E25C1D]"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-md transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>ডিভাইস থেকে ছবি আপলোড করুন</span>
                      </button>
                      {customerPhoto && (
                        <button
                          type="button"
                          onClick={() => setCustomerPhoto('')}
                          className="text-[11px] text-rose-600 hover:underline"
                        >
                          ছবি বাতিল করুন
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    স্ট্যাটাস (Status)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {status === 'active'
                      ? 'সক্রিয়: হোমপেজ স্লাইডার ক্যারোজেলে প্রদর্শিত হবে'
                      : 'লুকানো: ওয়েবসাইটে দেখাবে না'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus(status === 'active' ? 'inactive' : 'active')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      status === 'active' ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        status === 'active' ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  স্লাইডার কার্ড প্রিভিউ (Live Card Preview)
                </span>
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-200 text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                      ✓ Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 italic mb-3">
                    "{comment || 'গ্রাহকের রিভিউ প্রিভিউ এখানে দেখা যাবে...'}"
                  </p>
                  <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
                    {customerPhoto ? (
                      <img
                        src={customerPhoto}
                        alt="Preview"
                        className="w-8 h-8 rounded-full object-cover border border-emerald-300 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {customerName ? customerName.slice(0, 1).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {customerName || 'গ্রাহকের নাম'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {customerRole || 'নিয়মিত ক্রেতা'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E25C1D] hover:bg-[#c94f17] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{editingItem ? 'সংরক্ষণ করুন (Save Changes)' : 'রিভিউ যুক্ত করুন (Add Review)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
