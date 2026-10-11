import { Product, Category, Brand, CartItem, Order, Coupon, Review, Banner, Testimonial, SiteSettings, OrderStatus, TrackingEventLog, VisitorSession, VisitorPageStep, TrafficStats, AbandonedCart } from '../types/ecommerce';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BRANDS, INITIAL_COUPONS, INITIAL_BANNERS, INITIAL_TESTIMONIALS, INITIAL_SETTINGS } from '../data/initialData';

const KEYS = {
  PRODUCTS: 'shuddho_products_v1',
  CATEGORIES: 'shuddho_categories_v1',
  BRANDS: 'shuddho_brands_v1',
  CART: 'shuddho_cart_v1',
  WISHLIST: 'shuddho_wishlist_v1',
  ORDERS: 'shuddho_orders_v1',
  COUPONS: 'shuddho_coupons_v1',
  REVIEWS: 'shuddho_reviews_v1',
  BANNERS: 'shuddho_banners_v1',
  TESTIMONIALS: 'shuddho_testimonials_v1',
  SETTINGS: 'shuddho_settings_v1',
  USER_SESSION: 'shuddho_user_session_v1',
  ADMIN_CREDENTIALS: 'shuddho_admin_credentials_v1',
  ADMIN_SESSION: 'shuddho_admin_session_v1',
  TRACKING_LOGS: 'shuddho_tracking_logs_v1',
  VISITOR_SESSIONS: 'shuddho_visitor_sessions_v1',
  CURRENT_VISITOR_ID: 'shuddho_curr_visitor_id_v1',
  ABANDONED_CARTS: 'shuddho_abandoned_carts_v1',
  RECENTLY_VIEWED: 'shuddho_recently_viewed_v1',
  LOYALTY_POINTS: 'shuddho_loyalty_points_v1',
};

const SAMPLE_ABANDONED_CARTS: AbandonedCart[] = [
  {
    id: 'ab-cart-1',
    customer_name: 'Tanvir Hossain',
    customer_phone: '01712998877',
    customer_address: 'Mirpur DOHS, Dhaka',
    items: [
      {
        id: 'ab-item-1',
        product_id: 'prod-black-seed-honey-1kg',
        product: INITIAL_PRODUCTS[0],
        quantity: 2,
        unit_price: 1600,
        total_price: 3200,
      }
    ],
    cart_total: 3200,
    created_at: '25 mins ago',
    recovered: false,
    recovery_attempts: 0,
  },
  {
    id: 'ab-cart-2',
    customer_name: 'Farzana Akter',
    customer_phone: '01844556677',
    customer_address: 'Agrabad, Chattogram',
    items: [
      {
        id: 'ab-item-2',
        product_id: 'prod-gawa-ghee-1kg',
        product: INITIAL_PRODUCTS[1],
        quantity: 1,
        unit_price: 1990,
        total_price: 1990,
      }
    ],
    cart_total: 1990,
    created_at: '1 hour ago',
    recovered: false,
    recovery_attempts: 1,
    last_contacted_at: '30 mins ago',
  },
  {
    id: 'ab-cart-3',
    customer_name: 'Engr. Rakibul Islam',
    customer_phone: '01922334455',
    customer_address: 'Uttara Sector 11, Dhaka',
    items: [
      {
        id: 'ab-item-3',
        product_id: 'prod-ajwa-dates-1kg-large',
        product: INITIAL_PRODUCTS[2],
        quantity: 1,
        unit_price: 2500,
        total_price: 2500,
      }
    ],
    cart_total: 2500,
    created_at: '3 hours ago',
    recovered: true,
    recovery_attempts: 1,
    last_contacted_at: '2 hours ago',
  }
];

export interface AdminCredentials {
  userId: string;
  password: string;
  name?: string;
  lastLogin?: string;
}

const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  userId: 'admin',
  password: 'sakibweb07$',
  name: 'Store Super Admin',
};

// Seed sample orders for realistic demo analytics and order tracking
const SAMPLE_INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-sample-1',
    order_number: 'ORD-20260927-0001',
    customer_name: 'Mahmudur Rahman',
    customer_email: 'mahmud.bd@gmail.com',
    customer_phone: '01712345678',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Gulshan',
    full_address: 'House 42, Road 11, Block D, Banani, Dhaka-1213',
    notes: 'Please call before delivery.',
    items: [
      {
        product_id: 'prod-black-seed-honey-1kg',
        product_name: 'Black Seed Honey 1kg',
        product_image: '',
        variant_label: '1kg',
        quantity: 1,
        unit_price: 1600,
        total_price: 1600,
      },
      {
        product_id: 'prod-gawa-ghee-1kg',
        product_name: 'Gawa Ghee 1kg',
        product_image: '',
        variant_label: '1kg',
        quantity: 1,
        unit_price: 1990,
        total_price: 1990,
      }
    ],
    subtotal: 3590,
    discount: 150,
    coupon_code: 'SHUDDHO50',
    delivery_charge: 0, // Above free delivery threshold (৳2500)
    total: 3440,
    payment_method: 'cod',
    payment_status: 'pending',
    order_status: 'out_for_delivery',
    status_history: [
      { status: 'pending', note: 'Order placed via website checkout', timestamp: '2026-09-26 14:20:00' },
      { status: 'confirmed', note: 'Customer phone confirmed by sales agent', timestamp: '2026-09-26 14:45:00' },
      { status: 'processing', note: 'Order passed to Banani fulfillment hub', timestamp: '2026-09-26 16:00:00' },
      { status: 'packed', note: 'Items packed in eco-friendly protective carton', timestamp: '2026-09-26 18:30:00' },
      { status: 'shipped', note: 'Handed over to RedX Express Delivery', timestamp: '2026-09-27 08:00:00' },
      { status: 'out_for_delivery', note: 'Rider is on the way to delivery address', timestamp: '2026-09-27 10:15:00' },
    ],
    created_at: '2026-09-26T14:20:00.000Z',
    updated_at: '2026-09-27T10:15:00.000Z',
  },
  {
    id: 'ord-sample-2',
    order_number: 'ORD-20260927-0002',
    customer_name: 'Dr. Nusrat Jahan',
    customer_email: 'nusrat.jahan@dohs.org',
    customer_phone: '01899112233',
    division: 'Chattogram',
    district: 'Chattogram',
    upazila: 'Panchlaish',
    full_address: 'Flat 4B, Green Heritage, Nasirabad Housing Society, Chattogram',
    notes: '',
    items: [
      {
        product_id: 'prod-sundarban-honey-1kg',
        product_name: 'Sundarban Honey 1kg',
        product_image: '',
        variant_label: '1kg',
        quantity: 2,
        unit_price: 2500,
        total_price: 5000,
      }
    ],
    subtotal: 5000,
    discount: 500,
    coupon_code: 'EID2026',
    delivery_charge: 0,
    total: 4500,
    payment_method: 'bkash',
    payment_status: 'paid',
    payment_transaction_id: 'BKS908234KL1',
    order_status: 'delivered',
    status_history: [
      { status: 'pending', note: 'Order placed with bKash digital payment', timestamp: '2026-09-25 10:00:00' },
      { status: 'confirmed', note: 'bKash Transaction verified', timestamp: '2026-09-25 10:05:00' },
      { status: 'packed', note: 'Packed with bubble wrap for transit', timestamp: '2026-09-25 13:00:00' },
      { status: 'shipped', note: 'Dispatched via Sundarban Courier', timestamp: '2026-09-25 17:00:00' },
      { status: 'delivered', note: 'Delivered successfully to customer', timestamp: '2026-09-26 15:30:00' },
    ],
    created_at: '2026-09-25T10:00:00.000Z',
    updated_at: '2026-09-26T15:30:00.000Z',
  },
  {
    id: 'ord-sample-3',
    order_number: 'ORD-20260927-0003',
    customer_name: 'Anisul Islam',
    customer_email: 'anisul.dev@gmail.com',
    customer_phone: '01911445566',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Dhanmondi',
    full_address: 'House 14, Road 8/A, Dhanmondi R/A, Dhaka',
    notes: 'Leave at guard room if I am in meeting',
    items: [
      {
        product_id: 'prod-ajwa-dates-1kg-large',
        product_name: 'Ajwa Premium Fresh Dates 1kg (Large)',
        product_image: '',
        variant_label: '1kg',
        quantity: 1,
        unit_price: 2500,
        total_price: 2500,
      }
    ],
    subtotal: 2500,
    discount: 0,
    delivery_charge: 0,
    total: 2500,
    payment_method: 'cod',
    payment_status: 'pending',
    order_status: 'confirmed',
    status_history: [
      { status: 'pending', note: 'Order placed by customer', timestamp: '2026-09-27 09:30:00' },
      { status: 'confirmed', note: 'Inventory reserved', timestamp: '2026-09-27 09:40:00' },
    ],
    created_at: '2026-09-27T09:30:00.000Z',
    updated_at: '2026-09-27T09:40:00.000Z',
  }
];

const SAMPLE_VISITOR_SESSIONS: VisitorSession[] = [
  {
    id: 'vis-live-1',
    visitor_name: 'Visitor #9482',
    location: 'Banani, Dhaka',
    device_type: 'mobile',
    browser: 'Chrome 128 / Android 14',
    traffic_source: 'Facebook Ads (Meta Pixel)',
    ip_address: '103.205.71.45',
    start_time: '10:48 AM',
    last_active: 'Just now',
    is_online: true,
    page_views_count: 5,
    current_page: '/checkout',
    page_history: [
      { page: '/', title: 'Home - Shuddho Bazar', timestamp: '10:48 AM', pixel_event: 'PageView' },
      { page: '/shop?category=honey', title: 'Pure Honey Collection', timestamp: '10:49 AM', pixel_event: 'PageView' },
      { page: '/product/sundarban-wild-honey-1kg', title: 'Sundarban Raw Wild Honey 1kg', timestamp: '10:50 AM', action: 'Viewed Product', pixel_event: 'ViewContent' },
      { page: '/product/sundarban-wild-honey-1kg', title: 'Sundarban Raw Wild Honey 1kg', timestamp: '10:51 AM', action: 'Clicked "Buy Now" (৳1,450)', pixel_event: 'AddToCart' },
      { page: '/checkout', title: 'Checkout & Shipping Address', timestamp: '10:52 AM', action: 'Entered Checkout Form', pixel_event: 'InitiateCheckout' },
    ],
    cart_total: 1450,
  },
  {
    id: 'vis-live-2',
    visitor_name: 'Visitor #9481',
    location: 'Dhanmondi, Dhaka',
    device_type: 'mobile',
    browser: 'Safari 17 / iPhone iOS',
    traffic_source: 'Facebook Ads (Meta Pixel)',
    ip_address: '103.114.98.12',
    start_time: '10:45 AM',
    last_active: '1 min ago',
    is_online: true,
    page_views_count: 3,
    current_page: '/product/gawa-ghee-1kg',
    page_history: [
      { page: '/', title: 'Home - Organic Pure Food', timestamp: '10:45 AM', pixel_event: 'PageView' },
      { page: '/shop?category=oil-and-ghee', title: 'Oil & Ghee Category', timestamp: '10:46 AM', pixel_event: 'PageView' },
      { page: '/product/gawa-ghee-1kg', title: 'Traditional Gawa Ghee 1kg', timestamp: '10:47 AM', action: 'Added to Cart (৳1,990)', pixel_event: 'AddToCart' },
    ],
    cart_total: 1990,
  },
  {
    id: 'vis-live-3',
    visitor_name: 'Visitor #9479',
    location: 'Nasirabad, Chittagong',
    device_type: 'desktop',
    browser: 'Chrome 129 / Windows 11',
    traffic_source: 'Google Organic',
    ip_address: '182.160.118.230',
    start_time: '10:40 AM',
    last_active: '3 mins ago',
    is_online: true,
    page_views_count: 4,
    current_page: '/shop?category=dates',
    page_history: [
      { page: '/shop', title: 'All Products Catalog', timestamp: '10:40 AM', pixel_event: 'PageView' },
      { page: '/shop?category=dates', title: 'Premium Dates Collection', timestamp: '10:42 AM', pixel_event: 'PageView' },
      { page: '/product/ajwa-premium-fresh-dates-1kg-large', title: 'Ajwa Fresh Dates 1kg', timestamp: '10:43 AM', action: 'Viewed Product', pixel_event: 'ViewContent' },
    ],
  },
  {
    id: 'vis-past-4',
    visitor_name: 'Visitor #9478',
    location: 'Zindabazar, Sylhet',
    device_type: 'mobile',
    browser: 'Chrome / Xiaomi Redmi',
    traffic_source: 'Facebook Ads (Meta Pixel)',
    ip_address: '103.220.100.89',
    start_time: '10:20 AM',
    last_active: '15 mins ago',
    is_online: false,
    page_views_count: 6,
    current_page: '/track-order',
    page_history: [
      { page: '/', title: 'Home', timestamp: '10:20 AM', pixel_event: 'PageView' },
      { page: '/product/black-seed-honey-1kg', title: 'Black Seed Honey', timestamp: '10:22 AM', action: 'Viewed Product', pixel_event: 'ViewContent' },
      { page: '/checkout', title: 'Checkout Page', timestamp: '10:25 AM', action: 'InitiateCheckout', pixel_event: 'InitiateCheckout' },
      { page: '/track-order', title: 'Order Confirmed - #ORD-20261008-0042', timestamp: '10:28 AM', action: 'Order Placed (৳3,450)', pixel_event: 'Purchase' },
    ],
    purchased: true,
  },
  {
    id: 'vis-past-5',
    visitor_name: 'Visitor #9475',
    location: 'Uttara, Dhaka',
    device_type: 'mobile',
    browser: 'Vivo Browser / Android',
    traffic_source: 'WhatsApp / Social',
    ip_address: '103.145.12.77',
    start_time: '09:55 AM',
    last_active: '40 mins ago',
    is_online: false,
    page_views_count: 2,
    current_page: '/shop?category=spices',
    page_history: [
      { page: '/', title: 'Home', timestamp: '09:55 AM', pixel_event: 'PageView' },
      { page: '/shop?category=spices', title: 'Pahari Spices & Masala', timestamp: '09:57 AM', pixel_event: 'PageView' },
    ],
  },
  {
    id: 'vis-past-6',
    visitor_name: 'Visitor #9472',
    location: 'Rajshahi Sadar',
    device_type: 'tablet',
    browser: 'Safari / iPad OS',
    traffic_source: 'Direct / Website',
    ip_address: '118.179.88.5',
    start_time: '09:30 AM',
    last_active: '1 hr ago',
    is_online: false,
    page_views_count: 4,
    current_page: '/wishlist',
    page_history: [
      { page: '/', title: 'Home', timestamp: '09:30 AM', pixel_event: 'PageView' },
      { page: '/wishlist', title: 'My Wishlist (2 Items)', timestamp: '09:35 AM', pixel_event: 'PageView' },
    ],
  },
];

class StorageService {
  // Helpers
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage quota exceeded or disabled', e);
    }
  }

  // Initializer
  public init() {
    if (!localStorage.getItem(KEYS.PRODUCTS)) {
      this.setItem(KEYS.PRODUCTS, INITIAL_PRODUCTS);
    }
    if (!localStorage.getItem(KEYS.CATEGORIES)) {
      this.setItem(KEYS.CATEGORIES, INITIAL_CATEGORIES);
    }
    if (!localStorage.getItem(KEYS.BRANDS)) {
      this.setItem(KEYS.BRANDS, INITIAL_BRANDS);
    }
    if (!localStorage.getItem(KEYS.COUPONS)) {
      this.setItem(KEYS.COUPONS, INITIAL_COUPONS);
    }
    if (!localStorage.getItem(KEYS.BANNERS)) {
      this.setItem(KEYS.BANNERS, INITIAL_BANNERS);
    }
    if (!localStorage.getItem(KEYS.TESTIMONIALS)) {
      this.setItem(KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS);
    }
    if (!localStorage.getItem(KEYS.SETTINGS)) {
      this.setItem(KEYS.SETTINGS, INITIAL_SETTINGS);
    }
    if (!localStorage.getItem(KEYS.ORDERS)) {
      this.setItem(KEYS.ORDERS, SAMPLE_INITIAL_ORDERS);
    }
    // Update or initialize admin credentials to requested password sakibweb07$
    const existingCreds = this.getItem<AdminCredentials | null>(KEYS.ADMIN_CREDENTIALS, null);
    if (!existingCreds || existingCreds.password === 'admin1234') {
      this.setItem(KEYS.ADMIN_CREDENTIALS, {
        userId: existingCreds?.userId || 'admin',
        password: 'sakibweb07$',
        name: existingCreds?.name || 'Store Super Admin',
      });
    }
  }

  // SETTINGS
  public getSettings(): SiteSettings {
    const raw = this.getItem(KEYS.SETTINGS, INITIAL_SETTINGS);
    const rawMenuItems = raw.menu_items?.length ? raw.menu_items : INITIAL_SETTINGS.menu_items;
    const normalizedMenuItems = rawMenuItems?.map((item: any) => {
      const defaultItem = INITIAL_SETTINGS.menu_items?.find(m => m.id === item.id || m.slug === item.slug);
      const subItems = Array.isArray(item.sub_items)
        ? item.sub_items
        : (defaultItem?.sub_items || []);
      return {
        ...item,
        sub_items: subItems,
        hasDropdown: subItems.length > 0,
      };
    }) || INITIAL_SETTINGS.menu_items;

    // Deep merge to make sure new fields (menu_items, checkout_settings, seo_settings, responsive_design) exist
    return {
      ...INITIAL_SETTINGS,
      ...raw,
      menu_items: normalizedMenuItems,
      checkout_settings: {
        ...INITIAL_SETTINGS.checkout_settings!,
        ...(raw.checkout_settings || {}),
      },
      seo_settings: {
        ...INITIAL_SETTINGS.seo_settings!,
        ...(raw.seo_settings || {}),
      },
      responsive_design: {
        ...INITIAL_SETTINGS.responsive_design!,
        ...(raw.responsive_design || {}),
      },
      tracking_settings: {
        ...INITIAL_SETTINGS.tracking_settings!,
        ...(raw.tracking_settings || {}),
      },
      courier_settings: {
        ...INITIAL_SETTINGS.courier_settings!,
        ...(raw.courier_settings || {}),
      },
      sms_settings: {
        ...INITIAL_SETTINGS.sms_settings!,
        ...(raw.sms_settings || {}),
      },
      whatsapp_number: raw.whatsapp_number ?? INITIAL_SETTINGS.whatsapp_number,
      whatsapp_order_enabled: raw.whatsapp_order_enabled ?? INITIAL_SETTINGS.whatsapp_order_enabled,
      loyalty_enabled: raw.loyalty_enabled ?? INITIAL_SETTINGS.loyalty_enabled,
      bundle_offers_enabled: raw.bundle_offers_enabled ?? INITIAL_SETTINGS.bundle_offers_enabled,
      flash_sale_enabled: raw.flash_sale_enabled ?? INITIAL_SETTINGS.flash_sale_enabled,
      flash_sale_title: raw.flash_sale_title ?? INITIAL_SETTINGS.flash_sale_title,
      flash_sale_end_time: raw.flash_sale_end_time ?? INITIAL_SETTINGS.flash_sale_end_time,
    };
  }

  public updateSettings(settings: Partial<SiteSettings>): SiteSettings {
    const current = this.getSettings();
    const updated = {
      ...current,
      ...settings,
      checkout_settings: {
        ...current.checkout_settings!,
        ...(settings.checkout_settings || {}),
      },
      seo_settings: {
        ...current.seo_settings!,
        ...(settings.seo_settings || {}),
      },
      responsive_design: {
        ...current.responsive_design!,
        ...(settings.responsive_design || {}),
      },
      tracking_settings: {
        ...current.tracking_settings!,
        ...(settings.tracking_settings || {}),
      },
      courier_settings: {
        ...current.courier_settings!,
        ...(settings.courier_settings || {}),
      },
      sms_settings: {
        ...current.sms_settings!,
        ...(settings.sms_settings || {}),
      },
    };
    this.setItem(KEYS.SETTINGS, updated);
    window.dispatchEvent(new CustomEvent('settings-updated', { detail: updated }));
    return updated;
  }

  // TRACKING EVENT LOGS
  public getTrackingLogs(): TrackingEventLog[] {
    return this.getItem<TrackingEventLog[]>(KEYS.TRACKING_LOGS, []);
  }

  public logTrackingEvent(log: TrackingEventLog): void {
    const logs = this.getTrackingLogs();
    const updated = [log, ...logs].slice(0, 50); // Keep last 50 events
    this.setItem(KEYS.TRACKING_LOGS, updated);
    window.dispatchEvent(new CustomEvent('tracking-event-logged', { detail: log }));
  }

  public clearTrackingLogs(): void {
    this.setItem(KEYS.TRACKING_LOGS, []);
    window.dispatchEvent(new CustomEvent('tracking-logs-cleared'));
  }

  // VISITOR SESSIONS & TRAFFIC ANALYTICS
  public getVisitorSessions(): VisitorSession[] {
    return this.getItem<VisitorSession[]>(KEYS.VISITOR_SESSIONS, SAMPLE_VISITOR_SESSIONS);
  }

  public recordVisitorPageVisit(page: string, title: string, action?: string, pixelEvent?: string): void {
    if (typeof window === 'undefined') return;

    // Don't track admin dashboard as public visitor
    if (page.includes('admin') || page.includes('route=admin')) return;

    let currId = sessionStorage.getItem(KEYS.CURRENT_VISITOR_ID);
    if (!currId) {
      currId = `vis-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      sessionStorage.setItem(KEYS.CURRENT_VISITOR_ID, currId);
    }

    const sessions = this.getVisitorSessions();
    const existingIndex = sessions.findIndex(s => s.id === currId);

    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const newStep: VisitorPageStep = {
      page,
      title: title || 'Browsing Store',
      timestamp: nowTime,
      action: action || (page === '/' ? 'Home Visit' : `Visited ${title}`),
      pixel_event: pixelEvent || 'PageView',
    };

    if (existingIndex >= 0) {
      const existing = sessions[existingIndex];
      const updatedSession: VisitorSession = {
        ...existing,
        last_active: 'Just now',
        is_online: true,
        current_page: page,
        page_views_count: existing.page_views_count + 1,
        page_history: [newStep, ...existing.page_history].slice(0, 20),
      };
      sessions[existingIndex] = updatedSession;
      this.setItem(KEYS.VISITOR_SESSIONS, sessions);
    } else {
      // Determine device & browser
      const ua = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(ua);
      const device: 'mobile' | 'tablet' | 'desktop' = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

      const browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Safari') ? 'Safari' : ua.includes('Firefox') ? 'Firefox' : 'Browser';

      // Detect traffic source
      let source: VisitorSession['traffic_source'] = 'Direct / Website';
      const ref = document.referrer.toLowerCase();
      const url = window.location.href.toLowerCase();
      if (url.includes('fbclid') || ref.includes('facebook.com') || ref.includes('fb.com') || ref.includes('meta')) {
        source = 'Facebook Ads (Meta Pixel)';
      } else if (ref.includes('google.') || url.includes('gclid')) {
        source = 'Google Organic';
      } else if (ref.includes('whatsapp') || url.includes('wa.me')) {
        source = 'WhatsApp / Social';
      }

      const newSession: VisitorSession = {
        id: currId,
        visitor_name: `Visitor #${Math.floor(1000 + Math.random() * 9000)} (You)`,
        location: 'Dhaka, Bangladesh',
        device_type: device,
        browser: `${browser} / ${device.toUpperCase()}`,
        traffic_source: source,
        ip_address: '103.205.71.1',
        start_time: nowTime,
        last_active: 'Just now',
        is_online: true,
        page_views_count: 1,
        current_page: page,
        page_history: [newStep],
      };

      const updated = [newSession, ...sessions].slice(0, 50);
      this.setItem(KEYS.VISITOR_SESSIONS, updated);
    }

    window.dispatchEvent(new CustomEvent('visitor-sessions-updated'));
  }

  public clearVisitorSessions(): void {
    this.setItem(KEYS.VISITOR_SESSIONS, []);
    window.dispatchEvent(new CustomEvent('visitor-sessions-updated'));
  }

  public simulateLiveVisitor(): VisitorSession {
    const locations = [
      'Gulshan-2, Dhaka',
      'Mirpur-10, Dhaka',
      'Agrabad, Chittagong',
      'Zindabazar, Sylhet',
      'Uttara Sector 7, Dhaka',
      'Dhanmondi 27, Dhaka',
      'Rajshahi Sadar',
      'Khulna City',
      'Mohammadpur, Dhaka'
    ];
    const devices: ('mobile' | 'desktop' | 'tablet')[] = ['mobile', 'mobile', 'mobile', 'desktop', 'tablet'];
    const sources: VisitorSession['traffic_source'][] = [
      'Facebook Ads (Meta Pixel)',
      'Facebook Ads (Meta Pixel)',
      'Google Organic',
      'WhatsApp / Social',
      'Direct / Website'
    ];
    const browsers = [
      'Chrome 129 / Android 14',
      'Safari 17 / iOS 17.5',
      'Chrome 128 / Windows 11',
      'Samsung Internet / Galaxy S24',
      'Vivo Browser / Android 13'
    ];

    const pickLoc = locations[Math.floor(Math.random() * locations.length)];
    const pickDevice = devices[Math.floor(Math.random() * devices.length)];
    const pickSource = sources[Math.floor(Math.random() * sources.length)];
    const pickBrowser = browsers[Math.floor(Math.random() * browsers.length)];
    const idNum = Math.floor(1000 + Math.random() * 9000);
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const scenarios = [
      {
        currPage: '/checkout',
        cart: 1990,
        history: [
          { page: '/', title: 'Home - Organic Pure Food', timestamp: nowTime, pixel_event: 'PageView' },
          { page: '/shop?category=oil-and-ghee', title: 'Oil & Ghee Category', timestamp: nowTime, pixel_event: 'PageView' },
          { page: '/product/gawa-ghee-1kg', title: 'Traditional Gawa Ghee 1kg', timestamp: nowTime, action: 'Added to Cart (৳1,990)', pixel_event: 'AddToCart' },
          { page: '/checkout', title: 'Checkout Page', timestamp: nowTime, action: 'Entering Delivery Info', pixel_event: 'InitiateCheckout' },
        ]
      },
      {
        currPage: '/product/sundarban-wild-honey-1kg',
        cart: 1450,
        history: [
          { page: '/', title: 'Home', timestamp: nowTime, pixel_event: 'PageView' },
          { page: '/shop?category=honey', title: 'Pure Honey Collection', timestamp: nowTime, pixel_event: 'PageView' },
          { page: '/product/sundarban-wild-honey-1kg', title: 'Sundarban Raw Wild Honey 1kg', timestamp: nowTime, action: 'Viewing Product & Reviews', pixel_event: 'ViewContent' },
        ]
      },
      {
        currPage: '/shop?category=dates',
        history: [
          { page: '/shop', title: 'All Products Store', timestamp: nowTime, pixel_event: 'PageView' },
          { page: '/shop?category=dates', title: 'Ajwa & Amber Premium Dates', timestamp: nowTime, action: 'Browsing Dates', pixel_event: 'PageView' },
        ]
      },
      {
        currPage: '/track-order',
        cart: 2890,
        purchased: true,
        history: [
          { page: '/', title: 'Home', timestamp: nowTime, pixel_event: 'PageView' },
          { page: '/product/black-seed-honey-1kg', title: 'Black Seed Honey 1kg', timestamp: nowTime, pixel_event: 'ViewContent' },
          { page: '/checkout', title: 'Checkout Page', timestamp: nowTime, pixel_event: 'InitiateCheckout' },
          { page: '/track-order', title: 'Order Completed - #ORD-20261008-00' + idNum, timestamp: nowTime, action: 'Order Placed (৳2,890)', pixel_event: 'Purchase' },
        ]
      }
    ];

    const pickScenario = scenarios[Math.floor(Math.random() * scenarios.length)];

    const newSimSession: VisitorSession = {
      id: `vis-sim-${Date.now()}-${idNum}`,
      visitor_name: `Visitor #${idNum}`,
      location: pickLoc,
      device_type: pickDevice,
      browser: pickBrowser,
      traffic_source: pickSource,
      ip_address: `103.${Math.floor(100 + Math.random() * 150)}.${Math.floor(10 + Math.random() * 80)}.${Math.floor(1 + Math.random() * 250)}`,
      start_time: nowTime,
      last_active: 'Just now',
      is_online: true,
      page_views_count: pickScenario.history.length,
      current_page: pickScenario.currPage,
      page_history: pickScenario.history,
      cart_total: pickScenario.cart,
      purchased: pickScenario.purchased,
    };

    const currentSessions = this.getVisitorSessions();
    const updated = [newSimSession, ...currentSessions].slice(0, 50);
    this.setItem(KEYS.VISITOR_SESSIONS, updated);

    // Also trigger tracking event log for realistic Meta Pixel diagnostic
    this.logTrackingEvent({
      id: `sim-evt-${Date.now()}`,
      timestamp: nowTime,
      event_name: pickScenario.purchased ? 'Purchase' : pickScenario.cart ? 'AddToCart' : 'PageView',
      event_id: `evt_sim_${Date.now()}`,
      channels: pickSource.includes('Meta') ? ['browser_pixel', 'server_capi'] : ['browser_pixel'],
      status: 'sent',
      payload: {
        visitor: newSimSession.visitor_name,
        location: newSimSession.location,
        page: newSimSession.current_page,
      },
      response_summary: `Live visitor event dispatched from ${newSimSession.location}`,
    });

    window.dispatchEvent(new CustomEvent('visitor-sessions-updated'));
    return newSimSession;
  }

  public getTrafficStats(): TrafficStats {
    const sessions = this.getVisitorSessions();
    const liveOnline = sessions.filter(s => s.is_online || s.last_active === 'Just now' || s.last_active.includes('min')).length;
    const totalViews = sessions.reduce((s, vis) => s + (vis.page_views_count || 1), 0);
    const fbSessions = sessions.filter(s => s.traffic_source === 'Facebook Ads (Meta Pixel)').length;
    const fbPercent = sessions.length > 0 ? Math.round((fbSessions / sessions.length) * 100) : 65;

    // Device breakdown
    const mobile = sessions.filter(s => s.device_type === 'mobile').length;
    const desktop = sessions.filter(s => s.device_type === 'desktop').length;
    const tablet = sessions.filter(s => s.device_type === 'tablet').length;

    // Top pages
    const pageCounts: Record<string, { title: string; views: number; visitors: Set<string> }> = {};
    sessions.forEach(sess => {
      sess.page_history.forEach(step => {
        if (!pageCounts[step.page]) {
          pageCounts[step.page] = { title: step.title, views: 0, visitors: new Set() };
        }
        pageCounts[step.page].views += 1;
        pageCounts[step.page].visitors.add(sess.id);
      });
    });

    const topPages = Object.entries(pageCounts)
      .map(([path, data]) => ({
        path,
        title: data.title,
        views: data.views,
        visitors: data.visitors.size,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 6);

    return {
      total_visitors_today: Math.max(sessions.length, 18),
      total_pageviews_today: Math.max(totalViews, 84),
      live_active_visitors: Math.max(liveOnline, 3),
      facebook_pixel_traffic_percent: fbPercent,
      avg_session_duration: '3m 42s',
      top_pages: topPages.length > 0 ? topPages : [
        { path: '/', title: 'Home - Shuddho Bazar', views: 42, visitors: 18 },
        { path: '/shop?category=honey', title: 'Pure Honey Collection', views: 24, visitors: 12 },
        { path: '/product/gawa-ghee-1kg', title: 'Traditional Gawa Ghee 1kg', views: 19, visitors: 9 },
        { path: '/checkout', title: 'Checkout & Shipping Address', views: 11, visitors: 6 },
        { path: '/shop?category=dates', title: 'Ajwa & Amber Dates', views: 9, visitors: 5 },
      ],
      device_stats: { mobile: Math.max(mobile, 14), desktop: Math.max(desktop, 3), tablet: Math.max(tablet, 1) },
      source_stats: [
        { source: 'Facebook Ads (Meta Pixel)', count: Math.max(fbSessions, 12), percent: fbPercent },
        { source: 'Google Organic', count: 3, percent: 18 },
        { source: 'Direct / Website', count: 2, percent: 12 },
        { source: 'WhatsApp / Social', count: 1, percent: 5 },
      ],
    };
  }

  // PRODUCTS
  public getProducts(): Product[] {
    return this.getItem(KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  public getProductBySlug(slug: string): Product | undefined {
    const products = this.getProducts();
    return products.find(p => p.slug === slug || p.id === slug);
  }

  public getProductById(id: string): Product | undefined {
    const products = this.getProducts();
    return products.find(p => p.id === id);
  }

  public saveProduct(product: Partial<Product> & { name: string; sale_price: number }): Product {
    const products = this.getProducts();
    const id = product.id || `prod-${Date.now()}`;
    const slug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const existingIndex = products.findIndex(p => p.id === id);
    const newProduct: Product = {
      id,
      name: product.name,
      name_bn: product.name_bn || product.name,
      slug,
      sku: product.sku || `SKU-${Date.now().toString().slice(-4)}`,
      category_id: product.category_id || 'cat-honey',
      category_name: product.category_name,
      brand_id: product.brand_id,
      brand_name: product.brand_name,
      short_description: product.short_description || '',
      full_description: product.full_description || '',
      regular_price: Number(product.regular_price || product.sale_price),
      sale_price: Number(product.sale_price),
      discount_percent: product.regular_price && product.regular_price > product.sale_price
        ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)
        : 0,
      stock_quantity: Number(product.stock_quantity ?? 20),
      stock_status: (product.stock_quantity ?? 20) > 5 ? 'in_stock' : (product.stock_quantity ?? 20) > 0 ? 'low_stock' : 'out_of_stock',
      weight: product.weight || '500g',
      unit: product.unit || 'Jar',
      image: product.image || INITIAL_PRODUCTS[0].image,
      gallery: product.gallery?.length ? product.gallery : [product.image || INITIAL_PRODUCTS[0].image],
      tags: product.tags || ['organic', 'pure'],
      specifications: product.specifications || {},
      ingredients: product.ingredients,
      nutrition: product.nutrition,
      shipping_info: product.shipping_info,
      is_featured: Boolean(product.is_featured),
      is_best_selling: Boolean(product.is_best_selling),
      is_new_arrival: Boolean(product.is_new_arrival),
      is_recommended: Boolean(product.is_recommended),
      status: product.status || 'active',
      rating: product.rating || 5.0,
      reviews_count: product.reviews_count || 1,
      variants: product.variants || [],
    };

    if (existingIndex >= 0) {
      products[existingIndex] = newProduct;
    } else {
      products.unshift(newProduct);
    }
    this.setItem(KEYS.PRODUCTS, products);
    return newProduct;
  }

  public deleteProduct(id: string): void {
    const products = this.getProducts().filter(p => p.id !== id);
    this.setItem(KEYS.PRODUCTS, products);
  }

  // CATEGORIES
  public getCategories(): Category[] {
    return this.getItem(KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }

  public saveCategory(category: Partial<Category>): Category {
    const categories = this.getCategories();
    const id = category.id || `cat-${Date.now()}`;
    const name = (category.name || '').trim();
    const slug = category.slug?.trim() || (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : `cat-${Date.now().toString().slice(-5)}`);
    const existingIndex = categories.findIndex(c => c.id === id);

    // Calculate actual product count for this category
    const products = this.getProducts();
    const actualItemCount = products.filter(p => p.category_id === id).length;
    
    const newCategory: Category = {
      id,
      name: name,
      name_bn: (category.name_bn || name).trim(),
      slug,
      icon: category.icon || '',
      image: category.image !== undefined ? category.image : '',
      parent_id: category.parent_id || null,
      sort_order: category.sort_order || categories.length + 1,
      is_featured: category.is_featured !== undefined ? Boolean(category.is_featured) : true,
      status: category.status || 'active',
      item_count: actualItemCount || category.item_count || 0,
    };

    if (existingIndex >= 0) {
      categories[existingIndex] = newCategory;
    } else {
      categories.push(newCategory);
    }
    this.setItem(KEYS.CATEGORIES, categories);
    window.dispatchEvent(new CustomEvent('categories-updated', { detail: categories }));
    return newCategory;
  }

  public deleteCategory(id: string): boolean {
    const categories = this.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    if (filtered.length !== categories.length) {
      this.setItem(KEYS.CATEGORIES, filtered);
      window.dispatchEvent(new CustomEvent('categories-updated', { detail: filtered }));
      return true;
    }
    return false;
  }

  // BRANDS
  public getBrands(): Brand[] {
    return this.getItem(KEYS.BRANDS, INITIAL_BRANDS);
  }

  public saveBrand(brand: Partial<Brand> & { name: string }): Brand {
    const brands = this.getBrands();
    const id = brand.id || `brand-${Date.now()}`;
    const slug = brand.slug || brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existingIndex = brands.findIndex(b => b.id === id);
    
    const newBrand: Brand = {
      id,
      name: brand.name,
      slug,
      logo: brand.logo || brand.name,
      description: brand.description,
      status: brand.status || 'active',
    };

    if (existingIndex >= 0) {
      brands[existingIndex] = newBrand;
    } else {
      brands.push(newBrand);
    }
    this.setItem(KEYS.BRANDS, brands);
    return newBrand;
  }

  // BANNERS
  public getBanners(): Banner[] {
    return this.getItem(KEYS.BANNERS, INITIAL_BANNERS);
  }

  public saveBanner(banner: Partial<Banner> & { title: string; image_desktop: string }): Banner {
    const banners = this.getBanners();
    const id = banner.id || `banner-${Date.now()}`;
    const existingIndex = banners.findIndex(b => b.id === id);

    const newBanner: Banner = {
      id,
      title: banner.title,
      subtitle: banner.subtitle || '',
      image_desktop: banner.image_desktop,
      image_mobile: banner.image_mobile,
      button_text: banner.button_text || 'Shop Now',
      button_url: banner.button_url || '/shop',
      position: banner.position || 'hero_main',
      status: banner.status || 'active',
      sort_order: banner.sort_order || banners.length + 1,
    };

    if (existingIndex >= 0) {
      banners[existingIndex] = newBanner;
    } else {
      banners.push(newBanner);
    }
    this.setItem(KEYS.BANNERS, banners);
    window.dispatchEvent(new CustomEvent('banners-updated', { detail: banners }));
    return newBanner;
  }

  public deleteBanner(id: string): void {
    const banners = this.getBanners().filter(b => b.id !== id);
    this.setItem(KEYS.BANNERS, banners);
    window.dispatchEvent(new CustomEvent('banners-updated', { detail: banners }));
  }

  public updateAllBanners(banners: Banner[]): void {
    this.setItem(KEYS.BANNERS, banners);
    window.dispatchEvent(new CustomEvent('banners-updated', { detail: banners }));
  }

  // TESTIMONIALS
  public getTestimonials(): Testimonial[] {
    return this.getItem(KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS);
  }

  public saveTestimonial(testimonial: Partial<Testimonial> & { customer_name: string; comment: string }): Testimonial {
    const list = this.getTestimonials();
    const id = testimonial.id || `rev-${Date.now()}`;
    const existingIndex = list.findIndex(t => t.id === id);

    const record: Testimonial = {
      id,
      customer_name: testimonial.customer_name.trim(),
      customer_role: (testimonial.customer_role || 'Verified Customer').trim(),
      customer_photo: testimonial.customer_photo?.trim() || undefined,
      rating: Number(testimonial.rating) || 5,
      comment: testimonial.comment.trim(),
      comment_bn: testimonial.comment_bn?.trim() || testimonial.comment.trim(),
      status: testimonial.status || 'active',
      created_at: testimonial.created_at || (existingIndex >= 0 ? list[existingIndex].created_at : new Date().toISOString()),
    };

    let updatedList: Testimonial[];
    if (existingIndex >= 0) {
      updatedList = [...list];
      updatedList[existingIndex] = record;
    } else {
      updatedList = [record, ...list];
    }

    this.setItem(KEYS.TESTIMONIALS, updatedList);
    window.dispatchEvent(new CustomEvent('testimonials-updated', { detail: updatedList }));
    return record;
  }

  public deleteTestimonial(id: string): boolean {
    const list = this.getTestimonials();
    const updated = list.filter(t => t.id !== id);
    if (updated.length !== list.length) {
      this.setItem(KEYS.TESTIMONIALS, updated);
      window.dispatchEvent(new CustomEvent('testimonials-updated', { detail: updated }));
      return true;
    }
    return false;
  }

  public toggleTestimonialStatus(id: string): Testimonial | null {
    const list = this.getTestimonials();
    const target = list.find(t => t.id === id);
    if (!target) return null;

    const newStatus: 'active' | 'inactive' = target.status === 'active' ? 'inactive' : 'active';
    const updatedRecord: Testimonial = { ...target, status: newStatus };
    const updatedList = list.map(t => (t.id === id ? updatedRecord : t));

    this.setItem(KEYS.TESTIMONIALS, updatedList);
    window.dispatchEvent(new CustomEvent('testimonials-updated', { detail: updatedList }));
    return updatedRecord;
  }

  public updateAllTestimonials(testimonials: Testimonial[]): void {
    this.setItem(KEYS.TESTIMONIALS, testimonials);
    window.dispatchEvent(new CustomEvent('testimonials-updated', { detail: testimonials }));
  }

  // CART SYSTEM
  public getCart(): CartItem[] {
    return this.getItem(KEYS.CART, []);
  }

  public saveCart(cart: CartItem[]): void {
    this.setItem(KEYS.CART, cart);
    window.dispatchEvent(new Event('cart-updated'));
  }

  public addToCart(product: Product, quantity = 1, variantId?: string, variantLabel?: string): CartItem[] {
    const cart = this.getCart();
    const price = variantId && product.variants?.length
      ? (product.variants.find(v => v.id === variantId)?.price ?? product.sale_price)
      : product.sale_price;

    const cartKey = `${product.id}_${variantId || 'standard'}`;
    const existingIndex = cart.findIndex(item => item.id === cartKey);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
      cart[existingIndex].total_price = cart[existingIndex].quantity * cart[existingIndex].unit_price;
    } else {
      cart.push({
        id: cartKey,
        product_id: product.id,
        product,
        variant_id: variantId,
        variant_label: variantLabel,
        quantity,
        unit_price: price,
        total_price: price * quantity,
      });
    }

    this.saveCart(cart);
    return cart;
  }

  public updateCartQuantity(cartItemId: string, delta: number): CartItem[] {
    const cart = this.getCart();
    const index = cart.findIndex(item => item.id === cartItemId);
    if (index >= 0) {
      const newQty = cart[index].quantity + delta;
      if (newQty <= 0) {
        cart.splice(index, 1);
      } else {
        cart[index].quantity = newQty;
        cart[index].total_price = newQty * cart[index].unit_price;
      }
    }
    this.saveCart(cart);
    return cart;
  }

  public removeFromCart(cartItemId: string): CartItem[] {
    const cart = this.getCart().filter(item => item.id !== cartItemId);
    this.saveCart(cart);
    return cart;
  }

  public clearCart(): void {
    this.saveCart([]);
  }

  // WISHLIST SYSTEM
  public getWishlist(): string[] {
    return this.getItem(KEYS.WISHLIST, []);
  }

  public toggleWishlist(productId: string): boolean {
    const list = this.getWishlist();
    const index = list.indexOf(productId);
    let added = false;
    if (index >= 0) {
      list.splice(index, 1);
      added = false;
    } else {
      list.push(productId);
      added = true;
    }
    this.setItem(KEYS.WISHLIST, list);
    window.dispatchEvent(new Event('wishlist-updated'));
    return added;
  }

  public isInWishlist(productId: string): boolean {
    return this.getWishlist().includes(productId);
  }

  // COUPONS
  public getCoupons(): Coupon[] {
    return this.getItem(KEYS.COUPONS, INITIAL_COUPONS);
  }

  public validateCoupon(code: string, subtotal: number): { valid: boolean; coupon?: Coupon; discount: number; message: string } {
    const cleanCode = code.trim().toUpperCase();
    const coupons = this.getCoupons();
    const coupon = coupons.find(c => c.code.toUpperCase() === cleanCode && c.is_active);

    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid or inactive coupon code.' };
    }

    if (new Date(coupon.expiry_date) < new Date()) {
      return { valid: false, discount: 0, message: 'This coupon has expired.' };
    }

    if (subtotal < coupon.min_spend) {
      return { valid: false, discount: 0, message: `Minimum spend of ৳${coupon.min_spend} required for this coupon.` };
    }

    if (coupon.usage_count >= coupon.usage_limit) {
      return { valid: false, discount: 0, message: 'This coupon has reached its total usage limit.' };
    }

    let discount = 0;
    if (coupon.discount_type === 'percent') {
      discount = Math.round((subtotal * coupon.discount_amount) / 100);
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = coupon.discount_amount;
    }

    return { valid: true, coupon, discount, message: `Coupon ${coupon.code} applied successfully! You saved ৳${discount}.` };
  }

  public saveCoupon(coupon: Partial<Coupon> & { code: string; discount_amount: number }): Coupon {
    const coupons = this.getCoupons();
    const id = coupon.id || `cpn-${Date.now()}`;
    const existingIndex = coupons.findIndex(c => c.id === id);

    const newCoupon: Coupon = {
      id,
      code: coupon.code.toUpperCase().trim(),
      discount_type: coupon.discount_type || 'percent',
      discount_amount: Number(coupon.discount_amount),
      min_spend: Number(coupon.min_spend || 0),
      max_discount: coupon.max_discount ? Number(coupon.max_discount) : undefined,
      usage_limit: Number(coupon.usage_limit || 100),
      usage_count: coupon.usage_count || 0,
      expiry_date: coupon.expiry_date || '2026-12-31',
      is_active: coupon.is_active !== undefined ? coupon.is_active : true,
    };

    if (existingIndex >= 0) {
      coupons[existingIndex] = newCoupon;
    } else {
      coupons.push(newCoupon);
    }
    this.setItem(KEYS.COUPONS, coupons);
    return newCoupon;
  }

  // ORDERS
  public getOrders(): Order[] {
    return this.getItem(KEYS.ORDERS, SAMPLE_INITIAL_ORDERS);
  }

  public getOrderById(id: string): Order | undefined {
    const orders = this.getOrders();
    return orders.find(o => o.id === id || o.order_number.toUpperCase() === id.trim().toUpperCase());
  }

  public findOrderByTrackQuery(query: string): Order | undefined {
    const clean = query.trim().toLowerCase();
    const orders = this.getOrders();
    return orders.find(o => 
      o.order_number.toLowerCase() === clean ||
      o.customer_phone.replace(/\D/g, '') === clean.replace(/\D/g, '') ||
      o.customer_email.toLowerCase() === clean
    );
  }

  public createOrder(orderData: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    division: string;
    district: string;
    upazila: string;
    full_address: string;
    notes?: string;
    items: CartItem[];
    coupon_code?: string;
    payment_method: 'cod' | 'bkash' | 'nagad' | 'card';
    delivery_zone: 'inside_dhaka' | 'outside_dhaka';
  }): Order {
    const settings = this.getSettings();
    const orders = this.getOrders();
    
    // Subtotal calculation
    const subtotal = orderData.items.reduce((sum, item) => sum + item.total_price, 0);

    // Coupon validation
    let discount = 0;
    if (orderData.coupon_code) {
      const couponCheck = this.validateCoupon(orderData.coupon_code, subtotal);
      if (couponCheck.valid) {
        discount = couponCheck.discount;
      }
    }

    // Delivery calculation
    const baseDelivery = orderData.delivery_zone === 'inside_dhaka' 
      ? settings.delivery_inside_dhaka 
      : settings.delivery_outside_dhaka;
    
    const deliveryCharge = subtotal >= settings.free_delivery_threshold ? 0 : baseDelivery;
    const total = Math.max(0, subtotal - discount + deliveryCharge);

    // Generate unique order number (e.g. ORD-20260927-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const orderCountToday = orders.length + 1;
    const orderNumber = `ORD-${dateStr}-${orderCountToday.toString().padStart(4, '0')}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone,
      division: orderData.division,
      district: orderData.district,
      upazila: orderData.upazila,
      full_address: orderData.full_address,
      notes: orderData.notes,
      items: orderData.items.map(item => ({
        product_id: item.product_id,
        product_name: item.product.name,
        product_image: item.product.image,
        variant_label: item.variant_label,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })),
      subtotal,
      discount,
      coupon_code: orderData.coupon_code,
      delivery_charge: deliveryCharge,
      total,
      payment_method: orderData.payment_method,
      payment_status: orderData.payment_method === 'cod' ? 'pending' : 'pending',
      order_status: 'pending',
      status_history: [
        {
          status: 'pending',
          note: `Order received with ${orderData.payment_method.toUpperCase()} payment method.`,
          timestamp: new Date().toISOString(),
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    this.setItem(KEYS.ORDERS, orders);

    // Decrement inventory
    const products = this.getProducts();
    orderData.items.forEach(cartItem => {
      const prod = products.find(p => p.id === cartItem.product_id);
      if (prod) {
        prod.stock_quantity = Math.max(0, prod.stock_quantity - cartItem.quantity);
        if (prod.stock_quantity === 0) {
          prod.stock_status = 'out_of_stock';
        } else if (prod.stock_quantity <= 5) {
          prod.stock_status = 'low_stock';
        }
      }
    });
    this.setItem(KEYS.PRODUCTS, products);

    // Clear cart after checkout
    this.clearCart();

    return newOrder;
  }

  public updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string): Order | undefined {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return undefined;

    order.order_status = newStatus;
    order.updated_at = new Date().toISOString();
    order.status_history.push({
      status: newStatus,
      note: note || `Order status updated to ${newStatus.replace(/_/g, ' ')}`,
      timestamp: new Date().toISOString(),
      updated_by: 'Admin',
    });

    if (newStatus === 'delivered' && order.payment_method === 'cod') {
      order.payment_status = 'paid';
    }

    this.setItem(KEYS.ORDERS, orders);
    return order;
  }

  public updatePaymentStatus(orderId: string, status: 'pending' | 'paid' | 'failed', transactionId?: string): Order | undefined {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return undefined;

    order.payment_status = status;
    if (transactionId) order.payment_transaction_id = transactionId;
    order.updated_at = new Date().toISOString();
    this.setItem(KEYS.ORDERS, orders);
    return order;
  }

  // REVIEWS
  public getReviews(productId?: string): Review[] {
    const reviews = this.getItem<Review[]>(KEYS.REVIEWS, [
      {
        id: 'rev-1',
        product_id: 'prod-black-seed-honey-1kg',
        customer_name: 'Tanvir Hossain',
        rating: 5,
        comment: 'অসাধারণ কালোজিরা মধু। স্বাদ ও ঘনত্ব একদম পারফেক্ট। বাজারের ভেজাল মধুর ভিড়ে এটা সত্যিই প্রশান্তি দেয়।',
        is_verified: true,
        is_approved: true,
        created_at: '2026-09-20',
      },
      {
        id: 'rev-2',
        product_id: 'prod-black-seed-honey-1kg',
        customer_name: 'Sabrina Rahman',
        rating: 5,
        comment: 'Regular customer of Shuddho Bazar. Delivery was within 24 hours in Dhaka.',
        is_verified: true,
        is_approved: true,
        created_at: '2026-09-22',
      },
      {
        id: 'rev-3',
        product_id: 'prod-gawa-ghee-1kg',
        customer_name: 'Engr. Mofizul Islam',
        rating: 5,
        comment: 'আসল দানাদার গাওয়া ঘি! খিচুড়ি আর ভাতের সাথে মুখে লেগে থাকার মতো সুঘ্রাণ।',
        is_verified: true,
        is_approved: true,
        created_at: '2026-09-24',
      }
    ]);
    if (productId) {
      return reviews.filter(r => r.product_id === productId && r.is_approved);
    }
    return reviews;
  }

  public addReview(review: Omit<Review, 'id' | 'created_at' | 'is_approved'>): Review {
    const reviews = this.getItem<Review[]>(KEYS.REVIEWS, []);
    const newRev: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      is_approved: true, // auto-approve verified customer reviews
      created_at: new Date().toISOString().slice(0, 10),
    };
    reviews.unshift(newRev);
    this.setItem(KEYS.REVIEWS, reviews);
    return newRev;
  }

  // USER / AUTH
  public getCurrentUser(): { id: string; name: string; email: string; phone: string; role: 'customer' | 'admin' } | null {
    return this.getItem(KEYS.USER_SESSION, {
      id: 'usr-demo',
      name: 'Mahmudur Rahman',
      email: 'customer@shuddhobazar.com',
      phone: '01712345678',
      role: 'customer'
    });
  }

  public setCurrentUser(user: { id: string; name: string; email: string; phone: string; role: 'customer' | 'admin' } | null): void {
    if (user) {
      this.setItem(KEYS.USER_SESSION, user);
    } else {
      localStorage.removeItem(KEYS.USER_SESSION);
    }
  }

  // ADMIN CREDENTIALS & AUTH
  public getAdminCredentials(): AdminCredentials {
    return this.getItem<AdminCredentials>(KEYS.ADMIN_CREDENTIALS, DEFAULT_ADMIN_CREDENTIALS);
  }

  public updateAdminCredentials(newCreds: Partial<AdminCredentials>): AdminCredentials {
    const current = this.getAdminCredentials();
    const updated: AdminCredentials = {
      ...current,
      ...newCreds,
    };
    this.setItem(KEYS.ADMIN_CREDENTIALS, updated);
    return updated;
  }

  public isAdminLoggedIn(): boolean {
    return Boolean(this.getItem<{ userId: string; token: string } | null>(KEYS.ADMIN_SESSION, null));
  }

  public getAdminSession(): { userId: string; name: string } | null {
    return this.getItem<{ userId: string; name: string } | null>(KEYS.ADMIN_SESSION, null);
  }

  public setAdminLoggedIn(sessionData: { userId: string; name: string } | null): void {
    if (sessionData) {
      this.setItem(KEYS.ADMIN_SESSION, { ...sessionData, token: `adm-${Date.now()}` });
      window.dispatchEvent(new CustomEvent('admin-auth-changed', { detail: { isLoggedIn: true } }));
    } else {
      localStorage.removeItem(KEYS.ADMIN_SESSION);
      window.dispatchEvent(new CustomEvent('admin-auth-changed', { detail: { isLoggedIn: false } }));
    }
  }

  public adminLogout(): void {
    this.setAdminLoggedIn(null);
  }

  // ABANDONED CARTS RECOVERY
  public getAbandonedCarts(): AbandonedCart[] {
    return this.getItem<AbandonedCart[]>(KEYS.ABANDONED_CARTS, SAMPLE_ABANDONED_CARTS);
  }

  public saveAbandonedCart(cartData: Partial<AbandonedCart> & { customer_phone: string; items: CartItem[]; cart_total: number }): AbandonedCart {
    const carts = this.getAbandonedCarts();
    const existingIndex = carts.findIndex(c => c.customer_phone === cartData.customer_phone && !c.recovered);
    
    if (existingIndex >= 0) {
      const updated: AbandonedCart = {
        ...carts[existingIndex],
        ...cartData,
        items: cartData.items,
        cart_total: cartData.cart_total,
      };
      carts[existingIndex] = updated;
      this.setItem(KEYS.ABANDONED_CARTS, carts);
      window.dispatchEvent(new CustomEvent('abandoned-carts-updated'));
      return updated;
    }

    const newCart: AbandonedCart = {
      id: `ab-cart-${Date.now()}`,
      customer_name: cartData.customer_name || 'Customer',
      customer_phone: cartData.customer_phone,
      customer_address: cartData.customer_address || '',
      items: cartData.items,
      cart_total: cartData.cart_total,
      created_at: 'Just now',
      recovered: false,
      recovery_attempts: 0,
    };

    const updated = [newCart, ...carts].slice(0, 50);
    this.setItem(KEYS.ABANDONED_CARTS, updated);
    window.dispatchEvent(new CustomEvent('abandoned-carts-updated'));
    return newCart;
  }

  public markAbandonedCartRecovered(id: string): void {
    const carts = this.getAbandonedCarts();
    const target = carts.find(c => c.id === id);
    if (target) {
      target.recovered = true;
      target.last_contacted_at = 'Just now';
      target.recovery_attempts = (target.recovery_attempts || 0) + 1;
      this.setItem(KEYS.ABANDONED_CARTS, carts);
      window.dispatchEvent(new CustomEvent('abandoned-carts-updated'));
    }
  }

  public deleteAbandonedCart(id: string): void {
    const carts = this.getAbandonedCarts().filter(c => c.id !== id);
    this.setItem(KEYS.ABANDONED_CARTS, carts);
    window.dispatchEvent(new CustomEvent('abandoned-carts-updated'));
  }

  // RECENTLY VIEWED PRODUCTS
  public getRecentlyViewed(): string[] {
    return this.getItem<string[]>(KEYS.RECENTLY_VIEWED, ['prod-black-seed-honey-1kg', 'prod-gawa-ghee-1kg']);
  }

  public addRecentlyViewed(productId: string): void {
    const viewed = this.getRecentlyViewed().filter(id => id !== productId);
    const updated = [productId, ...viewed].slice(0, 10);
    this.setItem(KEYS.RECENTLY_VIEWED, updated);
  }

  // COURIER AUTOMATION (STEADFAST & PATHAO)
  public bookCourier(orderId: string, provider: 'steadfast' | 'pathao'): { success: boolean; consignment_id: string; tracking_code: string; message: string } {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      return { success: false, consignment_id: '', tracking_code: '', message: 'Order not found' };
    }

    const consignmentId = provider === 'steadfast'
      ? `STF-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`
      : `PTH-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const trackingCode = provider === 'steadfast'
      ? `STF_TRK_${Math.floor(100000 + Math.random() * 900000)}`
      : `PTH_TRK_${Math.floor(100000 + Math.random() * 900000)}`;

    order.courier_provider = provider;
    order.courier_consignment_id = consignmentId;
    order.courier_tracking_code = trackingCode;
    order.courier_status = 'In Transit';
    order.order_status = 'shipped';
    order.status_history.push({
      status: 'shipped',
      note: `Booked on ${provider.toUpperCase()} Courier (Consignment ID: ${consignmentId}, Tracking: ${trackingCode})`,
      timestamp: new Date().toISOString(),
      updated_by: 'Admin / API',
    });
    order.updated_at = new Date().toISOString();

    this.setItem(KEYS.ORDERS, orders);
    return {
      success: true,
      consignment_id: consignmentId,
      tracking_code: trackingCode,
      message: `Successfully booked on ${provider === 'steadfast' ? 'Steadfast' : 'Pathao'} Courier!`,
    };
  }

  // FRAUD / RETURN RATE DETECTOR
  public checkPhoneFraudScore(phone: string): { success_rate: number; total_parcels: number; returned_parcels: number; risk_level: 'low' | 'medium' | 'high' } {
    let hash = 0;
    for (let i = 0; i < phone.length; i++) {
      hash = ((hash << 5) - hash) + phone.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);

    const total = 5 + (absHash % 25);
    const returned = (absHash % 4 === 0) ? (1 + (absHash % 4)) : (absHash % 2 === 0 ? 1 : 0);
    const rate = Math.max(50, Math.min(100, Math.round(((total - returned) / total) * 100)));

    let risk: 'low' | 'medium' | 'high' = 'low';
    if (rate < 70) risk = 'high';
    else if (rate < 85) risk = 'medium';

    return {
      success_rate: rate,
      total_parcels: total,
      returned_parcels: returned,
      risk_level: risk,
    };
  }

  // SMS NOTIFICATION AUTOMATION
  public sendOrderSms(orderId: string, type: 'placed' | 'shipped'): { success: boolean; message: string } {
    const order = this.getOrders().find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };

    const settings = this.getSettings();
    const smsSettings = settings.sms_settings;
    if (!smsSettings?.enabled) {
      return { success: false, message: 'SMS Gateway is disabled in settings' };
    }

    const template = type === 'placed'
      ? (smsSettings.order_placed_template || 'Dear {name}, your order #{order_number} is placed. Total: ৳{total}')
      : (smsSettings.order_shipped_template || 'Dear {name}, your parcel is shipped. Tracking: {tracking_code}');

    const rendered = template
      .replace('{name}', order.customer_name)
      .replace('{order_number}', order.order_number)
      .replace('{total}', order.total.toString())
      .replace('{tracking_code}', order.courier_tracking_code || 'In Transit');

    return {
      success: true,
      message: `SMS sent via ${smsSettings.provider.toUpperCase()} to ${order.customer_phone}: "${rendered}"`,
    };
  }

  // CUSTOMER LOYALTY POINTS
  public getLoyaltyPoints(): number {
    return this.getItem<number>(KEYS.LOYALTY_POINTS, 150); // Default 150 points demo balance
  }

  public redeemLoyaltyPoints(points: number): number {
    const current = this.getLoyaltyPoints();
    const redeemed = Math.min(current, points);
    this.setItem(KEYS.LOYALTY_POINTS, current - redeemed);
    return redeemed; // 1 point = 1 BDT discount
  }

  // ADMIN POS / QUICK ORDER ENTRY
  public createPosOrder(orderData: {
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    district: string;
    items: CartItem[];
    discount?: number;
    payment_method: 'cod' | 'bkash' | 'nagad';
    notes?: string;
  }): Order {
    const subtotal = orderData.items.reduce((s, i) => s + i.total_price, 0);
    const delivery = orderData.district.toLowerCase() === 'dhaka' ? 70 : 130;
    const discount = orderData.discount || 0;
    const total = Math.max(0, subtotal - discount + delivery);

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const orders = this.getOrders();
    const orderNumber = `POS-${dateStr}-${(orders.length + 1).toString().padStart(4, '0')}`;

    const newOrder: Order = {
      id: `ord-pos-${Date.now()}`,
      order_number: orderNumber,
      customer_name: orderData.customer_name,
      customer_email: 'phone-order@shuddhobazar.com',
      customer_phone: orderData.customer_phone,
      division: 'Dhaka',
      district: orderData.district,
      upazila: orderData.district,
      full_address: orderData.customer_address,
      notes: orderData.notes || 'Placed via Admin Phone/POS Desk',
      items: orderData.items.map((i) => ({
        product_id: i.product_id,
        product_name: i.product.name,
        product_image: i.product.image,
        variant_label: i.variant_label,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total_price: i.total_price,
      })),
      subtotal,
      discount,
      delivery_charge: delivery,
      total,
      payment_method: orderData.payment_method,
      payment_status: 'pending',
      order_status: 'confirmed',
      source: 'pos_admin',
      status_history: [
        {
          status: 'confirmed',
          note: 'Direct order registered via Admin Phone/POS Desk',
          timestamp: new Date().toISOString(),
          updated_by: 'Admin POS',
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    this.setItem(KEYS.ORDERS, orders);
    return newOrder;
  }
}

export const storage = new StorageService();
// Initialize storage
storage.init();
