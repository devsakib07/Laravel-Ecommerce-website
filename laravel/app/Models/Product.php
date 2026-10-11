<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'name_bn',
        'slug',
        'sku',
        'category_id',
        'brand_id',
        'short_description',
        'full_description',
        'regular_price',
        'sale_price',
        'discount_percent',
        'stock_quantity',
        'stock_status',
        'weight',
        'unit',
        'image',
        'gallery',
        'tags',
        'specifications',
        'ingredients',
        'nutrition',
        'shipping_info',
        'seo_title',
        'seo_description',
        'is_featured',
        'is_best_selling',
        'is_new_arrival',
        'is_recommended',
        'status',
        'rating',
        'reviews_count'
    ];

    protected $casts = [
        'gallery' => 'array',
        'tags' => 'array',
        'specifications' => 'array',
        'nutrition' => 'array',
        'regular_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'is_featured' => 'boolean',
        'is_best_selling' => 'boolean',
        'is_new_arrival' => 'boolean',
        'is_recommended' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class)->where('is_approved', true);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeBestSelling($query)
    {
        return $query->where('is_best_selling', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}
