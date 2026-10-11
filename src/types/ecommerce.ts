export interface Category {
  id: string;
  name?: string;
  name_bn?: string;
  slug: string;
  icon?: string;
  image?: string;
  parent_id?: string | null;
  sort_order: number;
  is_featured: boolean;
  status: 'active' | 'inactive';
  item_count?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface ProductVariant {
  id: string;
  sku: string;
  attribute_name: string; // e.g. "Weight"
  attribute_value: string; // e.g. "500g", "1kg"
  price: number;
  regular_price?: number;
  stock_quantity: number;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  name_bn: string;
  slug: string;
  sku: string;
  category_id: string;
  category_name?: string;
  brand_id?: string;
  brand_name?: string;
  short_description: string;
  full_description: string;
  regular_price: number;
  sale_price: number;
  discount_percent: number;
  stock_quantity: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'low_stock';
  weight: string;
  unit: string;
  image: string;
  gallery: string[];
  tags: string[];
  specifications: Record<string, string>;
  ingredients?: string;
  nutrition?: Record<string, string>;
  shipping_info?: string;
  is_featured: boolean;
  is_best_selling: boolean;
  is_new_arrival: boolean;
  is_recommended: boolean;
  status: 'active' | 'inactive';
  rating: number;
  reviews_count: number;
  variants?: ProductVariant[];
}

export interface CartItem {
  id: string; // unique item cart key (productId + variantId)
  product_id: string;
  product: Product;
  variant_id?: string;
  variant_label?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_amount: number;
  min_spend: number;
  max_discount?: number;
  usage_limit: number;
  usage_count: number;
  expiry_date: string;
  is_active: boolean;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export interface OrderStatusHistory {
  status: OrderStatus;
  note: string;
  timestamp: string;
  updated_by?: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  variant_label?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  division: string;
  district: string;
  upazila: string;
  full_address: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  coupon_code?: string;
  delivery_charge: number;
  total: number;
  payment_method: 'cod' | 'bkash' | 'nagad' | 'card';
  payment_status: 'pending' | 'paid' | 'failed';
  payment_transaction_id?: string;
  order_status: OrderStatus;
  status_history: OrderStatusHistory[];
  created_at: string;
  updated_at: string;
  // Courier & Delivery Automation
  courier_provider?: 'steadfast' | 'pathao' | 'redx' | 'manual';
  courier_consignment_id?: string;
  courier_tracking_code?: string;
  courier_status?: string;
  fraud_score?: {
    success_rate: number;
    total_parcels: number;
    returned_parcels: number;
    risk_level: 'low' | 'medium' | 'high';
  };
  source?: 'website' | 'pos_admin' | 'whatsapp' | 'phone';
}

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  customer_email?: string;
  rating: number;
  comment: string;
  photos?: string[];
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
}

export interface AbandonedCart {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  items: CartItem[];
  cart_total: number;
  created_at: string;
  recovered: boolean;
  recovery_attempts: number;
  last_contacted_at?: string;
}

export interface CourierSettings {
  steadfast_api_key?: string;
  steadfast_secret_key?: string;
  pathao_client_id?: string;
  pathao_client_secret?: string;
  pathao_store_id?: string;
  default_courier?: 'steadfast' | 'pathao';
  auto_booking_enabled?: boolean;
}

export interface SmsSettings {
  enabled: boolean;
  provider: 'greenweb' | 'bulksmsbd' | 'elitbuzz';
  api_key?: string;
  sender_id?: string;
  order_placed_template?: string;
  order_shipped_template?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_desktop: string;
  image_mobile?: string;
  button_text: string;
  button_url: string;
  position: 'hero_main' | 'hero_side' | 'middle_promo' | 'footer_promo';
  status: 'active' | 'inactive';
  sort_order: number;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  customer_role: string;
  customer_photo?: string;
  rating: number;
  comment: string;
  comment_bn?: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface SubMenuItem {
  id: string;
  label: string;
  slug: string;
  is_active?: boolean;
  sort_order?: number;
  device_visibility?: 'all' | 'desktop_only' | 'mobile_only';
}

export interface MenuItem {
  id: string;
  label: string;
  slug: string;
  isOffer?: boolean;
  hasDropdown?: boolean;
  is_active: boolean;
  sort_order: number;
  sub_items?: SubMenuItem[];
  device_visibility?: 'all' | 'desktop_only' | 'mobile_only';
}

export type DeviceType = 'pc' | 'tab' | 'phone';

export interface ResponsiveDesignSettings {
  // Logo & Branding Responsive
  logo_height_pc: number;
  logo_height_tab: number;
  logo_height_phone: number;
  logo_text_size_pc: number;
  logo_text_size_tab: number;
  logo_text_size_phone: number;
  logo_format_pc: 'both' | 'image' | 'text';
  logo_format_tab: 'both' | 'image' | 'text';
  logo_format_phone: 'both' | 'image' | 'text';
  show_tagline_pc: boolean;
  show_tagline_tab: boolean;
  show_tagline_phone: boolean;

  // Header & Navigation Bar
  show_category_bar_pc: boolean;
  show_category_bar_tab: boolean;
  show_category_bar_phone: boolean;
  category_bar_font_size_pc: number;
  category_bar_font_size_tab: number;
  category_bar_font_size_phone: number;
  show_search_pc: boolean;
  show_search_tab: boolean;
  show_search_phone: boolean;

  // Hero Slider
  hero_height_pc: number;
  hero_height_tab: number;
  hero_height_phone: number;
  hero_title_size_pc: number;
  hero_title_size_tab: number;
  hero_title_size_phone: number;
  show_side_banner_pc: boolean;
  show_side_banner_tab: boolean;
  show_side_banner_phone: boolean;

  // Middle Promo Banner
  promo_banner_height_pc: number;
  promo_banner_height_tab: number;
  promo_banner_height_phone: number;
  show_promo_banner_pc: boolean;
  show_promo_banner_tab: boolean;
  show_promo_banner_phone: boolean;

  // Product Grid Columns
  product_cols_pc: number;
  product_cols_tab: number;
  product_cols_phone: number;

  // Container & Global
  container_max_width: '1200' | '1360' | '1440' | '100%';
  mobile_quick_bar_enabled: boolean;
}

export interface CheckoutSettings {
  heading: string;
  subheading: string;
  button_text: string;
  terms_text: string;
  delivery_notice: string;
  require_email: boolean;
  show_email: boolean;
  show_notes: boolean;
  name_label: string;
  phone_label: string;
  email_label: string;
  address_label: string;
  district_label: string;
  thana_label: string;
  notes_label: string;
  name_placeholder: string;
  phone_placeholder: string;
  email_placeholder: string;
  address_placeholder: string;
  notes_placeholder: string;
}

export interface SeoSettings {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_card: 'summary' | 'summary_large_image';
  twitter_site: string;
  canonical_url: string;
  google_verification: string;
  robots: string;
  author: string;
  structured_data_enabled: boolean;
}

export interface TrackingSettings {
  // Meta Pixel (Browser)
  meta_pixel_enabled: boolean;
  meta_pixel_id: string;

  // Meta Conversions API (CAPI - Server Side)
  meta_capi_enabled: boolean;
  meta_capi_access_token: string;
  meta_capi_test_code?: string;
  meta_capi_proxy_url?: string;

  // Google Tag Manager & GA4
  gtm_enabled: boolean;
  gtm_id: string;
  gtm_server_container_url?: string;

  ga4_enabled: boolean;
  ga4_measurement_id: string;
  ga4_api_secret?: string;

  // TikTok Pixel & Events API
  tiktok_pixel_enabled: boolean;
  tiktok_pixel_id: string;
  tiktok_events_api_token?: string;

  // Custom Tracking Codes
  custom_head_script?: string;
  custom_body_script?: string;

  // Event Toggles
  track_pageviews: boolean;
  track_view_content: boolean;
  track_add_to_cart: boolean;
  track_initiate_checkout: boolean;
  track_purchase: boolean;
  hash_user_data: boolean;
  test_mode: boolean;
}

export interface TrackingEventLog {
  id: string;
  timestamp: string;
  event_name: 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase' | 'Search' | 'Contact';
  event_id: string;
  channels: ('browser_pixel' | 'server_capi' | 'gtm' | 'ga4')[];
  status: 'sent' | 'simulated' | 'error' | 'test_mode';
  payload: any;
  response_summary?: string;
}

export interface VisitorPageStep {
  page: string;
  title: string;
  timestamp: string;
  action?: string;
  pixel_event?: string;
}

export interface VisitorSession {
  id: string;
  visitor_name: string;
  location: string;
  device_type: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  traffic_source: 'Facebook Ads (Meta Pixel)' | 'Google Organic' | 'Direct / Website' | 'WhatsApp / Social' | 'Email Campaign';
  ip_address: string;
  start_time: string;
  last_active: string;
  is_online: boolean;
  page_views_count: number;
  current_page: string;
  page_history: VisitorPageStep[];
  cart_total?: number;
  purchased?: boolean;
}

export interface TrafficStats {
  total_visitors_today: number;
  total_pageviews_today: number;
  live_active_visitors: number;
  facebook_pixel_traffic_percent: number;
  avg_session_duration: string;
  top_pages: { path: string; title: string; views: number; visitors: number }[];
  device_stats: { mobile: number; desktop: number; tablet: number };
  source_stats: { source: string; count: number; percent: number }[];
}

export interface SiteSettings {
  website_name: string;
  tagline: string;
  logo: string;
  logo_type?: 'text' | 'image' | 'both';
  logo_text?: string;
  logo_icon?: string;
  theme_color?: string;
  accent_color?: string;
  favicon: string;
  phone: string;
  email: string;
  address: string;
  currency_symbol: string;
  currency_code: string;
  delivery_inside_dhaka: number;
  delivery_outside_dhaka: number;
  free_delivery_threshold: number;
  express_delivery_enabled?: boolean;
  express_delivery_fee?: number;
  cod_enabled: boolean;
  bkash_merchant_number: string;
  nagad_merchant_number: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  menu_items?: MenuItem[];
  checkout_settings?: CheckoutSettings;
  seo_settings?: SeoSettings;
  responsive_design?: ResponsiveDesignSettings;
  tracking_settings?: TrackingSettings;
  courier_settings?: CourierSettings;
  sms_settings?: SmsSettings;
  whatsapp_number?: string;
  whatsapp_order_enabled?: boolean;
  loyalty_enabled?: boolean;
  bundle_offers_enabled?: boolean;
  flash_sale_enabled?: boolean;
  flash_sale_title?: string;
  flash_sale_end_time?: string;
}
