<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    /**
     * Show Checkout Page
     */
    public function index()
    {
        $cart = session()->get('cart', []);
        if (empty($cart)) {
            return redirect()->route('shop')->with('error', 'Your shopping cart is empty.');
        }

        $subtotal = collect($cart)->sum(fn($i) => $i['price'] * $i['quantity']);
        $settings = DB::table('settings')->pluck('value', 'key');
        $freeThreshold = (float) ($settings['free_delivery_threshold'] ?? 2500);

        return view('checkout', compact('cart', 'subtotal', 'freeThreshold', 'settings'));
    }

    /**
     * Process Order Submission
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:150',
            'customer_phone' => 'required|string|min:11|max:15',
            'customer_email' => 'nullable|email',
            'division' => 'required|string|max:50',
            'district' => 'required|string|max:100',
            'upazila' => 'nullable|string|max:100',
            'full_address' => 'required|string',
            'notes' => 'nullable|string|max:500',
            'delivery_zone' => 'required|in:inside_dhaka,outside_dhaka',
            'payment_method' => 'required|in:cod,bkash,nagad,card',
            'payment_transaction_id' => 'nullable|string|max:100',
            'coupon_code' => 'nullable|string|max:30',
        ]);

        $cart = session()->get('cart', []);
        if (empty($cart)) {
            throw ValidationException::withMessages(['cart' => 'Your cart is empty.']);
        }

        $settings = DB::table('settings')->pluck('value', 'key');
        $insideDhaka = (float) ($settings['delivery_inside_dhaka'] ?? 70);
        $outsideDhaka = (float) ($settings['delivery_outside_dhaka'] ?? 130);
        $freeThreshold = (float) ($settings['free_delivery_threshold'] ?? 2500);

        return DB::transaction(function () use ($validated, $cart, $insideDhaka, $outsideDhaka, $freeThreshold) {
            $subtotal = 0;
            $itemsToCreate = [];

            // Secure server-side pricing recalculation from database
            foreach ($cart as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);
                $unitPrice = $product->sale_price;
                $lineTotal = $unitPrice * $item['quantity'];
                $subtotal += $lineTotal;

                // Inventory decrement
                if ($product->stock_quantity < $item['quantity']) {
                    throw ValidationException::withMessages([
                        'stock' => "Insufficient stock for {$product->name}."
                    ]);
                }
                $product->decrement('stock_quantity', $item['quantity']);

                $itemsToCreate[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'variant_label' => $item['variant_label'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'total_price' => $lineTotal,
                ];
            }

            // Coupon calculation
            $discount = 0;
            if (!empty($validated['coupon_code'])) {
                $coupon = Coupon::where('code', strtoupper($validated['coupon_code']))->first();
                if ($coupon && $coupon->isValidForAmount($subtotal)) {
                    $discount = $coupon->calculateDiscount($subtotal);
                    $coupon->increment('usage_count');
                }
            }

            // Delivery charge calculation
            $baseDelivery = $validated['delivery_zone'] === 'inside_dhaka' ? $insideDhaka : $outsideDhaka;
            $deliveryCharge = $subtotal >= $freeThreshold ? 0.00 : $baseDelivery;
            $total = max(0, $subtotal - $discount + $deliveryCharge);

            // Create Order
            $order = Order::create([
                'user_id' => auth()->id(),
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'],
                'division' => $validated['division'],
                'district' => $validated['district'],
                'upazila' => $validated['upazila'],
                'full_address' => $validated['full_address'],
                'notes' => $validated['notes'],
                'subtotal' => $subtotal,
                'discount' => $discount,
                'coupon_code' => $validated['coupon_code'] ?? null,
                'delivery_charge' => $deliveryCharge,
                'total' => $total,
                'payment_method' => $validated['payment_method'],
                'payment_status' => !empty($validated['payment_transaction_id']) ? 'paid' : 'pending',
                'payment_transaction_id' => $validated['payment_transaction_id'] ?? null,
                'order_status' => 'pending',
            ]);

            // Save items
            foreach ($itemsToCreate as $it) {
                $order->items()->create($it);
            }

            // Create initial status log
            $order->statusHistories()->create([
                'status' => 'pending',
                'note' => "Order placed via website checkout with {$validated['payment_method']}",
            ]);

            // Clear session cart
            session()->forget('cart');

            return redirect()->route('order.track', ['query' => $order->order_number])
                ->with('success', "Order #{$order->order_number} confirmed successfully!");
        });
    }
}
