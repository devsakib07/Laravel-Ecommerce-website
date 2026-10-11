import React, { useState, useRef } from 'react';
import { Category, Product } from '../../types/ecommerce';
import { storage } from '../../services/storage';
import {
  FolderTree,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle,
  AlertTriangle,
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Save,
  Check,
  Eye,
  Sliders,
  Package,
  Type
} from 'lucide-react';

interface CategoriesTabProps {
  categories: Category[];
  products: Product[];
  onCategoriesUpdated: (categories: Category[]) => void;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  products,
  onCategoriesUpdated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Form states: Name and Image are optional, user can provide either or both (no icon)
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [slug, setSlug] = useState('');
  const [image, setImage] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isFeatured, setIsFeatured] = useState(true);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to open modal for Add
  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName('');
    setNameBn('');
    setSlug('');
    setImage('');
    setSortOrder(categories.length + 1);
    setIsFeatured(true);
    setStatus('active');
    setShowModal(true);
  };

  // Helper to open modal for Edit
  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name || '');
    setNameBn(cat.name_bn || cat.name || '');
    setSlug(cat.slug);
    setImage(cat.image || '');
    setSortOrder(cat.sort_order || 1);
    setIsFeatured(Boolean(cat.is_featured));
    setStatus(cat.status || 'active');
    setShowModal(true);
  };

  // Auto-generate slug from name
  const handleGenerateSlug = (val: string) => {
    setName(val);
    if (!editingCategory) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  // Handle Image File Upload
  const handleImageFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Category: Name or Image is optional, but at least ONE must be provided
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedImage = image.trim();

    if (!trimmedName && !trimmedImage) {
      alert('দয়া করে ক্যাটাগরির নাম অথবা ছবি (বা উভয়ই) দিন। (Please provide either category name or image, or both.)');
      return;
    }

    const fallbackSlug = trimmedName
      ? trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      : `cat-${Date.now().toString().slice(-5)}`;

    storage.saveCategory({
      id: editingCategory ? editingCategory.id : undefined,
      name: trimmedName,
      name_bn: nameBn.trim() || trimmedName,
      slug: slug.trim() || fallbackSlug,
      icon: '',
      image: trimmedImage,
      sort_order: Number(sortOrder),
      is_featured: isFeatured,
      status,
    });

    onCategoriesUpdated(storage.getCategories());
    setShowModal(false);
  };

  // Delete Category
  const handleConfirmDelete = () => {
    if (!categoryToDelete) return;
    storage.deleteCategory(categoryToDelete.id);
    onCategoriesUpdated(storage.getCategories());
    setCategoryToDelete(null);
  };

  // Filter categories
  const filteredCategories = categories.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.name_bn && c.name_bn.toLowerCase().includes(q)) ||
      (c.slug && c.slug.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-emerald-800" />
            <span>Product Categories (ক্যাটাগরি ম্যানেজমেন্ট)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ক্যাটাগরিতে নাম অথবা ছবি (বা উভয়ই) দিতে পারবেন, কোনো আইকন লাগবে না। নেভিগেশন ও ফিল্টারের জন্য ক্যাটাগরি সাজান।
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-[#E25C1D] hover:bg-[#c94f17] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category (নতুন ক্যাটাগরি)</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Categories
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {categories.length}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Active in Store
          </span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {categories.filter((c) => c.status === 'active').length}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Homepage Featured
          </span>
          <span className="text-2xl font-black text-[#E25C1D] mt-1 block">
            {categories.filter((c) => c.is_featured).length}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Catalog Products
          </span>
          <span className="text-2xl font-black text-indigo-700 mt-1 block">
            {products.length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium self-end sm:self-center">
          Showing {filteredCategories.length} of {categories.length} categories
        </div>
      </div>

      {/* CATEGORIES TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">ছবি (Category Image)</th>
                <th className="p-3.5">ক্যাটাগরির নাম (Name)</th>
                <th className="p-3.5">Slug / URL Key</th>
                <th className="p-3.5 text-center">Products Count</th>
                <th className="p-3.5 text-center">Home Slider</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    কোনো ক্যাটাগরি পাওয়া যায়নি (No categories found).
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                  const count = products.filter((p) => p.category_id === cat.id).length;
                  return (
                    <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                      {/* Image Thumbnail */}
                      <td className="p-3.5">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name || 'Category'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-black text-sm uppercase">
                              {(cat.name || cat.slug || 'C').slice(0, 2)}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Name (Optional support: shows name or image-only indicator) */}
                      <td className="p-3.5">
                        {cat.name ? (
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{cat.name}</p>
                            {cat.name_bn && (
                              <p className="text-[11px] text-slate-500">{cat.name_bn}</p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="italic text-slate-400 font-medium">Image Only Category</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                              শুধু ছবি
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Slug */}
                      <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                        {cat.slug}
                      </td>

                      {/* Count */}
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          {count} items
                        </span>
                      </td>

                      {/* Featured */}
                      <td className="p-3.5 text-center">
                        {cat.is_featured ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Featured
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Normal</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            cat.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {cat.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setCategoryToDelete(cat)}
                          className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT CATEGORY MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="bg-[#0D3823] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300">
                  <FolderTree className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-base">
                  {editingCategory ? `Edit Category: ${editingCategory.name || editingCategory.slug}` : 'Add New Category (নতুন ক্যাটাগরি)'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 text-xs max-h-[85vh] overflow-y-auto">
              {/* Informative Guidance */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                💡 <strong>ক্যাটাগরি নিয়ম:</strong> ক্যাটাগরিতে নাম অথবা ছবি (বা উভয়ই) দিতে পারবেন। যেকোনো একটি দেওয়া বাধ্যতামূলক। কোনো আইকন প্রয়োজন নেই।
              </div>

              {/* Mode indicator badge */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">বর্তমান ফরম্যাট:</span>
                {name.trim() && image.trim() ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    ✓ ছবি এবং নাম উভয়ই (Image & Name)
                  </span>
                ) : image.trim() ? (
                  <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold text-[10px]">
                    ✓ শুধু ছবি (Image Only)
                  </span>
                ) : name.trim() ? (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">
                    ✓ শুধু নাম (Text Only)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px]">
                    ! অন্তত নাম অথবা ছবি দিন
                  </span>
                )}
              </div>

              {/* 1. Category Name Fields (Optional if image provided) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Category Name (English) <span className="text-slate-400 font-normal">{image ? '(ঐচ্ছিক)' : '(বাধ্যতামূলক যদি ছবি না থাকে)'}</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleGenerateSlug(e.target.value)}
                    placeholder="e.g. Mustard Oil"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-[#E25C1D] outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    ক্যাটাগরির নাম (বাংলায় - ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    placeholder="যেমন: সরিষার তেল"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-[#E25C1D] outline-none"
                  />
                </div>
              </div>

              {/* 2. Category Image Section (Optional if name provided) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 block">
                    Category Image (ক্যাটাগরি ছবি) <span className="text-slate-400 font-normal">{name ? '(ঐচ্ছিক)' : '(বাধ্যতামূলক যদি নাম না থাকে)'}</span>
                  </label>
                  {image && (
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
                    >
                      ছবি সরান (Remove Image)
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-200 bg-white shrink-0 flex items-center justify-center shadow-xs">
                    {image ? (
                      <img src={image} alt="Category preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 p-1 text-center">
                        <ImageIcon className="w-5 h-5 mb-0.5 text-slate-300" />
                        <span className="text-[9px]">No Image</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://... image URL or upload file"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload File</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageFileUpload(e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Slug and Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Slug / URL Key *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="mustard-oil"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:border-[#E25C1D] outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Sort Display Order
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:border-[#E25C1D] outline-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-[#E25C1D]"
                  />
                  <span>Show in Homepage Category Slider</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Status:</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                    className="px-2 py-1 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingCategory ? 'Update Category' : 'Save Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4 border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">
                  Delete Category: {categoryToDelete.name || categoryToDelete.slug}?
                </h4>
                <p className="text-xs text-slate-500">
                  Are you sure you want to permanently delete this category?
                </p>
              </div>
            </div>

            {/* Check linked products */}
            {(() => {
              const linkedCount = products.filter((p) => p.category_id === categoryToDelete.id).length;
              return linkedCount > 0 ? (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs">
                  <p className="font-bold">⚠️ Warning: {linkedCount} products belong to this category!</p>
                  <p className="text-[11px] mt-0.5">
                    Deleting this category will remove it from navigation filters. Products will remain in database but won't be in this category.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-600">
                  This category has 0 products linked. It is safe to delete.
                </p>
              );
            })()}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 border rounded-xl text-slate-600 font-semibold hover:bg-slate-50 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Category</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
