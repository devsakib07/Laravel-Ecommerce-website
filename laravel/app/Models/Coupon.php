<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'discount_type',
        'discount_amount',
        'min_spend',
        'max_discount',
        'usage_limit',
        'usage_count',
        'expiry_date',
        'is_active'
    ];

    protected $casts = [
        'discount_amount' => 'decimal:2',
        'min_spend' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'is_active' => 'boolean',
        'expiry_date' => 'date',
    ];

    public function isValidForAmount(float $subtotal): bool
    {
        if (!$this->is_active) return false;
        if ($this->expiry_date < now()->startOfDay()) return false;
        if ($this->usage_count >= $this->usage_limit) return false;
        if ($subtotal < $this->min_spend) return false;
        return true;
    }

    public function calculateDiscount(float $subtotal): float
    {
        if ($this->discount_type === 'percent') {
            $disc = ($subtotal * $this->discount_amount) / 100;
            if ($this->max_discount && $disc > $this->max_discount) {
                return $this->max_discount;
            }
            return round($disc, 2);
        }
        return min($this->discount_amount, $subtotal);
    }
}
