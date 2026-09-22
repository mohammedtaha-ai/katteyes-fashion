<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'category_slug' => 'فساتين-سهرة',
                'name' => 'فستان سهرة كحلي بتطريز كريستال',
                'slug' => 'فستان-سهرة-كحلي-مطرز',
                'description' => 'فستان سهرة أنيق بلون كحلي ملكي وقماش تفته فاخر، مطرز بأحجار الكريستال البراقة عند الصدر والأكتاف ليمنحك إطلالة ساحرة في مناسباتك الخاصة.',
                'price' => 55000.00,
                'currency' => 'YER',
                'is_active' => true,
                'colors' => ['كحلي', 'أسود', 'عنابي'],
                'sizes' => ['S', 'M', 'L', 'XL'],
                'images' => [
                    'https://picsum.photos/seed/fashion-evening-navy-1/600/800',
                    'https://picsum.photos/seed/fashion-evening-navy-2/600/800',
                ],
            ],
            [
                'category_slug' => 'فساتين-سهرة',
                'name' => 'فستان سواريه حرير ذهبي راقي',
                'slug' => 'فستان-سهرة-حرير-ذهبي',
                'description' => 'فستان سهرة انسيابي من الحرير الطبيعي مع لمسات ذهبية ناعمة وقصة كلوش ملكية تبرز جمال القوام وأناقة الحضور.',
                'price' => 62000.00,
                'currency' => 'YER',
                'is_active' => true,
                'colors' => ['ذهبي', 'شامبين', 'وردي'],
                'sizes' => ['S', 'M', 'L'],
                'images' => [
                    'https://picsum.photos/seed/fashion-evening-gold-1/600/800',
                    'https://picsum.photos/seed/fashion-evening-gold-2/600/800',
                ],
            ],
            [
                'category_slug' => 'عبايات-خليجية',
                'name' => 'عباية كريب ملكي بتطريز يدوي أسود',
                'slug' => 'عباية-كريب-ملكي-تطريز-يدوي',
                'description' => 'عباية خليجية مصممة من قماش الكريب الملكي الفاخر مع شك وتطريز يدوي متقن على الأكمام، مصحوبة بطرحة متناسقة.',
                'price' => 38000.00,
                'currency' => 'YER',
                'is_active' => true,
                'colors' => ['أسود ملكي', 'رمادي داكن'],
                'sizes' => ['52', '54', '56', '58'],
                'images' => [
                    'https://picsum.photos/seed/fashion-abaya-crepe-1/600/800',
                    'https://picsum.photos/seed/fashion-abaya-crepe-2/600/800',
                ],
            ],
            [
                'category_slug' => 'عبايات-خليجية',
                'name' => 'عباية كاجوال بياقة رسمية وجيوب',
                'slug' => 'عباية-كاجوال-بياقة-رسمية',
                'description' => 'عباية يومية عصرية بتصميم عملي مستوحى من قصة البليزر مع جيوب جانبية مخفية وأزرار أنيقة، مثالية للعمل والجامعة.',
                'price' => 29000.00,
                'currency' => 'YER',
                'is_active' => true,
                'colors' => ['كحلي', 'زيتي', 'بيج'],
                'sizes' => ['52', '54', '56', '58'],
                'images' => [
                    'https://picsum.photos/seed/fashion-abaya-blazer-1/600/800',
                    'https://picsum.photos/seed/fashion-abaya-blazer-2/600/800',
                ],
            ],
            [
                'category_slug' => 'ملابس-كاجوال',
                'name' => 'طقم كتان صيفي قطعتين واسع',
                'slug' => 'طقم-كتان-صيفي-قطعتين',
                'description' => 'طقم كاجوال مريح مكون من قميص كتان واسع وبنطال بقصة مستقيمة، مصنوع من ألياف الكتان الطبيعية المهدئة للحرارة.',
                'price' => 22000.00,
                'currency' => 'YER',
                'is_active' => true,
                'colors' => ['أبيض', 'بيج رملي', 'أخضر ميرمية'],
                'sizes' => ['S', 'M', 'L', 'XL'],
                'images' => [
                    'https://picsum.photos/seed/fashion-casual-linen-1/600/800',
                    'https://picsum.photos/seed/fashion-casual-linen-2/600/800',
                ],
            ],
            [
                'category_slug' => 'ملابس-كاجوال',
                'name' => 'فستان ميدي قطني بنقشة موردة',
                'slug' => 'فستان-ميدي-قطني-مورد',
                'description' => 'فستان قطني كاجوال خفيف بنقشة زهور رقيقة وأكمام متوسطة الطول مع حزام خصر قماشي أنيق.',
                'price' => 19500.00,
                'currency' => 'YER',
                'is_active' => true,
                'colors' => ['وردي فاتح', 'أزرق سماوي'],
                'sizes' => ['S', 'M', 'L'],
                'images' => [
                    'https://picsum.photos/seed/fashion-casual-floral-1/600/800',
                    'https://picsum.photos/seed/fashion-casual-floral-2/600/800',
                ],
            ],
            [
                'category_slug' => 'أحذية-وحقائب',
                'name' => 'حقيبة يد جلدية فاخرة بقفل ذهبي',
                'slug' => 'حقيبة-يد-جلدية-فاخرة',
                'description' => 'حقيبة يد مصنوعة من أجود أنواع الجلود المعالجة مع مقبض علوي وحزام كتف قابل للفصل وقفل ذهبي أنيق ومساحة داخلية واسعة.',
                'price' => 27000.00,
                'currency' => 'YER',
                'is_active' => true,
                'colors' => ['أسود', 'بني هافان', 'عاجي'],
                'sizes' => ['قياس موحد'],
                'images' => [
                    'https://picsum.photos/seed/fashion-bag-leather-1/600/800',
                    'https://picsum.photos/seed/fashion-bag-leather-2/600/800',
                ],
            ],
            [
                'category_slug' => 'أحذية-وحقائب',
                'name' => 'حذاء كعب عالي كلاسيكي شمواه',
                'slug' => 'حذاء-كعب-عالي-شمواه',
                'description' => 'حذاء رسمي بكعب مريح وقماش شمواه فاخر ومقدمة مدببة تناسب فساتين السهرة والمناسبات الرسمية بكل ثقة.',
                'price' => 21000.00,
                'currency' => 'YER',
                'is_active' => true,
                'colors' => ['أسود', 'نيود', 'أحمر قاني'],
                'sizes' => ['37', '38', '39', '40'],
                'images' => [
                    'https://picsum.photos/seed/fashion-shoes-heels-1/600/800',
                    'https://picsum.photos/seed/fashion-shoes-heels-2/600/800',
                ],
            ],
            [
                'category_slug' => 'إكسسوارات',
                'name' => 'طقم مجوهرات مطلي بالذهب والزركون',
                'slug' => 'طقم-مجوهرات-مطلية-بالذهب',
                'description' => 'طقم مجوهرات نسائي راقي مكون من قلادة وأقراط وخاتم مرصع بأحجار الزركون اللامعة ومطلي بالذهب عيار 18 المقاوم للتغير.',
                'price' => 14000.00,
                'currency' => 'YER',
                'is_active' => true,
                'colors' => ['ذهبي', 'فضي'],
                'sizes' => ['قياس موحد'],
                'images' => [
                    'https://picsum.photos/seed/fashion-jewelry-gold-1/600/800',
                    'https://picsum.photos/seed/fashion-jewelry-gold-2/600/800',
                ],
            ],
            [
                'category_slug' => 'إكسسوارات',
                'name' => 'وشاح حريري كشميري بتطريز تراثي',
                'slug' => 'وشاح-حريري-تراثي-فاخر',
                'description' => 'شال وشاح فاخر من مزيج الحرير والكشمير الناعم مع نقوش شرقية تقليدية على الأطراف لإضفاء لمسة فخامة على أي إطلالة.',
                'price' => 9500.00,
                'currency' => 'YER',
                'is_active' => true,
                'colors' => ['بيج مطرز', 'كحلي وذهبي', 'زيتي'],
                'sizes' => ['قياس موحد'],
                'images' => [
                    'https://picsum.photos/seed/fashion-scarf-silk-1/600/800',
                    'https://picsum.photos/seed/fashion-scarf-silk-2/600/800',
                ],
            ],
        ];

        foreach ($products as $item) {
            $category = Category::where('slug', $item['category_slug'])->first();

            if (!$category) {
                continue;
            }

            $product = Product::firstOrCreate(
                ['slug' => $item['slug']],
                [
                    'category_id' => $category->id,
                    'name' => $item['name'],
                    'slug' => $item['slug'],
                    'description' => $item['description'],
                    'price' => $item['price'],
                    'currency' => $item['currency'],
                    'is_active' => $item['is_active'],
                ]
            );

            foreach ($item['colors'] as $sortOrder => $color) {
                $product->options()->firstOrCreate(
                    ['type' => 'color', 'value' => $color],
                    ['sort_order' => $sortOrder]
                );
            }

            foreach ($item['sizes'] as $sortOrder => $size) {
                $product->options()->firstOrCreate(
                    ['type' => 'size', 'value' => $size],
                    ['sort_order' => $sortOrder]
                );
            }

            foreach ($item['images'] as $sortOrder => $imagePath) {
                $product->images()->firstOrCreate(
                    ['path' => $imagePath],
                    ['sort_order' => $sortOrder]
                );
            }
        }
    }
}
