# Shuddho Bazar - Laravel 11/12 Pure & Organic Grocery eCommerce

A professional, production-ready Bangladesh-based organic food and natural grocery eCommerce platform built with Laravel 11/12 and Tailwind CSS, inspired by the high-converting design layout of Ghorer Bazar.

---

## 1. Complete Project Structure

```text
shuddho-bazar/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── HomeController.php
│   │   │   ├── ProductController.php
│   │   │   ├── CartController.php
│   │   │   ├── CheckoutController.php
│   │   │   ├── OrderTrackingController.php
│   │   │   └── Admin/
│   │   │       ├── DashboardController.php
│   │   │       ├── ProductController.php
│   │   │       ├── OrderController.php
│   │   │       ├── CouponController.php
│   │   │       └── SettingController.php
│   │   ├── Middleware/
│   │   │   └── AdminMiddleware.php
│   │   └── Requests/
│   │       ├── CheckoutRequest.php
│   │       └── ProductRequest.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Product.php
│   │   ├── ProductVariant.php
│   │   ├── Category.php
│   │   ├── Brand.php
│   │   ├── Order.php
│   │   ├── OrderItem.php
│   │   ├── OrderStatusHistory.php
│   │   ├── Coupon.php
│   │   ├── Review.php
│   │   ├── Banner.php
│   │   ├── Testimonial.php
│   │   └── Setting.php
│   └── Services/
│       ├── BangladeshDeliveryService.php
│       └── PaymentGatewayService.php
├── config/
│   ├── app.php
│   ├── database.php
│   └── services.php
├── database/
│   ├── migrations/
│   │   └── 2026_09_27_000001_create_ecommerce_tables.php
│   └── seeders/
│       ├── DatabaseSeeder.php
│       └── ShuddhoBazarDemoSeeder.php
├── resources/
│   └── views/
│       ├── layouts/
│       │   ├── app.blade.php
│       │   └── admin.blade.php
│       ├── components/
│       │   ├── header.blade.php
│       │   ├── product-card.blade.php
│       │   ├── quick-cart.blade.php
│       │   └── footer.blade.php
│       ├── home.blade.php
│       ├── shop.blade.php
│       ├── product.blade.php
│       ├── cart.blade.php
│       ├── checkout.blade.php
│       ├── track-order.blade.php
│       └── admin/
│           ├── dashboard.blade.php
│           ├── orders/
│           │   ├── index.blade.php
│           │   └── invoice.blade.php
│           └── products/
│               ├── index.blade.php
│               └── create.blade.php
├── routes/
│   ├── web.php
│   └── api.php
└── public/
    ├── images/
    ├── css/
    └── js/
```

---

## 2. Installation Instructions

### Prerequisites
- PHP 8.2 or 8.3 with extensions: `BCMath`, `Ctype`, `cURL`, `DOM`, `Fileinfo`, `JSON`, `Mbstring`, `OpenSSL`, `PCRE`, `PDO`, `PDO_MYSQL`, `Tokenizer`, `XML`.
- MySQL 8.0+ or MariaDB 10.4+
- Composer 2.x
- Node.js 18+ and npm

### Step-by-Step Setup
```bash
# 1. Clone the repository
git clone https://github.com/your-org/shuddho-bazar.git
cd shuddho-bazar

# 2. Install PHP Composer dependencies
composer install --optimize-autoloader --no-dev

# 3. Create .env environment file
cp .env.example .env

# 4. Generate application encryption key
php artisan key:generate

# 5. Create storage symlink
php artisan storage:link
```

---

## 3. `.env` Configuration Example

```ini
APP_NAME="Shuddho Bazar"
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=https://shuddhobazar.com

LOG_CHANNEL=stack
LOG_LEVEL=error

# Database Configuration (MySQL)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=shuddho_bazar
DB_USERNAME=shuddho_user
DB_PASSWORD="your_strong_password"

# Queue & Cache
BROADCAST_DRIVER=log
CACHE_DRIVER=file
QUEUE_CONNECTION=database
SESSION_DRIVER=file
SESSION_LIFETIME=120

# Email (SMTP Configuration)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=postmaster@shuddhobazar.com
MAIL_PASSWORD=your_mail_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="order@shuddhobazar.com"
MAIL_FROM_NAME="${APP_NAME}"

# Bangladesh Delivery Rates
DELIVERY_INSIDE_DHAKA=70
DELIVERY_OUTSIDE_DHAKA=130
FREE_DELIVERY_THRESHOLD=2500

# Payment Gateways (MFS)
BKASH_MERCHANT_NUMBER="01844232321"
NAGAD_MERCHANT_NUMBER="01711998877"
COD_ENABLED=true
```

---

## 4. Database Setup

Create the MySQL database and user:
```sql
CREATE DATABASE shuddho_bazar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'shuddho_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON shuddho_bazar.* TO 'shuddho_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 5. Migration Command

Run all migrations to create schema tables:
```bash
php artisan migrate --force
```

---

## 6. Seeder Command

Populate database with 30+ products, categories, brands, coupons, banners, and sample orders:
```bash
php artisan db:seed --force
```

---

## 7. Storage Setup

To allow images uploaded through the admin panel to be served publicly:
```bash
php artisan storage:link
chmod -R 775 storage bootstrap/cache
```

---

## 8. Admin Login Credentials for Demo

- **Admin URL:** `https://your-domain.com/admin`
- **Email:** `admin@shuddhobazar.com`
- **Password:** `admin123`
- **Role:** Super Admin

---

## 9. How to Configure Payment Gateways

1. Navigate to **Admin Dashboard -> Delivery & Gateways (Settings)**.
2. Under **Mobile Financial Services (MFS)**:
   - Enter your active **bKash Merchant Account Number** (e.g. `01844232321`).
   - Enter your active **Nagad Merchant Account Number** (e.g. `01711998877`).
   - Toggle **Cash on Delivery (COD)** on/off.
3. For automated instant API webhooks with bKash PGW (Payment Gateway) or SSLCommerz:
   - Add your App Key, App Secret, and Merchant ID in `config/services.php`.
   - Update IPN webhook URL: `https://your-domain.com/api/payment/bkash/callback`.

---

## 10. How to Configure SMTP

Update your `.env` file with your transactional email credentials:
```ini
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com   # or smtp.mailgun.org / Amazon SES
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="order@shuddhobazar.com"
MAIL_FROM_NAME="Shuddho Bazar"
```
Test using:
```bash
php artisan tinker
Mail::raw('Order system test email', function($msg) { $msg->to('test@domain.com')->subject('Purity Check'); });
```

---

## 11. How to Configure Delivery Charges

1. Inside admin settings or via `.env`:
   - `DELIVERY_INSIDE_DHAKA=70`
   - `DELIVERY_OUTSIDE_DHAKA=130`
   - `FREE_DELIVERY_THRESHOLD=2500`
2. At checkout, if the customer's cart subtotal reaches ৳2,500+, delivery charge automatically calculates as ৳0.00 (FREE).

---

## 12. How to Add Products

1. Log into `/admin` and click **Products & Inventory**.
2. Click **+ Add New Product**.
3. Fill in:
   - Product Title in English (e.g., `Black Seed Honey 1kg`)
   - Product Title in Bangla (e.g., `কালোজিরা ফুলের মধু ১ কেজি`)
   - Category (`Honey`, `Oil & Ghee`, `Dates`, `Spices`, `Organic`)
   - SKU (`HNY-BS-001`)
   - Regular Price (`1800`) and Sale Price (`1600`)
   - Stock Quantity (`50`)
   - Unit (`Jar` / `Bottle` / `Bag`) and Net Weight (`1kg`)
   - Product Description, Ingredients, and Purity Guarantee.
4. Click **Save Product**. The product is instantly indexed in search autocomplete and categorized on the homepage.

---

## 13. How to Manage Orders

1. Open `/admin -> Orders Management`.
2. New orders appear with status `Pending`.
3. Click on any order to view customer shipping address, phone, item list, and total amount.
4. Change status as package moves through the warehouse:
   - `Pending` -> `Confirmed` -> `Processing` -> `Packed` -> `Shipped` -> `Out for Delivery` -> `Delivered`.
   - Every status change logs an audit trail in `order_status_histories`.
5. Click **Invoice & Details** -> **Print Invoice** to print physical packing slips and receipts for courier riders.

---

## 14. How to Deploy on cPanel

1. **Upload Files:** Compress the project folder (excluding `/node_modules` and `/vendor`) and upload to `public_html` or a subfolder.
2. **Move public directory:**
   - Move all files from `public/` to `public_html/`.
   - Update `index.php` paths:
     ```php
     require __DIR__.'/../vendor/autoload.php';
     $app = require_once __DIR__.'/../bootstrap/app.php';
     ```
3. **Set Permissions:**
   - `storage` and `bootstrap/cache` must be writable (`775` or `755`).
4. **Create MySQL Database & User:** Via cPanel MySQL Database Wizard.
5. **Run Migrations via SSH / Terminal in cPanel:**
   ```bash
   php artisan migrate --seed --force
   php artisan storage:link
   ```

---

## 15. Production Deployment Checklist

- [x] Set `APP_ENV=production` and `APP_DEBUG=false` in `.env`.
- [x] Configure SSL certificate (HTTPS) via Let's Encrypt / Cloudflare.
- [x] Cache routes and configuration:
  ```bash
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  ```
- [x] Verify database indexes on `products(category_id, status)` and `orders(order_number)`.
- [x] Run cron job for Laravel scheduler (in cPanel Cron Jobs):
  ```bash
  * * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
  ```
- [x] Verify payment gateway webhooks and transaction ID verification.
- [x] Test complete end-to-end customer order from Homepage -> Product -> Add to Cart -> Checkout -> Track Order.
