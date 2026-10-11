<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\View\View;

class HomeController extends Controller
{
    /**
     * Display the dynamic eCommerce homepage matching Ghorer Bazar style
     */
    public function index(): View
    {
        $banners = Banner::where('status', 'active')->orderBy('sort_order')->get();
        $categories = Category::where('status', 'active')->where('is_featured', true)->orderBy('sort_order')->get();
        $brands = Brand::where('status', 'active')->get();
        $testimonials = Testimonial::where('status', 'active')->take(3)->get();

        // 1. Top Selling Products
        $topSelling = Product::active()->where('is_best_selling', true)->take(4)->get();

        // 2. All Natural Honey
        $honeyCategory = Category::where('slug', 'honey')->first();
        $honeyProducts = $honeyCategory ? $honeyCategory->products()->active()->take(5)->get() : collect();

        // 3. Premium Dates
        $datesCategory = Category::where('slug', 'dates')->first();
        $datesProducts = $datesCategory ? $datesCategory->products()->active()->take(5)->get() : collect();

        // 4. Cooking Essentials
        $cookingProducts = Product::active()
            ->whereHas('category', function ($q) {
                $q->whereIn('slug', ['spices', 'oil-and-ghee', 'flours-and-lentils']);
            })
            ->take(5)
            ->get();

        // 5. Organic Certified
        $organicCategory = Category::where('slug', 'organic')->first();
        $organicProducts = $organicCategory ? $organicCategory->products()->active()->take(5)->get() : collect();

        // 6. Just For You
        $justForYouProducts = Product::active()->inRandomOrder()->take(10)->get();

        return view('home', compact(
            'banners',
            'categories',
            'brands',
            'testimonials',
            'topSelling',
            'honeyProducts',
            'datesProducts',
            'cookingProducts',
            'organicProducts',
            'justForYouProducts'
        ));
    }
}
