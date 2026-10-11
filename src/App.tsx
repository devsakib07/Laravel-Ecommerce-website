import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { Product, Order } from './types/ecommerce';
import { applySeoMetadata } from './utils/seo';
import { pixelTracking } from './services/pixelTracking';

// Layout components
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { FloatingQuickCart } from './components/layout/FloatingQuickCart';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

// Home components
import { HeroBanner } from './components/home/HeroBanner';
import { FeaturedCategories } from './components/home/FeaturedCategories';
import { TopSellingSection } from './components/home/TopSellingSection';
import { BrandSlider } from './components/home/BrandSlider';
import { CategorySection } from './components/home/CategorySection';
import { MiddlePromoBanner } from './components/home/MiddlePromoBanner';
import { JustForYouSection } from './components/home/JustForYouSection';
import { TestimonialsSection } from './components/home/TestimonialsSection';

// Page components
import { ShopPage } from './components/shop/ShopPage';
import { ProductDetailsPage } from './components/product/ProductDetailsPage';
import { CartPage } from './components/cart/CartPage';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { OrderTrackingPage } from './components/order/OrderTrackingPage';
import { WishlistPage } from './components/wishlist/WishlistPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginPage } from './components/admin/AdminLoginPage';

// Modals
import { QuickViewModal } from './components/product/QuickViewModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { CustomerAccountModal } from './components/account/CustomerAccountModal';
import { OrderSuccessModal } from './components/order/OrderSuccessModal';
import { FlyingCartOverlay } from './components/cart/FlyingCartOverlay';

export default function App() {
  // Navigation state
  const [currentRoute, setCurrentRoute] = useState<'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'track-order' | 'wishlist' | 'admin'>('home');
  const [routeParam, setRouteParam] = useState<string>('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => storage.isAdminLoggedIn());

  // Selected item states
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Modals state
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Data cache
  const [products, setProducts] = useState<Product[]>(() => storage.getProducts());
  const [categories, setCategories] = useState(() => storage.getCategories());
  const [brands, setBrands] = useState(() => storage.getBrands());
  const [banners, setBanners] = useState(() => storage.getBanners());
  const [testimonials, setTestimonials] = useState(() => storage.getTestimonials());

  // Detect admin URL access from query string, hash, or path
  useEffect(() => {
    const checkRouteFromUrl = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      const path = window.location.pathname;

      if (
        searchParams.get('route') === 'admin' ||
        searchParams.has('admin') ||
        searchParams.has('admin-login') ||
        searchParams.get('login') === 'admin' ||
        hash === '#admin' ||
        hash === '#/admin' ||
        path === '/admin' ||
        path === '/admin-login'
      ) {
        setCurrentRoute('admin');
      }
    };

    checkRouteFromUrl();
    window.addEventListener('popstate', checkRouteFromUrl);

    // Sync admin login state
    const handleAdminAuth = () => {
      setIsAdminAuthenticated(storage.isAdminLoggedIn());
    };
    window.addEventListener('admin-auth-changed', handleAdminAuth);

    return () => {
      window.removeEventListener('popstate', checkRouteFromUrl);
      window.removeEventListener('admin-auth-changed', handleAdminAuth);
    };
  }, []);

  // Initialize SEO & Tracking on mount and listen for storage updates
  useEffect(() => {
    const initialSettings = storage.getSettings();
    if (initialSettings.seo_settings) {
      applySeoMetadata(initialSettings.seo_settings, initialSettings);
    }
    // Initialize Pixel & Server Tracking scripts
    pixelTracking.init();

    const handleSync = () => {
      setProducts(storage.getProducts());
      setCategories(storage.getCategories());
      setBrands(storage.getBrands());
      setBanners(storage.getBanners());
      setTestimonials(storage.getTestimonials());
      const updatedSettings = storage.getSettings();
      if (updatedSettings.seo_settings) {
        applySeoMetadata(updatedSettings.seo_settings, updatedSettings);
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('settings-updated', handleSync);
    window.addEventListener('categories-updated', handleSync);
    window.addEventListener('testimonials-updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('settings-updated', handleSync);
      window.removeEventListener('categories-updated', handleSync);
      window.removeEventListener('testimonials-updated', handleSync);
    };
  }, []);

  // Scroll to top and fire PageView / ViewContent on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (currentRoute !== 'admin') {
      let pageTitle = 'Home - ' + (storage.getSettings().website_name || 'Shuddho Bazar');
      let pageUrl = '/';
      if (currentRoute === 'shop') {
        pageTitle = routeParam ? `Shop - Category: ${routeParam}` : 'All Products Shop';
        pageUrl = `/shop${routeParam ? `?category=${routeParam}` : ''}`;
      } else if (currentRoute === 'product') {
        const prod = storage.getProductBySlug(selectedProductSlug);
        pageTitle = prod?.name || 'Product Details';
        pageUrl = `/product/${selectedProductSlug}`;
      } else if (currentRoute === 'checkout') {
        pageTitle = 'Checkout Page';
        pageUrl = '/checkout';
      } else if (currentRoute === 'track-order') {
        pageTitle = 'Order Tracking';
        pageUrl = '/track-order';
      } else if (currentRoute === 'wishlist') {
        pageTitle = 'Wishlist';
        pageUrl = '/wishlist';
      }

      pixelTracking.trackPageView(pageUrl, pageTitle);
    }

    if (currentRoute === 'checkout') {
      const cartItems = storage.getCart();
      const total = cartItems.reduce((s, i) => s + i.total_price, 0);
      const qty = cartItems.reduce((s, i) => s + i.quantity, 0);
      if (cartItems.length > 0) {
        pixelTracking.trackInitiateCheckout(cartItems, total, qty);
      }
    }
  }, [currentRoute, routeParam, selectedProductSlug]);

  const navigate = (route: string, param?: string) => {
    if (route === 'home') {
      setCurrentRoute('home');
      setRouteParam('');
      try {
        if (window.location.search.includes('admin')) {
          window.history.pushState(null, '', window.location.pathname);
        }
      } catch (_) {}
    } else if (route === 'shop') {
      setCurrentRoute('shop');
      setRouteParam(param || '');
    } else if (route === 'product') {
      setCurrentRoute('product');
      setSelectedProductSlug(param || '');
    } else if (route === 'cart') {
      setCurrentRoute('cart');
    } else if (route === 'checkout') {
      setCurrentRoute('checkout');
    } else if (route === 'track-order') {
      setCurrentRoute('track-order');
      setRouteParam(param || '');
    } else if (route === 'wishlist') {
      setCurrentRoute('wishlist');
    } else if (route === 'admin') {
      setCurrentRoute('admin');
      try {
        window.history.pushState(null, '', '?route=admin');
      } catch (_) {}
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProductSlug(product.slug);
    setCurrentRoute('product');
    pixelTracking.trackViewContent(product);
  };

  const handleBuyNow = (product: Product) => {
    // Already added to cart in child
    pixelTracking.trackAddToCart(product, 1);
    setCurrentRoute('checkout');
  };

  const handleOrderPlaced = (order: Order) => {
    setPlacedOrder(order);
    pixelTracking.trackPurchase(order);
  };

  // Extract query filters for Shop
  const initialCategorySlug = routeParam.startsWith('category=')
    ? routeParam.replace('category=', '')
    : undefined;
  const initialSearchQuery = routeParam.startsWith('search=')
    ? decodeURIComponent(routeParam.replace('search=', ''))
    : undefined;

  // Selected product object
  const activeProduct = selectedProductSlug
    ? products.find((p) => p.slug === selectedProductSlug || p.id === selectedProductSlug) || products[0]
    : products[0];

  // Specific category subsets matching reference screenshot
  const honeyProducts = products.filter((p) => p.category_id === 'cat-honey');
  const datesProducts = products.filter((p) => p.category_id === 'cat-dates');
  const cookingProducts = products.filter((p) => p.category_id === 'cat-spices' || p.category_id === 'cat-flours' || p.category_id === 'cat-oil-ghee');
  const organicProducts = products.filter((p) => p.category_id === 'cat-organic');

  if (currentRoute === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <AdminLoginPage
          onLoginSuccess={() => {
            setIsAdminAuthenticated(true);
          }}
          onBackToStorefront={() => navigate('home')}
        />
      );
    }
    return <AdminDashboard onExitAdmin={() => navigate('home')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1e293b]">
      {/* Site Header */}
      <Header
        onNavigate={navigate}
        onOpenCart={() => setIsCartDrawerOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        currentRoute={currentRoute}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16 md:pb-0">
        {/* ROUTE 1: HOMEPAGE */}
        {currentRoute === 'home' && (
          <div className="space-y-4">
            {/* 1. Main Hero Carousel & Promo Banner */}
            <HeroBanner banners={banners} onNavigate={navigate} />

            {/* 2. Featured Categories (Circular slider) */}
            <FeaturedCategories
              categories={categories}
              onSelectCategory={(slug) => navigate('shop', `category=${slug}`)}
            />

            {/* 3. Top Selling Products (4 large cards with Best Selling badge & Buy Now) */}
            <TopSellingSection
              products={products}
              onProductClick={handleProductClick}
              onQuickView={(p) => setQuickViewProduct(p)}
              onBuyNow={handleBuyNow}
            />

            {/* 4. Our Brands Section */}
            <BrandSlider
              brands={brands}
              onSelectBrand={(slug) => navigate('shop', slug ? `brand=${slug}` : '')}
            />

            {/* 5. All Natural Honey Section (5 cards + dots) */}
            <CategorySection
              title="All Natural Honey"
              subtitle="Directly sourced wild multifloral and single-origin raw honey"
              categorySlug="honey"
              products={honeyProducts}
              onProductClick={handleProductClick}
              onQuickView={(p) => setQuickViewProduct(p)}
              onBuyNow={handleBuyNow}
              onViewAll={(slug) => navigate('shop', `category=${slug}`)}
            />

            {/* 6. Premium Dates Section */}
            <CategorySection
              title="Premium Dates"
              subtitle="Directly imported premium Madinah Ajwa, Sukkari, and Egyptian Medjool"
              categorySlug="dates"
              products={datesProducts}
              onProductClick={handleProductClick}
              onQuickView={(p) => setQuickViewProduct(p)}
              onBuyNow={handleBuyNow}
              onViewAll={(slug) => navigate('shop', `category=${slug}`)}
            />

            {/* 7. Panoramic Promotional Banner (খাবারে স্বাদ এবং প্রশান্তি) */}
            <MiddlePromoBanner onNavigate={navigate} />

            {/* 8. Cooking Essentials Section */}
            <CategorySection
              title="Cooking Essentials"
              subtitle="Native sun-dried ground spices, artisanal gawa ghee, and wood-pressed oils"
              categorySlug="spices"
              products={cookingProducts}
              onProductClick={handleProductClick}
              onQuickView={(p) => setQuickViewProduct(p)}
              onBuyNow={handleBuyNow}
              onViewAll={(slug) => navigate('shop', `category=${slug}`)}
            />

            {/* 9. Organic Certified Section */}
            <CategorySection
              title="Organic Certified"
              subtitle="USDA & EU Certified virgin coconut oils, natural vinegars, and coconut sugar"
              categorySlug="organic"
              products={organicProducts}
              onProductClick={handleProductClick}
              onQuickView={(p) => setQuickViewProduct(p)}
              onBuyNow={handleBuyNow}
              onViewAll={(slug) => navigate('shop', `category=${slug}`)}
            />

            {/* 10. Just For You (5-Column Grid + Load More) */}
            <JustForYouSection
              products={products}
              onProductClick={handleProductClick}
              onQuickView={(p) => setQuickViewProduct(p)}
              onBuyNow={handleBuyNow}
              onViewAll={() => navigate('shop')}
            />

            {/* 11. Customer Testimonials */}
            <TestimonialsSection testimonials={testimonials} />
          </div>
        )}

        {/* ROUTE 2: SHOP PAGE */}
        {currentRoute === 'shop' && (
          <ShopPage
            products={products}
            categories={categories}
            brands={brands}
            initialCategorySlug={initialCategorySlug}
            initialSearchQuery={initialSearchQuery}
            onProductClick={handleProductClick}
            onQuickView={(p) => setQuickViewProduct(p)}
            onBuyNow={handleBuyNow}
          />
        )}

        {/* ROUTE 3: PRODUCT DETAILS PAGE */}
        {currentRoute === 'product' && (
          <ProductDetailsPage
            product={activeProduct}
            allProducts={products}
            onBack={() => navigate('shop')}
            onBuyNow={handleBuyNow}
            onSelectProduct={handleProductClick}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        )}

        {/* ROUTE 4: DEDICATED CART PAGE */}
        {currentRoute === 'cart' && (
          <CartPage
            onBackToShop={() => navigate('shop')}
            onProceedToCheckout={() => navigate('checkout')}
          />
        )}

        {/* ROUTE 5: CHECKOUT PAGE */}
        {currentRoute === 'checkout' && (
          <CheckoutPage
            onBack={() => navigate('cart')}
            onOrderPlaced={handleOrderPlaced}
            onOpenLoginModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* ROUTE 6: ORDER TRACKING PAGE */}
        {currentRoute === 'track-order' && (
          <OrderTrackingPage
            initialOrderNumber={routeParam}
            onBackToHome={() => navigate('home')}
          />
        )}

        {/* ROUTE 7: WISHLIST PAGE */}
        {currentRoute === 'wishlist' && (
          <WishlistPage
            allProducts={products}
            onBackToShop={() => navigate('shop')}
            onProductClick={handleProductClick}
            onQuickView={(p) => setQuickViewProduct(p)}
            onBuyNow={handleBuyNow}
          />
        )}
      </main>

      {/* Floating Sticky Quick Cart Pill & Quick Admin (Right side) */}
      <FloatingQuickCart
        onOpenCart={() => setIsCartDrawerOpen(true)}
        onNavigateAdmin={() => navigate('admin')}
      />

      {/* Site Footer */}
      <Footer onNavigate={navigate} />

      {/* Global Modals */}
      {/* 1. Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onBuyNow={handleBuyNow}
        onNavigateToProduct={(slug) => {
          setSelectedProductSlug(slug);
          setCurrentRoute('product');
        }}
      />

      {/* 2. Slide-Over Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        onCheckout={() => navigate('checkout')}
        onViewCartPage={() => navigate('cart')}
      />

      {/* 3. Customer Account / Auth Modal */}
      <CustomerAccountModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onTrackOrder={(orderNumber) => navigate('track-order', orderNumber)}
      />

      {/* 4. Order Confirmation Modal */}
      {placedOrder && (
        <OrderSuccessModal
          order={placedOrder}
          onClose={() => setPlacedOrder(null)}
          onTrackOrder={(orderNumber) => {
            setPlacedOrder(null);
            navigate('track-order', orderNumber);
          }}
          onContinueShopping={() => {
            setPlacedOrder(null);
            navigate('home');
          }}
        />
      )}

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentRoute={currentRoute}
        onNavigate={navigate}
        onOpenCart={() => setIsCartDrawerOpen(true)}
      />

      {/* Global Flying Product Animation Overlay */}
      <FlyingCartOverlay />
    </div>
  );
}
