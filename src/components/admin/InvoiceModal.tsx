import React, { useRef } from 'react';
import { Order, SiteSettings } from '../../types/ecommerce';
import { Printer, Download, X, CheckCircle, Clock, Truck, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

interface InvoiceModalProps {
  order: Order;
  settings: SiteSettings;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, settings, onClose }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Convert numbers to words approximation
  const numberToWords = (num: number): string => {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    if (num < 20) return units[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + units[num % 10] : '');
    if (num < 1000) return units[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + numberToWords(num % 100000) : '');
    return num.toLocaleString();
  };

  const invoiceDate = new Date(order.created_at).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const invoiceTime = new Date(order.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      {/* Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 print:border-none print:shadow-none print:w-full print:max-w-none">
        
        {/* Action Bar (Hidden on print) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-mono font-bold text-sm tracking-wider">OFFICIAL TAX INVOICE</span>
            <span className="text-xs text-slate-400">#{order.order_number}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close Invoice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div ref={invoiceRef} className="p-6 sm:p-10 space-y-6 text-slate-800 print:p-8">
          
          {/* Header Row: Store Logo & Details */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-emerald-800/20">
            <div>
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm"
                  style={{ backgroundColor: settings.theme_color || '#0D3823' }}
                >
                  {settings.logo_icon || '🌿'}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: settings.theme_color || '#0D3823' }}>
                    {settings.logo_text || settings.website_name || 'GHORER BAZAR'}
                  </h1>
                  <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                    {settings.tagline || '100% Pure & Safe Natural Food'}
                  </p>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-600 space-y-0.5">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{settings.address || 'Rampura, Dhaka-1219, Bangladesh'}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hotline: {settings.phone || '+8809642922922'}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email: {settings.email || 'contact@shuddhobazar.com'}</span>
                </p>
              </div>
            </div>

            {/* Invoice Meta Box */}
            <div className="sm:text-right bg-slate-50 p-4 rounded-xl border border-slate-200/80 min-w-[200px]">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">INVOICE</div>
              <div className="text-base font-extrabold text-slate-900 mt-0.5 font-mono">
                {order.order_number}
              </div>
              <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                <div>Date: <span className="font-semibold text-slate-700">{invoiceDate}</span></div>
                <div>Time: <span className="font-semibold text-slate-700">{invoiceTime}</span></div>
                <div className="pt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                    order.payment_status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {order.payment_status === 'paid' ? '● PAYMENT RECEIVED' : '● CASH ON DELIVERY / DUE'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 text-xs">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Billed & Shipped To:
              </span>
              <p className="text-sm font-bold text-slate-900">{order.customer_name}</p>
              <p className="text-slate-600 mt-0.5"><span className="font-medium text-slate-500">Phone:</span> {order.customer_phone}</p>
              {order.customer_email && (
                <p className="text-slate-600"><span className="font-medium text-slate-500">Email:</span> {order.customer_email}</p>
              )}
              <p className="text-slate-700 mt-1 leading-relaxed">
                <span className="font-medium text-slate-500">Address:</span> {order.full_address}
                {order.upazila && `, ${order.upazila}`}
                {order.district && `, ${order.district}`}
              </p>
            </div>

            <div className="sm:border-l sm:border-slate-200/80 sm:pl-4 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Order & Dispatch Info:
              </span>
              <p className="text-slate-600">
                <span className="font-medium text-slate-500">Payment Mode:</span>{' '}
                <span className="font-bold text-slate-800 uppercase">{order.payment_method}</span>
              </p>
              {order.payment_transaction_id && (
                <p className="text-slate-600">
                  <span className="font-medium text-slate-500">Transaction ID:</span>{' '}
                  <span className="font-mono font-bold text-slate-800">{order.payment_transaction_id}</span>
                </p>
              )}
              <p className="text-slate-600">
                <span className="font-medium text-slate-500">Delivery Status:</span>{' '}
                <span className="font-semibold text-emerald-700 capitalize">{order.order_status.replace(/_/g, ' ')}</span>
              </p>
              {order.notes && (
                <p className="text-slate-600 mt-1 italic bg-amber-50 p-2 rounded border border-amber-200/60">
                  <span className="font-semibold not-italic text-amber-900">Delivery Note:</span> "{order.notes}"
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-100/70 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">Item Details</th>
                  <th className="py-2.5 px-3 text-center">Unit Price</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {order.items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 text-center text-slate-400 font-mono font-semibold">{index + 1}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800 text-xs sm:text-sm">{item.product_name}</div>
                      {item.variant_label && (
                        <span className="inline-block mt-0.5 text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          Pack: {item.variant_label}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">{settings.currency_symbol}{item.unit_price.toLocaleString()}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {settings.currency_symbol}{item.total_price.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown & In Words */}
          <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
            <div className="sm:col-span-7 space-y-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Amount in Words:
                </span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {numberToWords(Math.round(order.total))} Taka Only
                </p>
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed pt-1">
                <p className="font-semibold text-slate-600">Terms & Conditions:</p>
                <ul className="list-disc pl-4 space-y-0.5 mt-0.5">
                  <li>Please check the parcel in front of the delivery executive before signing.</li>
                  <li>For exchange or issues, contact our hotline within 24 hours of receipt.</li>
                  <li>100% purity and satisfaction guaranteed by {settings.website_name}.</li>
                </ul>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="sm:col-span-5 bg-slate-50/80 p-4 rounded-xl border border-slate-200/90 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">{settings.currency_symbol}{order.subtotal.toLocaleString()}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}:</span>
                  <span className="font-mono font-semibold">-{settings.currency_symbol}{order.discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge:</span>
                <span className="font-mono font-semibold">
                  {order.delivery_charge === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `${settings.currency_symbol}${order.delivery_charge}`
                  )}
                </span>
              </div>

              <div className="pt-2 border-t-2 border-slate-300 flex justify-between items-center">
                <span className="text-sm font-extrabold text-slate-900">Total Payable:</span>
                <span className="text-base font-black font-mono text-emerald-800">
                  {settings.currency_symbol}{order.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Signatures */}
          <div className="pt-8 border-t border-dashed border-slate-200 flex justify-between items-end text-xs text-slate-500">
            <div className="space-y-1">
              <div className="text-[10px] text-slate-400 font-mono">Powered by {settings.website_name} E-Commerce System</div>
              <div className="text-[10px] text-slate-400">Generated on: {new Date().toLocaleString()}</div>
            </div>

            <div className="text-center">
              <div className="w-36 border-b border-slate-400 pb-1 mb-1"></div>
              <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Authorized Signature</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
