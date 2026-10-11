import React, { useState } from 'react';
import { SiteSettings, CheckoutSettings } from '../../types/ecommerce';
import { storage } from '../../services/storage';
import { Truck, DollarSign, Edit3, Check, Save, Eye, AlertCircle, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

interface CheckoutSettingsTabProps {
  settings: SiteSettings;
  onSettingsUpdated: (updated: SiteSettings) => void;
}

export const CheckoutSettingsTab: React.FC<CheckoutSettingsTabProps> = ({
  settings,
  onSettingsUpdated,
}) => {
  const [deliveryInside, setDeliveryInside] = useState<number>(settings.delivery_inside_dhaka || 70);
  const [deliveryOutside, setDeliveryOutside] = useState<number>(settings.delivery_outside_dhaka || 130);
  const [freeThreshold, setFreeThreshold] = useState<number>(settings.free_delivery_threshold || 2500);
  const [expressEnabled, setExpressEnabled] = useState<boolean>(Boolean(settings.express_delivery_enabled));
  const [expressFee, setExpressFee] = useState<number>(settings.express_delivery_fee || 150);

  const [checkoutFields, setCheckoutFields] = useState<CheckoutSettings>(() => ({
    heading: settings.checkout_settings?.heading || 'Billing & Delivery Details',
    subheading: settings.checkout_settings?.subheading || 'Please enter your shipping address to receive your pure organic grocery items',
    button_text: settings.checkout_settings?.button_text || 'অর্ডার নিশ্চিত করুন (Confirm Order)',
    terms_text: settings.checkout_settings?.terms_text || 'I have read and agree to the website terms and conditions',
    delivery_notice: settings.checkout_settings?.delivery_notice || 'ঢাকার মধ্যে ২৪ ঘন্টায় এবং ঢাকার বাইরে ৪৮-৭২ ঘন্টায় হোম ডেলিভারি পৌঁছে যাবে।',
    require_email: Boolean(settings.checkout_settings?.require_email),
    show_email: settings.checkout_settings?.show_email !== false,
    show_notes: settings.checkout_settings?.show_notes !== false,
    name_label: settings.checkout_settings?.name_label || 'আপনার নাম (Full Name)',
    phone_label: settings.checkout_settings?.phone_label || 'মোবাইল নাম্বার (Mobile Number)',
    email_label: settings.checkout_settings?.email_label || 'ইমেইল এড্রেস (Email Address)',
    address_label: settings.checkout_settings?.address_label || 'সম্পূর্ণ ডেলিভারি ঠিকানা (Full Address)',
    district_label: settings.checkout_settings?.district_label || 'জেলা (District)',
    thana_label: settings.checkout_settings?.thana_label || 'থানা / উপজেলা (Thana / Area)',
    notes_label: settings.checkout_settings?.notes_label || 'স্পেশাল নোট (Order Notes / Delivery Instructions)',
    name_placeholder: settings.checkout_settings?.name_placeholder || 'যেমন: মো: মাহামুদুর রহমান',
    phone_placeholder: settings.checkout_settings?.phone_placeholder || 'যেমন: 01712345678',
    email_placeholder: settings.checkout_settings?.email_placeholder || 'example@gmail.com',
    address_placeholder: settings.checkout_settings?.address_placeholder || 'বাসা / রোড নং, এলাকা ও ল্যান্ডমার্ক',
    notes_placeholder: settings.checkout_settings?.notes_placeholder || 'ডেলিভারির জন্য কোনো বিশেষ নির্দেশনা থাকলে লিখুন...',
  }));

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = storage.updateSettings({
      delivery_inside_dhaka: Number(deliveryInside),
      delivery_outside_dhaka: Number(deliveryOutside),
      free_delivery_threshold: Number(freeThreshold),
      express_delivery_enabled: expressEnabled,
      express_delivery_fee: Number(expressFee),
      checkout_settings: checkoutFields,
    });
    onSettingsUpdated(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 p-6 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Truck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">Checkout Form & Delivery Charge Manager</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Customize all input field labels, placeholders, notice text, order confirmation button, and city delivery charges. Changes are instantly applied to customer checkouts.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer shrink-0"
        >
          {saved ? <Check className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Changes Saved!' : 'Save All Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form & Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* SECTION 1: DELIVERY CHARGES */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Delivery Charges & Free Shipping Policy</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Inside Dhaka / City ({settings.currency_symbol})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold font-mono">
                    {settings.currency_symbol}
                  </span>
                  <input
                    type="number"
                    value={deliveryInside}
                    onChange={(e) => setDeliveryInside(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 font-mono font-bold"
                    min="0"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Standard local city courier rate</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Outside Dhaka / Country ({settings.currency_symbol})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold font-mono">
                    {settings.currency_symbol}
                  </span>
                  <input
                    type="number"
                    value={deliveryOutside}
                    onChange={(e) => setDeliveryOutside(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 font-mono font-bold"
                    min="0"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Nationwide courier delivery rate</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Free Delivery Threshold ({settings.currency_symbol})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold font-mono">
                    {settings.currency_symbol}
                  </span>
                  <input
                    type="number"
                    value={freeThreshold}
                    onChange={(e) => setFreeThreshold(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 font-mono font-bold text-emerald-700"
                    min="0"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Orders ≥ this amount get free shipping</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Checkout Delivery Notice Message
              </label>
              <input
                type="text"
                value={checkoutFields.delivery_notice}
                onChange={(e) => setCheckoutFields({ ...checkoutFields, delivery_notice: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                placeholder="Message displayed in order notice on checkout..."
              />
            </div>
          </div>

          {/* SECTION 2: CHECKOUT HEADER & BUTTON TEXT */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Edit3 className="w-4 h-4 text-emerald-600" />
              <span>Checkout Page Headers & Call-to-Action</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Main Heading</label>
                <input
                  type="text"
                  value={checkoutFields.heading}
                  onChange={(e) => setCheckoutFields({ ...checkoutFields, heading: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Place Order Button Text</label>
                <input
                  type="text"
                  value={checkoutFields.button_text}
                  onChange={(e) => setCheckoutFields({ ...checkoutFields, button_text: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600 font-bold text-emerald-800"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Subheading / Description</label>
              <input
                type="text"
                value={checkoutFields.subheading}
                onChange={(e) => setCheckoutFields({ ...checkoutFields, subheading: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Terms Agreement Text</label>
              <input
                type="text"
                value={checkoutFields.terms_text}
                onChange={(e) => setCheckoutFields({ ...checkoutFields, terms_text: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-600"
              />
            </div>
          </div>

          {/* SECTION 3: FORM FIELD LABELS & PLACEHOLDERS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Input Field Customization (Labels & Placeholders)</span>
            </h3>

            {/* Customer Name */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Field 1: Customer Name</span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">Always Required</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block">Label</label>
                  <input
                    type="text"
                    value={checkoutFields.name_label}
                    onChange={(e) => setCheckoutFields({ ...checkoutFields, name_label: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block">Placeholder</label>
                  <input
                    type="text"
                    value={checkoutFields.name_placeholder}
                    onChange={(e) => setCheckoutFields({ ...checkoutFields, name_placeholder: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Customer Phone */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Field 2: Mobile / Phone Number</span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">Always Required</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block">Label</label>
                  <input
                    type="text"
                    value={checkoutFields.phone_label}
                    onChange={(e) => setCheckoutFields({ ...checkoutFields, phone_label: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block">Placeholder</label>
                  <input
                    type="text"
                    value={checkoutFields.phone_placeholder}
                    onChange={(e) => setCheckoutFields({ ...checkoutFields, phone_placeholder: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Email Field with Toggles */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Field 3: Email Address</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkoutFields.show_email}
                      onChange={(e) => setCheckoutFields({ ...checkoutFields, show_email: e.target.checked })}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Show Field</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkoutFields.require_email}
                      onChange={(e) => setCheckoutFields({ ...checkoutFields, require_email: e.target.checked })}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Required</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block">Label</label>
                  <input
                    type="text"
                    value={checkoutFields.email_label}
                    onChange={(e) => setCheckoutFields({ ...checkoutFields, email_label: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block">Placeholder</label>
                  <input
                    type="text"
                    value={checkoutFields.email_placeholder}
                    onChange={(e) => setCheckoutFields({ ...checkoutFields, email_placeholder: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Address Field */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Field 4: Delivery Address</span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">Always Required</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block">Label</label>
                  <input
                    type="text"
                    value={checkoutFields.address_label}
                    onChange={(e) => setCheckoutFields({ ...checkoutFields, address_label: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block">Placeholder</label>
                  <input
                    type="text"
                    value={checkoutFields.address_placeholder}
                    onChange={(e) => setCheckoutFields({ ...checkoutFields, address_placeholder: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Order Notes Field */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Field 5: Order Instructions / Notes</span>
                <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkoutFields.show_notes}
                    onChange={(e) => setCheckoutFields({ ...checkoutFields, show_notes: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Show Field</span>
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block">Label</label>
                  <input
                    type="text"
                    value={checkoutFields.notes_label}
                    onChange={(e) => setCheckoutFields({ ...checkoutFields, notes_label: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block">Placeholder</label>
                  <input
                    type="text"
                    value={checkoutFields.notes_placeholder}
                    onChange={(e) => setCheckoutFields({ ...checkoutFields, notes_placeholder: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              {saved ? <Check className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
              <span>{saved ? 'Settings Saved Successfully!' : 'Save & Publish Checkout Settings'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Checkout Form Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-600" />
                Live Customer Checkout Preview
              </span>
              <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-semibold">
                Dynamic
              </span>
            </div>

            {/* Simulated Checkout Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">{checkoutFields.heading}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{checkoutFields.subheading}</p>
              </div>

              {/* Notice banner */}
              {checkoutFields.delivery_notice && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200/70 text-[11px] text-emerald-900 leading-snug flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{checkoutFields.delivery_notice}</span>
                </div>
              )}

              {/* Delivery Rates Preview Pill */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-[11px]">
                <span className="text-slate-600">Inside Dhaka: <strong className="text-slate-900 font-mono">{settings.currency_symbol}{deliveryInside}</strong></span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600">Outside Dhaka: <strong className="text-slate-900 font-mono">{settings.currency_symbol}{deliveryOutside}</strong></span>
              </div>
              <div className="text-[10px] text-emerald-700 bg-emerald-50/80 px-2 py-1 rounded text-center font-medium">
                Free Delivery on orders above {settings.currency_symbol}{freeThreshold}
              </div>

              {/* Fields */}
              <div className="space-y-2 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">{checkoutFields.name_label} *</label>
                  <input
                    type="text"
                    disabled
                    placeholder={checkoutFields.name_placeholder}
                    className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">{checkoutFields.phone_label} *</label>
                  <input
                    type="text"
                    disabled
                    placeholder={checkoutFields.phone_placeholder}
                    className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                {checkoutFields.show_email && (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                      {checkoutFields.email_label} {checkoutFields.require_email ? '*' : ''}
                    </label>
                    <input
                      type="text"
                      disabled
                      placeholder={checkoutFields.email_placeholder}
                      className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">{checkoutFields.address_label} *</label>
                  <textarea
                    rows={2}
                    disabled
                    placeholder={checkoutFields.address_placeholder}
                    className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                {checkoutFields.show_notes && (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">{checkoutFields.notes_label}</label>
                    <input
                      type="text"
                      disabled
                      placeholder={checkoutFields.notes_placeholder}
                      className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Terms agreement */}
              <div className="pt-1 flex items-start gap-1.5 text-[11px] text-slate-600">
                <input type="checkbox" checked disabled className="rounded text-emerald-600 mt-0.5" />
                <span>{checkoutFields.terms_text}</span>
              </div>

              {/* Button preview */}
              <button
                disabled
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-sm flex items-center justify-center gap-1.5 cursor-not-allowed opacity-90"
                style={{ backgroundColor: settings.accent_color || '#E25C1D' }}
              >
                <span>{checkoutFields.button_text}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
