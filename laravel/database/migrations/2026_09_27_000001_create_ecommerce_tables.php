<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Roles & Permissions
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('display_name');
            $table->timestamps();
        });

        // 2. Categories
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_bn')->nullable();
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->string('image')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->index(['slug', 'status', 'is_featured']);
        });

        // 3. Brands
        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('logo')->nullable();
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        // 4. Products
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_bn')->nullable();
            $table->string('slug')->unique();
            $table->string('sku')->unique();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('brand_id')->nullable()->constrained()->nullOnDelete();
            $table->text('short_description')->nullable();
            $table->longText('full_description')->nullable();
            $table->decimal('regular_price', 10, 2);
            $table->decimal('sale_price', 10, 2);
            $table->integer('discount_percent')->default(0);
            $table->integer('stock_quantity')->default(0);
            $table->enum('stock_status', ['in_stock', 'low_stock', 'out_of_stock'])->default('in_stock');
            $table->string('weight')->default('500g');
            $table->string('unit')->default('Jar');
            $table->string('image');
            $table->json('gallery')->nullable();
            $table->json('tags')->nullable();
            $table->json('specifications')->nullable();
            $table->text('ingredients')->nullable();
            $table->json('nutrition')->nullable();
            $table->text('shipping_info')->nullable();
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_best_selling')->default(false);
            $table->boolean('is_new_arrival')->default(false);
            $table->boolean('is_recommended')->default(false);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->integer('reviews_count')->default(0);
            $table->timestamps();

            $table->index(['category_id', 'status', 'sale_price']);
            $table->index(['is_best_selling', 'is_featured']);
        });

        // 5. Product Variants
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('sku')->unique();
            $table->string('attribute_name'); // Weight, Pack
            $table->string('attribute_value'); // 500g, 1kg
            $table->decimal('price', 10, 2);
            $table->decimal('regular_price', 10, 2)->nullable();
            $table->integer('stock_quantity')->default(0);
            $table->string('image')->nullable();
            $table->timestamps();
        });

        // 6. Coupons
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->enum('discount_type', ['percent', 'fixed'])->default('percent');
            $table->decimal('discount_amount', 10, 2);
            $table->decimal('min_spend', 10, 2)->default(0);
            $table->decimal('max_discount', 10, 2)->nullable();
            $table->integer('usage_limit')->default(100);
            $table->integer('usage_count')->default(0);
            $table->date('expiry_date');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 7. Orders
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_email')->nullable();
            $table->string('customer_phone');
            $table->string('division');
            $table->string('district');
            $table->string('upazila')->nullable();
            $table->text('full_address');
            $table->text('notes')->nullable();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('discount', 10, 2)->default(0);
            $table->string('coupon_code')->nullable();
            $table->decimal('delivery_charge', 10, 2)->default(70);
            $table->decimal('total', 10, 2);
            $table->enum('payment_method', ['cod', 'bkash', 'nagad', 'card'])->default('cod');
            $table->enum('payment_status', ['pending', 'paid', 'failed'])->default('pending');
            $table->string('payment_transaction_id')->nullable();
            $table->enum('order_status', [
                'pending',
                'confirmed',
                'processing',
                'packed',
                'shipped',
                'out_for_delivery',
                'delivered',
                'cancelled',
                'returned',
                'refunded'
            ])->default('pending');
            $table->timestamps();

            $table->index(['order_number', 'customer_phone']);
            $table->index(['order_status', 'created_at']);
        });

        // 8. Order Items
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained();
            $table->string('product_name');
            $table->string('variant_label')->nullable();
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->timestamps();
        });

        // 9. Order Status History Timeline
        Schema::create('order_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('status');
            $table->text('note')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();
        });

        // 10. Reviews
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_email')->nullable();
            $table->integer('rating')->default(5);
            $table->text('comment');
            $table->boolean('is_verified')->default(true);
            $table->boolean('is_approved')->default(true);
            $table->timestamps();
        });

        // 11. Banners
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->string('image_desktop');
            $table->string('image_mobile')->nullable();
            $table->string('button_text')->default('Shop Now');
            $table->string('button_url')->default('/shop');
            $table->enum('position', ['hero_main', 'hero_side', 'middle_promo', 'footer_promo'])->default('hero_main');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 12. Testimonials
        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('customer_name');
            $table->string('customer_role');
            $table->string('customer_photo')->nullable();
            $table->integer('rating')->default(5);
            $table->text('comment');
            $table->text('comment_bn')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        // 13. Settings Key-Value Store
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('testimonials');
        Schema::dropIfExists('banners');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('order_status_histories');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('products');
        Schema::dropIfExists('brands');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('roles');
    }
};
