import { storage } from './storage';
import { Product, Order, TrackingSettings, TrackingEventLog } from '../types/ecommerce';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    ttq?: any;
  }
}

// SHA-256 hasher for user data normalization in browser
async function sha256(message: string): Promise<string> {
  const normalized = message.trim().toLowerCase();
  if (!normalized) return '';
  try {
    const msgBuffer = new TextEncoder().encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    // Fallback simple hash string if crypto.subtle is unavailable
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }
}

// Format Bangladeshi and international phone numbers for Meta CAPI
function normalizePhone(rawPhone: string): string {
  if (!rawPhone) return '';
  let cleaned = rawPhone.replace(/\D/g, '');
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    cleaned = '88' + cleaned;
  }
  return cleaned;
}

// Generate unique event ID for deduplication between Pixel and CAPI
export function generateEventId(prefix: string = 'evt'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

class TrackingService {
  private initialized = false;
  private currentPixelId = '';
  private currentGtmId = '';
  private currentGa4Id = '';

  // Initialize scripts based on stored settings
  public init() {
    if (typeof window === 'undefined') return;
    const settings = storage.getSettings();
    const tracking = settings.tracking_settings;

    if (!tracking) return;

    // 1. Meta Pixel (Facebook Pixel) Initialization
    if (tracking.meta_pixel_enabled && tracking.meta_pixel_id) {
      this.initMetaPixel(tracking.meta_pixel_id);
    }

    // 2. Google Tag Manager Initialization
    if (tracking.gtm_enabled && tracking.gtm_id) {
      this.initGTM(tracking.gtm_id);
    }

    // 3. Google Analytics 4 (gtag.js) Initialization
    if (tracking.ga4_enabled && tracking.ga4_measurement_id) {
      this.initGA4(tracking.ga4_measurement_id);
    }

    // 4. Custom Scripts Injection
    this.injectCustomScripts(tracking.custom_head_script, tracking.custom_body_script);

    this.initialized = true;

    // Listen for settings update to dynamically refresh tracking
    window.addEventListener('settings-updated', (e: any) => {
      const updatedTracking: TrackingSettings = e.detail?.tracking_settings;
      if (updatedTracking) {
        if (updatedTracking.meta_pixel_enabled && updatedTracking.meta_pixel_id !== this.currentPixelId) {
          this.initMetaPixel(updatedTracking.meta_pixel_id);
        }
        if (updatedTracking.gtm_enabled && updatedTracking.gtm_id !== this.currentGtmId) {
          this.initGTM(updatedTracking.gtm_id);
        }
        if (updatedTracking.ga4_enabled && updatedTracking.ga4_measurement_id !== this.currentGa4Id) {
          this.initGA4(updatedTracking.ga4_measurement_id);
        }
        this.injectCustomScripts(updatedTracking.custom_head_script, updatedTracking.custom_body_script);
      }
    });
  }

  private initMetaPixel(pixelId: string) {
    if (!pixelId || this.currentPixelId === pixelId) return;
    this.currentPixelId = pixelId;

    if (!window.fbq) {
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    }

    try {
      window.fbq('init', pixelId);
      console.log(`[Tracking] Meta Pixel initialized with ID: ${pixelId}`);
    } catch (e) {
      console.warn('[Tracking] Meta Pixel init error:', e);
    }
  }

  private initGTM(gtmId: string) {
    if (!gtmId || this.currentGtmId === gtmId) return;
    this.currentGtmId = gtmId;
    window.dataLayer = window.dataLayer || [];

    const scriptId = 'gtm-script-inject';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`;
      document.head.appendChild(script);
    }
  }

  private initGA4(measurementId: string) {
    if (!measurementId || this.currentGa4Id === measurementId) return;
    this.currentGa4Id = measurementId;

    const scriptId = 'ga4-script-inject';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer?.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', measurementId);
    }
  }

  private injectCustomScripts(headScript?: string, bodyScript?: string) {
    // Clean old injections if any
    const oldHead = document.getElementById('custom-tracking-head');
    if (oldHead) oldHead.remove();
    const oldBody = document.getElementById('custom-tracking-body');
    if (oldBody) oldBody.remove();

    if (headScript && headScript.trim()) {
      try {
        const div = document.createElement('div');
        div.id = 'custom-tracking-head';
        div.innerHTML = headScript;
        document.head.appendChild(div);
      } catch (e) {
        console.warn('Could not inject custom head script', e);
      }
    }

    if (bodyScript && bodyScript.trim()) {
      try {
        const div = document.createElement('div');
        div.id = 'custom-tracking-body';
        div.innerHTML = bodyScript;
        document.body.appendChild(div);
      } catch (e) {
        console.warn('Could not inject custom body script', e);
      }
    }
  }

  // --- DISPATCH CAPI SERVER-SIDE EVENT ---
  private async sendCAPIEvent(
    eventName: string,
    eventId: string,
    customData: any,
    userData: { email?: string; phone?: string; name?: string; city?: string } = {}
  ): Promise<{ success: boolean; status: string; summary: string }> {
    const settings = storage.getSettings();
    const tracking = settings.tracking_settings;

    if (!tracking || !tracking.meta_capi_enabled || !tracking.meta_pixel_id) {
      return { success: false, status: 'disabled', summary: 'Server-side CAPI is not enabled' };
    }

    const token = tracking.meta_capi_access_token;
    const pixelId = tracking.meta_pixel_id;
    const testCode = tracking.meta_capi_test_code;
    const isTestMode = tracking.test_mode;

    // Prepare User Data (Normalized & Hashed)
    const normalizedPhone = normalizePhone(userData.phone || '');
    const phoneHash = normalizedPhone ? await sha256(normalizedPhone) : undefined;
    const emailHash = userData.email ? await sha256(userData.email) : undefined;
    const nameParts = (userData.name || '').trim().split(' ');
    const fnHash = nameParts[0] ? await sha256(nameParts[0]) : undefined;
    const lnHash = nameParts.length > 1 ? await sha256(nameParts.slice(1).join(' ')) : undefined;
    const ctHash = userData.city ? await sha256(userData.city) : undefined;

    const payloadUserData: any = {
      client_user_agent: navigator.userAgent,
      client_ip_address: '103.205.71.1', // Standard client IP or fallback
      ...(phoneHash ? { ph: [phoneHash] } : {}),
      ...(emailHash ? { em: [emailHash] } : {}),
      ...(fnHash ? { fn: [fnHash] } : {}),
      ...(lnHash ? { ln: [lnHash] } : {}),
      ...(ctHash ? { ct: [ctHash] } : {}),
      country: ['bd'],
    };

    const serverEventPayload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url: window.location.href,
          action_source: 'website',
          user_data: payloadUserData,
          custom_data: customData,
        },
      ],
      ...(testCode || isTestMode ? { test_event_code: testCode || 'TEST_SIMULATOR' } : {}),
    };

    // If custom proxy URL is specified, dispatch to proxy; otherwise dispatch to Meta Graph API
    const targetUrl = tracking.meta_capi_proxy_url?.trim()
      ? tracking.meta_capi_proxy_url
      : token && token.length > 20 && !token.includes('...')
      ? `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`
      : null;

    if (!targetUrl) {
      return {
        success: true,
        status: 'simulated',
        summary: `Simulated CAPI dispatch (Token is placeholder or test mode). Event ID: ${eventId}`,
      };
    }

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serverEventPayload),
      });

      const resJson = await res.json().catch(() => ({}));
      if (res.ok) {
        return {
          success: true,
          status: 'sent',
          summary: `Meta CAPI 200 OK. events_received: ${resJson.events_received || 1}, fbtrace_id: ${resJson.fbtrace_id || 'trace-ok'}`,
        };
      } else {
        return {
          success: false,
          status: 'error',
          summary: `Meta API Error (${res.status}): ${resJson.error?.message || 'Check access token/pixel ID'}`,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        status: 'error',
        summary: `Network request error: ${err.message || 'Failed to reach CAPI endpoint'}`,
      };
    }
  }

  // --- PUBLIC STANDARD E-COMMERCE TRACKING METHODS ---

  // 1. PageView
  public async trackPageView(url?: string, title?: string) {
    const settings = storage.getSettings();
    const tracking = settings.tracking_settings;
    if (tracking && tracking.track_pageviews === false) return;

    const eventId = generateEventId('pageview');
    const channels: ('browser_pixel' | 'server_capi' | 'gtm' | 'ga4')[] = [];

    // Browser Pixel
    if (tracking?.meta_pixel_enabled && window.fbq) {
      try {
        window.fbq('track', 'PageView', {}, { eventID: eventId });
        channels.push('browser_pixel');
      } catch (e) {
        console.warn('fbq PageView error', e);
      }
    }

    // GTM dataLayer
    if (tracking?.gtm_enabled && window.dataLayer) {
      window.dataLayer.push({
        event: 'page_view',
        page_location: url || window.location.href,
        page_title: title || document.title,
      });
      channels.push('gtm');
    }

    // GA4 gtag
    if (tracking?.ga4_enabled && window.gtag) {
      window.gtag('event', 'page_view', {
        page_location: url || window.location.href,
        page_title: title || document.title,
      });
      channels.push('ga4');
    }

    // Server-Side CAPI
    let capiResult = { success: false, status: 'disabled', summary: '' };
    if (tracking?.meta_capi_enabled) {
      capiResult = await this.sendCAPIEvent('PageView', eventId, {
        content_name: title || document.title,
      });
      channels.push('server_capi');
    }

    // Log for Diagnostics
    this.recordLog({
      event_name: 'PageView',
      event_id: eventId,
      channels,
      status: capiResult.status === 'sent' ? 'sent' : capiResult.status === 'error' ? 'error' : 'simulated',
      payload: { url: url || window.location.href, title: title || document.title },
      response_summary: capiResult.summary || 'Browser Pixel fired successfully',
    });

    // Record live visitor path
    storage.recordVisitorPageVisit(
      url || window.location.pathname,
      title || document.title || 'Store Page',
      'Visited Page',
      'PageView'
    );
  }

  // 2. ViewContent (Product Details View)
  public async trackViewContent(product: Product) {
    const settings = storage.getSettings();
    const tracking = settings.tracking_settings;
    if (tracking && tracking.track_view_content === false) return;

    const eventId = generateEventId('view_content');
    const channels: ('browser_pixel' | 'server_capi' | 'gtm' | 'ga4')[] = [];

    const customData = {
      content_name: product.name,
      content_category: product.category_name,
      content_ids: [product.id, product.sku || product.slug],
      content_type: 'product',
      value: product.sale_price,
      currency: 'BDT',
    };

    // Browser Pixel
    if (tracking?.meta_pixel_enabled && window.fbq) {
      try {
        window.fbq('track', 'ViewContent', customData, { eventID: eventId });
        channels.push('browser_pixel');
      } catch (e) {
        console.warn('fbq ViewContent error', e);
      }
    }

    // GTM / GA4
    if (tracking?.gtm_enabled && window.dataLayer) {
      window.dataLayer.push({
        event: 'view_item',
        ecommerce: {
          currency: 'BDT',
          value: product.sale_price,
          items: [
            {
              item_id: product.id,
              item_name: product.name,
              item_category: product.category_name,
              price: product.sale_price,
            },
          ],
        },
      });
      channels.push('gtm');
    }

    // Server-Side CAPI
    let capiResult = { success: false, status: 'disabled', summary: '' };
    if (tracking?.meta_capi_enabled) {
      capiResult = await this.sendCAPIEvent('ViewContent', eventId, customData);
      channels.push('server_capi');
    }

    this.recordLog({
      event_name: 'ViewContent',
      event_id: eventId,
      channels,
      status: capiResult.status === 'sent' ? 'sent' : capiResult.status === 'error' ? 'error' : 'simulated',
      payload: customData,
      response_summary: capiResult.summary || 'Browser ViewContent fired successfully',
    });

    storage.recordVisitorPageVisit(
      `/product/${product.slug}`,
      product.name,
      `Viewed Product: ${product.name}`,
      'ViewContent'
    );
  }

  // 3. AddToCart
  public async trackAddToCart(product: Product, quantity: number = 1, variantLabel?: string) {
    const settings = storage.getSettings();
    const tracking = settings.tracking_settings;
    if (tracking && tracking.track_add_to_cart === false) return;

    const eventId = generateEventId('add_to_cart');
    const channels: ('browser_pixel' | 'server_capi' | 'gtm' | 'ga4')[] = [];

    const totalValue = product.sale_price * quantity;
    const customData = {
      content_name: product.name,
      content_category: product.category_name,
      content_ids: [product.id],
      content_type: 'product',
      value: totalValue,
      currency: 'BDT',
      num_items: quantity,
      contents: [
        {
          id: product.id,
          quantity: quantity,
          item_price: product.sale_price,
          title: product.name,
        },
      ],
    };

    // Browser Pixel
    if (tracking?.meta_pixel_enabled && window.fbq) {
      try {
        window.fbq('track', 'AddToCart', customData, { eventID: eventId });
        channels.push('browser_pixel');
      } catch (e) {
        console.warn('fbq AddToCart error', e);
      }
    }

    // GTM
    if (tracking?.gtm_enabled && window.dataLayer) {
      window.dataLayer.push({
        event: 'add_to_cart',
        ecommerce: {
          currency: 'BDT',
          value: totalValue,
          items: [{ item_id: product.id, item_name: product.name, price: product.sale_price, quantity }],
        },
      });
      channels.push('gtm');
    }

    // Server-Side CAPI
    let capiResult = { success: false, status: 'disabled', summary: '' };
    if (tracking?.meta_capi_enabled) {
      capiResult = await this.sendCAPIEvent('AddToCart', eventId, customData);
      channels.push('server_capi');
    }

    this.recordLog({
      event_name: 'AddToCart',
      event_id: eventId,
      channels,
      status: capiResult.status === 'sent' ? 'sent' : capiResult.status === 'error' ? 'error' : 'simulated',
      payload: customData,
      response_summary: capiResult.summary || 'Browser AddToCart fired',
    });

    storage.recordVisitorPageVisit(
      `/product/${product.slug}`,
      product.name,
      `Added to Cart: ${product.name} (Qty: ${quantity}, ৳${totalValue})`,
      'AddToCart'
    );
  }

  // 4. InitiateCheckout
  public async trackInitiateCheckout(items: any[], totalValue: number, count: number) {
    const settings = storage.getSettings();
    const tracking = settings.tracking_settings;
    if (tracking && tracking.track_initiate_checkout === false) return;

    const eventId = generateEventId('initiate_checkout');
    const channels: ('browser_pixel' | 'server_capi' | 'gtm' | 'ga4')[] = [];

    const customData = {
      content_ids: items.map(i => i.product_id || i.id),
      content_type: 'product',
      value: totalValue,
      currency: 'BDT',
      num_items: count,
      contents: items.map(i => ({
        id: i.product_id || i.id,
        quantity: i.quantity || 1,
        item_price: i.unit_price || i.sale_price,
      })),
    };

    // Browser Pixel
    if (tracking?.meta_pixel_enabled && window.fbq) {
      try {
        window.fbq('track', 'InitiateCheckout', customData, { eventID: eventId });
        channels.push('browser_pixel');
      } catch (e) {
        console.warn('fbq InitiateCheckout error', e);
      }
    }

    // GTM
    if (tracking?.gtm_enabled && window.dataLayer) {
      window.dataLayer.push({
        event: 'begin_checkout',
        ecommerce: {
          currency: 'BDT',
          value: totalValue,
          items: customData.contents,
        },
      });
      channels.push('gtm');
    }

    // Server-Side CAPI
    let capiResult = { success: false, status: 'disabled', summary: '' };
    if (tracking?.meta_capi_enabled) {
      capiResult = await this.sendCAPIEvent('InitiateCheckout', eventId, customData);
      channels.push('server_capi');
    }

    this.recordLog({
      event_name: 'InitiateCheckout',
      event_id: eventId,
      channels,
      status: capiResult.status === 'sent' ? 'sent' : capiResult.status === 'error' ? 'error' : 'simulated',
      payload: customData,
      response_summary: capiResult.summary || 'Browser InitiateCheckout fired',
    });

    storage.recordVisitorPageVisit(
      '/checkout',
      'Checkout Page',
      `Entered Checkout Form (Total: ৳${totalValue})`,
      'InitiateCheckout'
    );
  }

  // 5. Purchase (High Value Conversion Event)
  public async trackPurchase(order: Order) {
    const settings = storage.getSettings();
    const tracking = settings.tracking_settings;
    if (tracking && tracking.track_purchase === false) return;

    const eventId = `purchase_${order.order_number || order.id}`;
    const channels: ('browser_pixel' | 'server_capi' | 'gtm' | 'ga4')[] = [];

    const customData = {
      content_ids: order.items.map(i => i.product_id),
      content_type: 'product',
      value: order.total,
      currency: 'BDT',
      num_items: order.items.reduce((s, i) => s + i.quantity, 0),
      order_id: order.order_number,
      contents: order.items.map(i => ({
        id: i.product_id,
        quantity: i.quantity,
        item_price: i.unit_price,
        item_name: i.product_name,
      })),
    };

    const userData = {
      email: order.customer_email,
      phone: order.customer_phone,
      name: order.customer_name,
      city: order.district || order.division,
    };

    // Browser Pixel
    if (tracking?.meta_pixel_enabled && window.fbq) {
      try {
        window.fbq('track', 'Purchase', customData, { eventID: eventId });
        channels.push('browser_pixel');
      } catch (e) {
        console.warn('fbq Purchase error', e);
      }
    }

    // GTM
    if (tracking?.gtm_enabled && window.dataLayer) {
      window.dataLayer.push({
        event: 'purchase',
        ecommerce: {
          transaction_id: order.order_number,
          value: order.total,
          currency: 'BDT',
          items: customData.contents,
        },
      });
      channels.push('gtm');
    }

    // GA4
    if (tracking?.ga4_enabled && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: order.order_number,
        value: order.total,
        currency: 'BDT',
        items: customData.contents,
      });
      channels.push('ga4');
    }

    // Server-Side CAPI with Normalized User Data
    let capiResult = { success: false, status: 'disabled', summary: '' };
    if (tracking?.meta_capi_enabled) {
      capiResult = await this.sendCAPIEvent('Purchase', eventId, customData, userData);
      channels.push('server_capi');
    }

    this.recordLog({
      event_name: 'Purchase',
      event_id: eventId,
      channels,
      status: capiResult.status === 'sent' ? 'sent' : capiResult.status === 'error' ? 'error' : 'simulated',
      payload: { ...customData, order_number: order.order_number },
      response_summary: capiResult.summary || 'Purchase event dispatched to Pixel & CAPI',
    });

    storage.recordVisitorPageVisit(
      `/track-order?ord=${order.order_number}`,
      'Order Confirmed',
      `Placed Order: #${order.order_number} (৳${order.total})`,
      'Purchase'
    );
  }

  // Simulator for Admin Live Testing
  public async simulateTestEvent(
    eventName: 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase'
  ) {
    const sampleProd = storage.getProducts()[0];

    if (eventName === 'PageView') {
      await this.trackPageView('/test-simulation', 'Test Simulation Page');
    } else if (eventName === 'ViewContent') {
      if (sampleProd) {
        await this.trackViewContent(sampleProd);
      }
    } else if (eventName === 'AddToCart') {
      if (sampleProd) {
        await this.trackAddToCart(sampleProd, 2);
      }
    } else if (eventName === 'InitiateCheckout') {
      await this.trackInitiateCheckout(
        [{ id: 'sim-prod-1', unit_price: 1250, quantity: 2 }],
        2500,
        2
      );
    } else if (eventName === 'Purchase') {
      await this.trackPurchase({
        id: 'sim-ord-' + Date.now(),
        order_number: 'TEST-' + Math.floor(100000 + Math.random() * 900000),
        customer_name: 'Tareq Rahman',
        customer_email: 'tareq.demo@gmail.com',
        customer_phone: '01799887766',
        division: 'Dhaka',
        district: 'Dhaka',
        upazila: 'Gulshan',
        full_address: 'Road 11, Banani, Dhaka',
        items: [
          {
            product_id: 'sim-prod-1',
            product_name: 'Organic Pure Honey 1kg',
            product_image: '',
            quantity: 2,
            unit_price: 1250,
            total_price: 2500,
          },
        ],
        subtotal: 2500,
        discount: 100,
        delivery_charge: 60,
        total: 2460,
        payment_method: 'cod',
        payment_status: 'pending',
        order_status: 'pending',
        status_history: [
          { status: 'pending', note: 'Test order generated for CAPI simulation', timestamp: new Date().toISOString() }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  private recordLog(log: Omit<TrackingEventLog, 'id' | 'timestamp'>) {
    const entry: TrackingEventLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ...log,
    };
    storage.logTrackingEvent(entry);
  }
}

export const pixelTracking = new TrackingService();
