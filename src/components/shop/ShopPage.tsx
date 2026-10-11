import React, { useState, useMemo } from 'react';
import { Product, Category, Brand } from '../../types/ecommerce';
import { ProductCard } from '../product/ProductCard';
import { Minus, Plus, ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { storage } from '../../services/storage';

interface ShopPageProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  initialCategorySlug?: string;
  initialSearchQuery?: string;
  onProductClick: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  categories,
  brands,
  initialCategorySlug,
  initialSearchQuery,
  onProductClick,
  onQuickView,
  onBuyNow,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategorySlug || 'all');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState<number>(4500);
  const [sortBy, setSortBy] = useState<string>('default');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery || '');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Collapsible sidebar accordion sections
  const [priceCollapsed, setPriceCollapsed] = useState(false);
  const [brandsCollapsed, setBrandsCollapsed] = useState(false);
  const [flagCollapsed, setFlagCollapsed] = useState(false);

  const ITEMS_PER_PAGE = 16;

  // Toggle brand checkbox
  const toggleBrand = (brandName: string) => {
    setSelectedBrands(prev =>
      prev.includes(brandName) ? prev.filter(b => b !== brandName) : [...prev, brandName]
    );
    setCurrentPage(1);
  };

  // Toggle flag checkbox
  const toggleFlag = (flag: string) => {
    setSelectedFlags(prev =>
      prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]
    );
    setCurrentPage(1);
  };

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matches =
            p.name.toLowerCase().includes(q) ||
            p.name_bn.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q));
          if (!matches) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && selectedCategory !== 'offer-zone') {
          const cat = categories.find((c) => c.slug === selectedCategory);
          if (cat && p.category_id !== cat.id) return false;
        }

        // Brand filter
        if (selectedBrands.length > 0) {
          const matchBrand = selectedBrands.some(
            b => p.brand_name?.toLowerCase().includes(b.toLowerCase()) ||
                 p.name.toLowerCase().includes(b.toLowerCase())
          );
          if (!matchBrand) return false;
        }

        // Flags filter (Best Selling / Offered Items)
        if (selectedFlags.length > 0) {
          if (selectedFlags.includes('Best Selling') && !p.is_best_selling) return false;
          if (selectedFlags.includes('Offered Items') && p.discount_percent <= 0) return false;
        }

        // Price filter
        if (p.sale_price > priceMax) return false;

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price_low':
            return a.sale_price - b.sale_price;
          case 'price_high':
            return b.sale_price - a.sale_price;
          case 'rating':
            return b.rating - a.rating;
          case 'best_selling':
            return (b.is_best_selling ? 1 : 0) - (a.is_best_selling ? 1 : 0);
          default:
            return 0;
        }
      });
  }, [products, categories, selectedCategory, selectedBrands, selectedFlags, priceMax, sortBy, searchQuery]);

  // Pagination
  const totalResults = filteredProducts.length;
  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const pageTitle = selectedCategory === 'offer-zone'
    ? 'Offer Zone'
    : selectedCategory !== 'all'
    ? categories.find((c) => c.slug === selectedCategory)?.name || 'Offer Zone'
    : 'Offer Zone';

  return (
    <div className="bg-[#FAF9F7] min-h-screen py-5 sm:py-7">
      <div className="max-w-[1360px] mx-auto px-4">
        {/* Top Header & Breadcrumbs matching screenshot */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/80">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {pageTitle}
          </h1>

          <div className="text-xs text-slate-500 font-medium">
            <span className="hover:text-emerald-800 cursor-pointer">Home</span>
            <span className="mx-1.5 text-slate-400">&gt;</span>
            <span className="text-[#E25C1D]">{pageTitle}</span>
          </div>
        </div>

        {/* Mobile Filter Trigger Button */}
        <div className="lg:hidden flex items-center justify-between gap-3 mb-4 bg-white p-3 rounded-xl border border-slate-200">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-800"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#E25C1D]" />
            <span>Filters ({selectedBrands.length + selectedFlags.length > 0 ? selectedBrands.length + selectedFlags.length : 'All'})</span>
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white outline-none"
          >
            <option value="default">Default Sorting</option>
            <option value="best_selling">Best Selling</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>

        {/* 2-Column Content: Sidebar (Left) + Products (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT SIDEBAR (Desktop) */}
          <div className="hidden lg:block lg:col-span-3 space-y-4">
            {/* 1. PRICE RANGE */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4">
              <div
                onClick={() => setPriceCollapsed(!priceCollapsed)}
                className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-slate-100"
              >
                <h3 className="text-xs font-bold tracking-wider text-slate-800 uppercase">
                  PRICE RANGE
                </h3>
                <button className="text-slate-500 hover:text-slate-800">
                  {priceCollapsed ? <Plus className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                </button>
              </div>

              {!priceCollapsed && (
                <div className="pt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>৳ 0</span>
                    <span className="text-[#E25C1D] font-bold">৳ {priceMax.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4500"
                    step="50"
                    value={priceMax}
                    onChange={(e) => {
                      setPriceMax(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#E25C1D]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Min: ৳0</span>
                    <span>Max: ৳4,500</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. BRANDS */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4">
              <div
                onClick={() => setBrandsCollapsed(!brandsCollapsed)}
                className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-slate-100"
              >
                <h3 className="text-xs font-bold tracking-wider text-slate-800 uppercase">
                  BRANDS
                </h3>
                <button className="text-slate-500 hover:text-slate-800">
                  {brandsCollapsed ? <Plus className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                </button>
              </div>

              {!brandsCollapsed && (
                <div className="pt-3 space-y-2.5">
                  {['GhorerBazar', 'Honeyraj', 'Khejuri', 'Shosti food'].map((brandName) => {
                    const isChecked = selectedBrands.includes(brandName);
                    return (
                      <label
                        key={brandName}
                        className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none hover:text-slate-900"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBrand(brandName)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-[#E25C1D] focus:ring-[#E25C1D] accent-[#E25C1D]"
                        />
                        <span>{brandName}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. PRODUCT FLAG */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4">
              <div
                onClick={() => setFlagCollapsed(!flagCollapsed)}
                className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-slate-100"
              >
                <h3 className="text-xs font-bold tracking-wider text-slate-800 uppercase">
                  PRODUCT FLAG
                </h3>
                <button className="text-slate-500 hover:text-slate-800">
                  {flagCollapsed ? <Plus className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                </button>
              </div>

              {!flagCollapsed && (
                <div className="pt-3 space-y-2.5">
                  {['Best Selling', 'Offered Items'].map((flag) => {
                    const isChecked = selectedFlags.includes(flag);
                    return (
                      <label
                        key={flag}
                        className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none hover:text-slate-900"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFlag(flag)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-[#E25C1D] focus:ring-[#E25C1D] accent-[#E25C1D]"
                        />
                        <span>{flag}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* MAIN PRODUCT AREA (Right - 9 Columns) */}
          <div className="lg:col-span-9 space-y-5">
            {/* Top Sort Bar */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-3 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Sort By :</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-8 px-2.5 rounded border border-slate-200 text-xs font-medium text-slate-800 bg-white outline-none focus:border-[#E25C1D]"
                >
                  <option value="default">Default Sorting</option>
                  <option value="best_selling">Best Selling</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              <div className="text-xs text-slate-500 hidden sm:block">
                Showing {Math.min(startIndex + 1, totalResults)} - {Math.min(startIndex + ITEMS_PER_PAGE, totalResults)} of {totalResults} results
              </div>
            </div>

            {/* Product Grid - 4 Columns matching screenshot */}
            {paginatedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <div className="text-3xl">🔍</div>
                <h3 className="font-bold text-slate-800 text-sm">No products found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting the price slider or resetting brand filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedBrands([]);
                    setSelectedFlags([]);
                    setPriceMax(4500);
                    setSelectedCategory('all');
                  }}
                  className="px-4 py-2 bg-[#E25C1D] text-white text-xs font-semibold rounded-lg"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className={`grid ${
                storage.getSettings().responsive_design?.product_cols_phone === 1 ? 'grid-cols-1' : 'grid-cols-2'
              } sm:grid-cols-2 ${
                storage.getSettings().responsive_design?.product_cols_tab === 2 ? 'md:grid-cols-2' : storage.getSettings().responsive_design?.product_cols_tab === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'
              } ${
                storage.getSettings().responsive_design?.product_cols_pc === 3 ? 'lg:grid-cols-3' : storage.getSettings().responsive_design?.product_cols_pc === 5 ? 'lg:grid-cols-5' : storage.getSettings().responsive_design?.product_cols_pc === 6 ? 'lg:grid-cols-6' : 'lg:grid-cols-4'
              } gap-3 sm:gap-4`}>
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onProductClick={onProductClick}
                    onQuickView={onQuickView}
                    onBuyNow={onBuyNow}
                  />
                ))}
              </div>
            )}

            {/* Pagination (< 1 2 >) matching screenshot */}
            {totalPages > 1 && (
              <div className="pt-6 pb-2 flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 rounded border border-slate-200 bg-white text-slate-600 hover:border-slate-400 disabled:opacity-40 flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded border text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-[#E25C1D] text-white border-[#E25C1D]'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 rounded border border-slate-200 bg-white text-slate-600 hover:border-slate-400 disabled:opacity-40 flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-500">
                  Showing {Math.min(startIndex + 1, totalResults)} - {Math.min(startIndex + ITEMS_PER_PAGE, totalResults)} of {totalResults} results
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl p-5 overflow-y-auto z-10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Price */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">Price Range</h4>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span>৳0</span>
                <span className="text-[#E25C1D]">৳{priceMax.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max="4500"
                step="50"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-[#E25C1D]"
              />
            </div>

            {/* Brands */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">Brands</h4>
              <div className="space-y-2">
                {['GhorerBazar', 'Honeyraj', 'Khejuri', 'Shosti food'].map((b) => (
                  <label key={b} className="flex items-center gap-2 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(b)}
                      onChange={() => toggleBrand(b)}
                      className="accent-[#E25C1D]"
                    />
                    <span>{b}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-2.5 bg-[#E25C1D] text-white text-xs font-bold rounded-lg"
            >
              Apply ({filteredProducts.length} Results)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
