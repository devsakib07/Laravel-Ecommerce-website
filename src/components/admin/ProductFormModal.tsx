import React, { useState, useRef } from 'react';
import { Product, ProductVariant, Category, Brand } from '../../types/ecommerce';
import { storage } from '../../services/storage';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  Save,
  Check,
  AlertCircle,
  HelpCircle,
  Image as ImageIcon,
  Star,
  CheckCircle2,
  Copy,
  ArrowRight,
  RefreshCw,
  FolderPlus,
  Link as LinkIcon,
  Sliders,
  DollarSign,
  Package
} from 'lucide-react';

interface ProductFormModalProps {
  product: Product | null;
  categories: Category[];
  brands: Brand[];
  currencySymbol: string;
  onClose: () => void;
  onSave: (product: Product) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  categories,
  brands,
  currencySymbol,
  onClose,
  onSave,
}) => {
  // Form fields
  const [name, setName] = useState(product?.name || '');
  const [nameBn, setNameBn] = useState(product?.name_bn || '');
  const [sku, setSku] = useState(product?.sku || `SKU-${Date.now().toString().slice(-5)}`);
  const [categoryId, setCategoryId] = useState(product?.category_id || categories[0]?.id || 'cat-honey');
  const [brandId, setBrandId] = useState(product?.brand_id || brands[0]?.id || 'brand-honeyraj');
  
  // Descriptions
  const [shortDescription, setShortDescription] = useState(product?.short_description || '');
  const [fullDescription, setFullDescription] = useState(product?.full_description || '');

  // Pricing & Inventory
  const [regularPrice, setRegularPrice] = useState<number>(product?.regular_price || 1000);
  const [salePrice, setSalePrice] = useState<number>(product?.sale_price || 850);
  const [stockQuantity, setStockQuantity] = useState<number>(product?.stock_quantity ?? 30);
  const [weight, setWeight] = useState(product?.weight || '500g');
  const [unit, setUnit] = useState(product?.unit || 'Jar');

  // Images
  const [image, setImage] = useState(product?.image || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=800&fit=crop');
  const [gallery, setGallery] = useState<string[]>(() => {
    if (product?.gallery && product.gallery.length > 0) return product.gallery;
    return product?.image ? [product.image] : ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=800&fit=crop'];
  });
  
  // Image UI helpers
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [showGalleryUrlInput, setShowGalleryUrlInput] = useState(false);
  const [customGalleryUrl, setCustomGalleryUrl] = useState('');
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);

  // Variations (WooCommerce Style)
  const [isVariableProduct, setIsVariableProduct] = useState<boolean>(() => {
    return (product?.variants && product.variants.length > 0) || false;
  });
  const [variants, setVariants] = useState<ProductVariant[]>(() => {
    return product?.variants && product.variants.length > 0 ? product.variants : [];
  });

  // Badges
  const [isFeatured, setIsFeatured] = useState<boolean>(Boolean(product?.is_featured));
  const [isBestSelling, setIsBestSelling] = useState<boolean>(Boolean(product?.is_best_selling));
  const [isNewArrival, setIsNewArrival] = useState<boolean>(Boolean(product?.is_new_arrival));

  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'images' | 'variants'>('basic');

  // File input refs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Auto calculate discount percentage
  const discountPercent = regularPrice > salePrice
    ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
    : 0;

  // Generate SKU helper
  const handleAutoGenerateSku = () => {
    const prefix = name ? name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'PRD') : 'PRD';
    setSku(`${prefix}-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  // -------------------------------------------------------------
  // IMAGE HANDLING (WooCommerce Inspired)
  // -------------------------------------------------------------

  // Handle Cover file upload
  const handleCoverFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
        if (!gallery.includes(reader.result)) {
          setGallery((prev) => [reader.result as string, ...prev]);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Multiple Gallery Files Upload
  const handleGalleryFilesUpload = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const res = reader.result;
          setGallery((prev) => {
            if (prev.includes(res)) return prev;
            return [...prev, res];
          });
          // If no main image exists, set first uploaded as main
          if (!image) {
            setImage(res);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Set any gallery photo as main cover
  const handleSetAsCover = (imgUrl: string) => {
    setImage(imgUrl);
  };

  // Remove gallery photo
  const handleRemoveGalleryImage = (index: number) => {
    const removedUrl = gallery[index];
    const updated = gallery.filter((_, i) => i !== index);
    setGallery(updated);
    // If the removed image was the cover, fallback to first available or empty
    if (image === removedUrl) {
      setImage(updated[0] || '');
    }
  };

  // -------------------------------------------------------------
  // VARIATION HANDLING (WooCommerce Inspired)
  // -------------------------------------------------------------

  // Add individual variant
  const handleAddSingleVariant = () => {
    setIsVariableProduct(true);
    const newVariant: ProductVariant = {
      id: `var-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sku: `${sku || 'SKU'}-V${variants.length + 1}`,
      attribute_name: 'Weight',
      attribute_value: variants.length === 0 ? '500g' : variants.length === 1 ? '1kg' : '2kg',
      price: salePrice,
      regular_price: regularPrice,
      stock_quantity: 20,
    };
    setVariants([...variants, newVariant]);
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, val: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: val };
    setVariants(updated);
  };

  const handleRemoveVariant = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);
    if (updated.length === 0) {
      setIsVariableProduct(false);
    }
  };

  // Quick 1-Click Variation Presets
  const applyPresetVariations = (type: 'weights_small' | 'weights_medium' | 'weights_large' | 'combos') => {
    setIsVariableProduct(true);
    let newVars: ProductVariant[] = [];
    const baseSku = sku || 'PRD';
    const basePrice = salePrice || 1000;
    const baseReg = regularPrice || Math.round(basePrice * 1.15);

    if (type === 'weights_small') {
      newVars = [
        {
          id: `var-${Date.now()}-1`,
          sku: `${baseSku}-250G`,
          attribute_name: 'Weight',
          attribute_value: '250g',
          price: Math.round(basePrice * 0.55),
          regular_price: Math.round(baseReg * 0.55),
          stock_quantity: 30,
        },
        {
          id: `var-${Date.now()}-2`,
          sku: `${baseSku}-500G`,
          attribute_name: 'Weight',
          attribute_value: '500g',
          price: basePrice,
          regular_price: baseReg,
          stock_quantity: 25,
        },
        {
          id: `var-${Date.now()}-3`,
          sku: `${baseSku}-1KG`,
          attribute_name: 'Weight',
          attribute_value: '1kg',
          price: Math.round(basePrice * 1.85),
          regular_price: Math.round(baseReg * 1.85),
          stock_quantity: 15,
        },
      ];
    } else if (type === 'weights_medium') {
      newVars = [
        {
          id: `var-${Date.now()}-1`,
          sku: `${baseSku}-500G`,
          attribute_name: 'Weight',
          attribute_value: '500g',
          price: basePrice,
          regular_price: baseReg,
          stock_quantity: 25,
        },
        {
          id: `var-${Date.now()}-2`,
          sku: `${baseSku}-1KG`,
          attribute_name: 'Weight',
          attribute_value: '1kg',
          price: Math.round(basePrice * 1.85),
          regular_price: Math.round(baseReg * 1.85),
          stock_quantity: 20,
        },
        {
          id: `var-${Date.now()}-3`,
          sku: `${baseSku}-2KG`,
          attribute_name: 'Weight',
          attribute_value: '2kg',
          price: Math.round(basePrice * 3.5),
          regular_price: Math.round(baseReg * 3.5),
          stock_quantity: 10,
        },
      ];
    } else if (type === 'weights_large') {
      newVars = [
        {
          id: `var-${Date.now()}-1`,
          sku: `${baseSku}-1KG`,
          attribute_name: 'Weight',
          attribute_value: '1kg',
          price: basePrice,
          regular_price: baseReg,
          stock_quantity: 20,
        },
        {
          id: `var-${Date.now()}-2`,
          sku: `${baseSku}-2KG`,
          attribute_name: 'Weight',
          attribute_value: '2kg',
          price: Math.round(basePrice * 1.9),
          regular_price: Math.round(baseReg * 1.9),
          stock_quantity: 15,
        },
        {
          id: `var-${Date.now()}-3`,
          sku: `${baseSku}-5KG`,
          attribute_name: 'Weight',
          attribute_value: '5kg',
          price: Math.round(basePrice * 4.6),
          regular_price: Math.round(baseReg * 4.6),
          stock_quantity: 8,
        },
      ];
    } else if (type === 'combos') {
      newVars = [
        {
          id: `var-${Date.now()}-1`,
          sku: `${baseSku}-1PC`,
          attribute_name: 'Pack',
          attribute_value: 'Single Jar (1x)',
          price: basePrice,
          regular_price: baseReg,
          stock_quantity: 30,
        },
        {
          id: `var-${Date.now()}-2`,
          sku: `${baseSku}-2PC-COMBO`,
          attribute_name: 'Pack',
          attribute_value: 'Twin Pack (2x Combo)',
          price: Math.round(basePrice * 2 * 0.95),
          regular_price: baseReg * 2,
          stock_quantity: 15,
        },
        {
          id: `var-${Date.now()}-3`,
          sku: `${baseSku}-3PC-FAMILY`,
          attribute_name: 'Pack',
          attribute_value: 'Family Pack (3x Save 10%)',
          price: Math.round(basePrice * 3 * 0.9),
          regular_price: baseReg * 3,
          stock_quantity: 10,
        },
      ];
    }
    setVariants(newVars);
  };

  // Bulk copy base price to all variants
  const handleCopyBasePriceToAll = () => {
    const updated = variants.map((v) => ({
      ...v,
      price: salePrice,
      regular_price: regularPrice,
    }));
    setVariants(updated);
  };

  // -------------------------------------------------------------
  // FORM SUBMISSION
  // -------------------------------------------------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !salePrice) {
      alert('Please provide at least a Product Name and Sale Price.');
      return;
    }

    const categoryObj = categories.find((c) => c.id === categoryId);
    const brandObj = brands.find((b) => b.id === brandId);

    const saved = storage.saveProduct({
      id: product ? product.id : undefined,
      name: name.trim(),
      name_bn: nameBn.trim() || name.trim(),
      sku: sku.trim(),
      category_id: categoryId,
      category_name: categoryObj?.name || categoryObj?.slug || 'Organic',
      brand_id: brandId,
      brand_name: brandObj?.name || 'Shuddho Pure',
      short_description: shortDescription.trim(),
      full_description: fullDescription.trim(),
      regular_price: Number(regularPrice),
      sale_price: Number(salePrice),
      discount_percent: discountPercent,
      stock_quantity: Number(stockQuantity),
      weight: weight.trim(),
      unit: unit.trim(),
      image: image || (gallery[0] || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=800&fit=crop'),
      gallery: gallery.length > 0 ? gallery : [image],
      variants: isVariableProduct ? variants : [],
      is_featured: isFeatured,
      is_best_selling: isBestSelling,
      is_new_arrival: isNewArrival,
    });

    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-[#0D3823] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-base">
              🌿
            </span>
            <div>
              <h3 className="text-base font-bold leading-tight">
                {product ? `Edit Product: ${product.name}` : 'Add New Organic Product'}
              </h3>
              <p className="text-[11px] text-emerald-200/80">
                Simple & logical WooCommerce-style management (Product Image, Gallery & Variations)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 border-b border-slate-200 px-6 pt-2 gap-2 text-xs font-bold text-slate-600 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'basic' ? 'border-[#E25C1D] text-[#E25C1D]' : 'border-transparent hover:text-slate-900'
            }`}
          >
            1. Basic Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'pricing' ? 'border-[#E25C1D] text-[#E25C1D]' : 'border-transparent hover:text-slate-900'
            }`}
          >
            2. Price & Stock ({currencySymbol}{salePrice})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('images')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'images' ? 'border-[#E25C1D] text-[#E25C1D]' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <span>3. Images & Media</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
              {gallery.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('variants')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'variants' ? 'border-[#E25C1D] text-[#E25C1D]' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <span>4. Variations</span>
            {isVariableProduct && variants.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-orange-100 text-[#E25C1D]">
                {variants.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Product Title (English) *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#E25C1D] outline-none"
                    placeholder="e.g. Sundarban Multifloral Raw Honey"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    প্রোডাক্টের নাম (বাংলায়)
                  </label>
                  <input
                    type="text"
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#E25C1D] outline-none"
                    placeholder="যেমন: সুন্দরবনের খাঁটি প্রাকৃতিক মধু"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name ? `${c.name} ${c.name_bn ? `(${c.name_bn})` : ''}` : c.slug}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Brand</label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">SKU Code</label>
                    <button
                      type="button"
                      onClick={handleAutoGenerateSku}
                      className="text-[10px] text-emerald-700 hover:underline flex items-center gap-0.5"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Auto</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                    placeholder="SKU-XXXX"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Short Description (Bullet points on product card)
                </label>
                <textarea
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none"
                  placeholder="100% pure raw unpasteurized honey harvested directly from the mangroves."
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Full Detailed Description
                </label>
                <textarea
                  rows={4}
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none"
                  placeholder="Detailed health benefits, lab test purity guarantee, usage instructions..."
                />
              </div>

              {/* Badges / Promotion Flags */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSelling}
                    onChange={(e) => setIsBestSelling(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span>Best Selling Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>New Arrival Flag</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & STOCK */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Regular Price ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={regularPrice}
                    onChange={(e) => setRegularPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono font-bold"
                    min="0"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Crossed-out original price</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Sale / Selling Price ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono font-bold text-emerald-800"
                    min="0"
                    required
                  />
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">
                    {discountPercent > 0 ? `Computed Discount: ${discountPercent}% OFF` : 'No discount'}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Initial Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono font-bold"
                    min="0"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {stockQuantity === 0 ? '🔴 Out of Stock' : stockQuantity <= 5 ? '🟡 Low Stock' : '🟢 Healthy Stock'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Default Pack / Unit Size
                  </label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                    placeholder="e.g. 500g, 1kg, 250ml, 5kg"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Packaging Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Jar">Jar (কাঁচের বয়াম)</option>
                    <option value="Bottle">Bottle (বোতল)</option>
                    <option value="Packet">Packet (প্যাকেট)</option>
                    <option value="Box">Box (বক্স)</option>
                    <option value="Piece">Piece (পিস)</option>
                    <option value="Bag">Bag (ব্যাগ)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IMAGES & MEDIA (WooCommerce Style: Product Image + Product Gallery) */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              
              {/* SECTION A: WOOCOMMERCE PRODUCT IMAGE (FEATURED IMAGE) */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-700" />
                      <span>Product Image (কভার ছবি / Featured Image)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      The main image displayed on product cards, catalog search, and thumbnail previews.
                    </p>
                  </div>
                  {image && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Cover Ready</span>
                    </span>
                  )}
                </div>

                {image ? (
                  /* Display Selected Image with WooCommerce style Replace/Remove controls */
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-3 bg-white rounded-xl border border-slate-200">
                    <div className="relative group w-36 h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-xs">
                      <img
                        src={image}
                        alt="Product Cover"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => coverInputRef.current?.click()}
                          className="px-2.5 py-1 rounded bg-white text-slate-800 text-[11px] font-bold hover:bg-slate-100 shadow-sm"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800 block">
                          Primary Product Display Photo
                        </span>
                        <p className="text-[11px] text-slate-500">
                          To change this image, upload a new photo, drag and drop, or choose another photo from the gallery below.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => coverInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Replace Image</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowUrlInput(!showUrlInput)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          <span>Paste URL</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setImage('')}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Optional URL Input */}
                      {showUrlInput && (
                        <div className="flex gap-2 pt-2 animate-in fade-in">
                          <input
                            type="text"
                            value={customCoverUrl}
                            onChange={(e) => setCustomCoverUrl(e.target.value)}
                            placeholder="https://... direct image link"
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customCoverUrl.trim()) {
                                setImage(customCoverUrl.trim());
                                if (!gallery.includes(customCoverUrl.trim())) {
                                  setGallery([customCoverUrl.trim(), ...gallery]);
                                }
                                setCustomCoverUrl('');
                                setShowUrlInput(false);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold"
                          >
                            Set
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* WooCommerce Style Click / Dropzone to Upload */
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingCover(true);
                    }}
                    onDragLeave={() => setIsDraggingCover(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingCover(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleCoverFileUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => coverInputRef.current?.click()}
                    className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      isDraggingCover
                        ? 'border-emerald-600 bg-emerald-50 scale-[1.01]'
                        : 'border-slate-300 hover:border-emerald-600 hover:bg-white bg-slate-50/50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Click to choose product image or drag & drop here
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      Supports JPG, PNG, WEBP (কভার ছবি সিলেক্ট বা ড্রপ করুন)
                    </span>
                  </div>
                )}

                {/* Hidden Input for Cover */}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleCoverFileUpload(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* SECTION B: WOOCOMMERCE PRODUCT GALLERY */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FolderPlus className="w-4 h-4 text-indigo-600" />
                      <span>Product Gallery (প্রোডাক্ট গ্যালারি ছবি)</span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 ml-1">
                        {gallery.length} Photos
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Upload multiple images at once to display a photo gallery for customers.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Gallery Images (Multi-select)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowGalleryUrlInput(!showGalleryUrlInput)}
                      className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600"
                      title="Paste image URL"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Optional Gallery URL input */}
                {showGalleryUrlInput && (
                  <div className="flex gap-2 p-3 bg-white rounded-xl border border-indigo-200 animate-in fade-in">
                    <input
                      type="text"
                      value={customGalleryUrl}
                      onChange={(e) => setCustomGalleryUrl(e.target.value)}
                      placeholder="Paste additional image URL here..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customGalleryUrl.trim()) {
                          setGallery([...gallery, customGalleryUrl.trim()]);
                          setCustomGalleryUrl('');
                          setShowGalleryUrlInput(false);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-700 text-white text-xs font-bold"
                    >
                      Add Photo
                    </button>
                  </div>
                )}

                {/* Hidden Multi-file Input */}
                <input
                  ref={galleryInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleGalleryFilesUpload(e.target.files);
                    }
                  }}
                />

                {/* Drag and Drop Zone for Gallery */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingGallery(true);
                  }}
                  onDragLeave={() => setIsDraggingGallery(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingGallery(false);
                    if (e.dataTransfer.files) {
                      handleGalleryFilesUpload(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => galleryInputRef.current?.click()}
                  className={`p-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-3 cursor-pointer transition-all ${
                    isDraggingGallery
                      ? 'border-indigo-600 bg-indigo-50/70'
                      : 'border-slate-300 hover:border-indigo-500 hover:bg-white bg-slate-50/70'
                  }`}
                >
                  <Upload className="w-5 h-5 text-indigo-600" />
                  <div className="text-left text-xs">
                    <span className="font-bold text-slate-800">
                      Drop multiple files here or click to browse
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Select 2, 4 or more photos simultaneously (একসাথে একাধিক ছবি আপলোড)
                    </span>
                  </div>
                </div>

                {/* Gallery Grid */}
                {gallery.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
                    {gallery.map((imgUrl, idx) => {
                      const isCover = imgUrl === image;
                      return (
                        <div
                          key={idx}
                          className={`relative group rounded-xl overflow-hidden border aspect-square bg-white shadow-xs transition-all ${
                            isCover ? 'ring-2 ring-emerald-600 border-emerald-500' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`gallery-${idx}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Cover Badge */}
                          {isCover && (
                            <span className="absolute top-1.5 left-1.5 bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span>Cover</span>
                            </span>
                          )}

                          {/* Hover Action Overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => handleSetAsCover(imgUrl)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Star className="w-3 h-3" />
                                <span>Set as Cover</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(idx)}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                    No gallery images added yet. Click above to add multiple angle shots.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PRODUCT VARIATIONS (WooCommerce Style: Simple vs Variable + 1-Click Presets) */}
          {activeTab === 'variants' && (
            <div className="space-y-5">
              
              {/* Product Type Switch (WooCommerce Standard) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-700" />
                    <span>Product Type (প্রোডাক্ট টাইপ)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Choose whether this is a single unit product or has multiple sizes/weights.
                  </p>
                </div>

                <div className="inline-flex p-1 bg-white border border-slate-200 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setIsVariableProduct(false);
                      setVariants([]);
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      !isVariableProduct
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Simple Product
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsVariableProduct(true);
                      if (variants.length === 0) {
                        applyPresetVariations('weights_small');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      isVariableProduct
                        ? 'bg-[#E25C1D] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Variable Product (ভ্যারিয়েশন)
                  </button>
                </div>
              </div>

              {/* If Simple Product is selected */}
              {!isVariableProduct ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-800">
                      Standard Single-Unit Product ({weight} {unit})
                    </h5>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      Customers will purchase this item as a single option at ৳{salePrice.toLocaleString()} with {stockQuantity} {unit}s in inventory.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsVariableProduct(true);
                        applyPresetVariations('weights_small');
                      }}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Enable Variations (বিভিন্ন সাইজ বা ওজন যোগ করুন)</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Variable Product Controls */
                <div className="space-y-4">
                  {/* 1-Click Quick Preset Buttons */}
                  <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>⚡ 1-Click Quick Pack Presets (এক ক্লিকে অপশন তৈরি করুন):</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => applyPresetVariations('weights_small')}
                        className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                      >
                        + 250g, 500g, 1kg
                      </button>

                      <button
                        type="button"
                        onClick={() => applyPresetVariations('weights_medium')}
                        className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                      >
                        + 500g, 1kg, 2kg
                      </button>

                      <button
                        type="button"
                        onClick={() => applyPresetVariations('weights_large')}
                        className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                      >
                        + 1kg, 2kg, 5kg
                      </button>

                      <button
                        type="button"
                        onClick={() => applyPresetVariations('combos')}
                        className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                      >
                        + Single, Twin Combo, Family Pack
                      </button>
                    </div>
                  </div>

                  {/* Variation Rows Header & Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-slate-800">
                      Configured Variations ({variants.length})
                    </span>

                    <div className="flex items-center gap-2">
                      {variants.length > 0 && (
                        <button
                          type="button"
                          onClick={handleCopyBasePriceToAll}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center gap-1"
                          title="Set all variation sale prices equal to base sale price"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Base Price (৳{salePrice}) to All</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleAddSingleVariant}
                        className="px-3 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Option</span>
                      </button>
                    </div>
                  </div>

                  {/* Variations Table / Cards */}
                  <div className="space-y-2.5">
                    {variants.map((v, index) => (
                      <div
                        key={v.id}
                        className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-xs"
                      >
                        {/* Option Tag / Value */}
                        <div className="sm:w-36 shrink-0">
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                            Pack / Size Name
                          </label>
                          <input
                            type="text"
                            value={v.attribute_value}
                            onChange={(e) => handleUpdateVariant(index, 'attribute_value', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-800 bg-slate-50/50 focus:bg-white focus:border-emerald-600 outline-none"
                            placeholder="e.g. 500g"
                            required
                          />
                        </div>

                        {/* Selling Price */}
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                            Sale Price ({currencySymbol}) *
                          </label>
                          <input
                            type="number"
                            value={v.price}
                            onChange={(e) => handleUpdateVariant(index, 'price', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-emerald-800 focus:border-emerald-600 outline-none"
                            min="0"
                            required
                          />
                        </div>

                        {/* Regular Price */}
                        <div className="w-28 shrink-0">
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                            Regular Price
                          </label>
                          <input
                            type="number"
                            value={v.regular_price || ''}
                            onChange={(e) => handleUpdateVariant(index, 'regular_price', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-slate-500 focus:border-emerald-600 outline-none"
                            placeholder="Optional"
                          />
                        </div>

                        {/* Stock Units */}
                        <div className="w-24 shrink-0">
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                            Stock Qty
                          </label>
                          <input
                            type="number"
                            value={v.stock_quantity}
                            onChange={(e) => handleUpdateVariant(index, 'stock_quantity', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono focus:border-emerald-600 outline-none"
                            min="0"
                          />
                        </div>

                        {/* Variant SKU */}
                        <div className="w-28 shrink-0">
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                            SKU
                          </label>
                          <input
                            type="text"
                            value={v.sku}
                            onChange={(e) => handleUpdateVariant(index, 'sku', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-mono text-[11px] text-slate-600 focus:border-emerald-600 outline-none"
                          />
                        </div>

                        {/* Delete Action */}
                        <div className="sm:self-end pb-0.5 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(index)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove variation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Save & Cancel */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0D3823] hover:bg-emerald-950 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>{product ? 'Update Product' : 'Save New Product'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
