<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'division',
        'district',
        'upazila',
        'full_address',
        'notes',
        'subtotal',
        'discount',
        'coupon_code',
        'delivery_charge',
        'total',
        'payment_method',
        'payment_status',
        'payment_transaction_id',
        'order_status'
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'delivery_charge' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->orderBy('created_at', 'asc');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Boot helper to generate unique order number on creation
     */
    protected static function booted()
    {
        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $dateStr = now()->format('Ymd');
                $count = static::whereDate('created_at', today())->count() + 1;
                $order->order_number = 'ORD-' . $dateStr . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
            }
        });
    }
}
