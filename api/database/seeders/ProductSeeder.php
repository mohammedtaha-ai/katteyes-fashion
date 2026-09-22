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
                'description' => 'فستان سهرة ملكي بقماش التفته الفاخر باللون الكحلي الداكن، مرصع بأحجار الكريستال البراقة عند الصدر والياقة مع حزام خصر رفيع يمنحك حضوراً استثنائياً في السهرات والمناسبات الراقية.',
                'price' => 55000.00,
                'currency' => 'YER',
                'is_active' => true,
                'colors' => ['كحلي ملكي', 'أسود فاحم', 'عنابي دافئ'],
                'sizes' => ['S', 'M', 'L', 'XL'],
                'images' => [
                    'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
                ],
            ],
            [
                'category_slug' => 'فساتين-سهرة',
                'name' => 'فستان سواريه حرير ذهبي راقي',
                'slug' => 'فستان-سهرة-حرير-ذهبي',
                'description' => 'فستان سهرة انسيابي من الحرير الطبيعي الخالص بلمسات ذهبية متلألئة وقصة كلوش انسيابية فاخرة تبرز جمال القوام وأناقة الإطلالة.',
                'price' => 62000.00,
                'currency' => 'YER',
                'is_active' => true,
                'colors' => ['ذهبي ملكي', 'شامبين', 'وردي بودري'],
                'sizes' => ['S', 'M', 'L'],
                'images' => [
                    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
                ],
            ],
            [
                'category_slug' => 'فساتين-سهرة',
                'name' => 'قفطان مخملي ملكي مطرز بخيوط ذهبية',
                'slug' => 'قفطان-مخملي-ملكي-مطرز',
                'description' => 'قفطان فاخر من قماش المخمل الناعم بتطريزات شرقية يدوية معقدة بخيوط الصقلي الذهبية ومزين بحزام خصر مجدول.',
                'price' => 74000.00,
                'currency' => 'YER',
                'is_active' => true,
                'colors' => ['زمردي أخضر', 'عنابي ملكي', 'كحلي داكن'],
                'sizes' => ['M', 'L', 'XL'],
                'images' => [
                    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
                ],
            ],
            [
                'category_slug' => 'عبايات-خليجية',
                'name' => 'عباية كريب ملكي بتطريز يدوي أسود',
                'slug' => 'عباية-كريب-ملكي-تطريز-يدوي',
                'description' => 'عباية خليجية أنيقة محاكة من قماش الكريب الملكي غير الشفاف مع شك وتطريز يدوي على الأكمام، مصحوبة بطرحة شيفون متناسقة.',
                'price' => 38000.00,
                'currency' => 'YER',
                'is_active' => true,
                'colors' => ['أسود ملكي', 'كحلي ليلي'],
                'sizes' => ['52', '54', '56', '58'],
                'images' => [
                    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
                ],
            ],
            [
                'category_slug' => 'عبايات-خليجية',
                'name' => 'عباية كاجوال بياقة رسمية وجيوب مخفية',
                'slug' => 'عباية-كاجوال-بياقة-رسمية',
                'description' => 'تصميم عصري يجمع بين عملية المعطف وأناقة العباية بياقة بليزر أنيقة وأزرار مخفية وجيوب مريحة، مثالية للعمل والجامعة.',
                'price' => 29000.00,
                'currency' => 'YER',
                'is_active' => true,
                'colors' => ['كحلي داكن', 'رمادي رصاصي', 'بيج دافئ'],
                'sizes' => ['52', '54', '56', '58'],
                'images' => [
                    'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
                ],
            ],
            [
                'category_slug' => 'عبايات-خليجية',
                'name' => 'عباية بشت واسعة من الحرير المغسول',
                'slug' => 'عباية-بشت-حرير-مغسول',
                'description' => 'عباية بقصة البشت الخليجية الفضفاضة، خفيفة وباردة بقماش حرير مغسول ناعم مع أطراف مطعمة باللون الذهبي المطفي.',
                'price' => 45000.00,
                'currency' => 'YER',
                'is_active' => true,
                'colors' => ['أسود فاحم', 'زيتي زيتوني', 'بني قهوة'],
                'sizes' => ['54', '56', '58'],
                'images' => [
                    'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
                ],
            ],
            [
                'category_slug' => 'ملابس-كاجوال',
                'name' => 'طقم كتان صيفي قطعتين واسع وأنيق',
                'slug' => 'طقم-كتان-صيفي-قطعتين',
                'description' => 'طقم كاجوال فاخر مكون من قميص كتان بقصة فضفاضة وبنطال مريح بخصر مطاطي، مصنوع من ألياف الكتان الطبيعي الفاخر.',
                'price' => 22000.00,
                'currency' => 'YER',
                'is_active' => true,
                'colors' => ['أبيض ناصع', 'بيج رملي', 'أخضر ميرمية'],
                'sizes' => ['S', 'M', 'L', 'XL'],
                'images' => [
                    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
                ],
            ],
            [
                'category_slug' => 'ملابس-كاجوال',
                'name' => 'فستان ميدي قطني بنقشة زهور أنثوية',
                'slug' => 'فستان-ميدي-قطني-مورد',
                'description' => 'فستان صيفي ناعم بنقوش زهور رقيقة وأكمام منفوخة خفيفة مع حزام قماشي محدد للخصر، يمنحك إطلالة منعشة وحيوية.',
                'price' => 19500.00,
                'currency' => 'YER',
                'is_active' => true,
                'colors' => ['وردي فاتح', 'أزرق سماوي', 'أصفر ليموني'],
                'sizes' => ['S', 'M', 'L'],
                'images' => [
                    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=80',
                ],
            ],
            [
                'category_slug' => 'أحذية-وحقائب',
                'name' => 'حقيبة يد جلدية فاخرة بقفل ذهبي دوار',
                'slug' => 'حقيبة-يد-جلدية-فاخرة',
                'description' => 'حقيبة كتف ويد مصنوعة من أجود أنواع الجلد الإيطالي المعالج مع تفاصيل معدنية مطلية بالذهب وقفل أمان أنيق.',
                'price' => 27000.00,
                'currency' => 'YER',
                'is_active' => true,
                'colors' => ['أسود كلاسيك', 'بني جملي', 'عاجي'],
                'sizes' => ['قياس موحد'],
                'images' => [
                    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
                ],
            ],
            [
                'category_slug' => 'أحذية-وحقائب',
                'name' => 'حذاء كعب عالي كلاسيكي شمواه أسود',
                'slug' => 'حذاء-كعب-عالي-شمواه',
                'description' => 'حذاء سهرة أنيق بكعب رفيع متوازن ونعل داخلي مريح من الشمواه المخملي الفاخر، مصمم ليكمل فساتين السهرة بأبهى حلة.',
                'price' => 21000.00,
                'currency' => 'YER',
                'is_active' => true,
                'colors' => ['أسود ملكي', 'بيج نيود', 'أحمر قاني'],
                'sizes' => ['37', '38', '39', '40'],
                'images' => [
                    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=800&q=80',
                ],
            ],
            [
                'category_slug' => 'إكسسوارات',
                'name' => 'طقم مجوهرات مطلي بالذهب ومرصع بالزركون',
                'slug' => 'طقم-مجوهرات-مطلية-بالذهب',
                'description' => 'طقم متكامل يتكون من عقد راقي وأقراط وخاتم قابل للتعديل، مطلي بالذهب عيار 18 المقاوم للبهتان مع بريق أحجار الزركون الشبيهة بالألماس.',
                'price' => 14000.00,
                'currency' => 'YER',
                'is_active' => true,
                'colors' => ['ذهبي لامع', 'فضي بلاتيني'],
                'sizes' => ['قياس موحد'],
                'images' => [
                    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
                ],
            ],
            [
                'category_slug' => 'إكسسوارات',
                'name' => 'وشاح حريري كشميري بتطريز تراثي فاخر',
                'slug' => 'وشاح-حريري-تراثي-فاخر',
                'description' => 'شال منسوج من مزيج الحرير والكشمير النقي بتطريزات يدوية مستوحاة من التراث الشرقي، خفيف الوزن ودافئ الملمس.',
                'price' => 9500.00,
                'currency' => 'YER',
                'is_active' => true,
                'colors' => ['بيج ذهبي', 'كحلي وسلفر', 'زيتي كلاسيك'],
                'sizes' => ['قياس موحد'],
                'images' => [
                    'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=800&q=80',
                ],
            ],
        ];

        foreach ($products as $item) {
            $category = Category::where('slug', $item['category_slug'])->first();

            if (!$category) {
                continue;
            }

            $product = Product::updateOrCreate(
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

            // Sync Options
            $product->options()->delete();
            foreach ($item['colors'] as $sortOrder => $color) {
                $product->options()->create([
                    'type' => 'color',
                    'value' => $color,
                    'sort_order' => $sortOrder,
                ]);
            }

            foreach ($item['sizes'] as $sortOrder => $size) {
                $product->options()->create([
                    'type' => 'size',
                    'value' => $size,
                    'sort_order' => $sortOrder,
                ]);
            }

            // Sync Images (clean purge old nature/ocean images and set curated luxury fashion URLs)
            $product->images()->delete();
            foreach ($item['images'] as $sortOrder => $imagePath) {
                $product->images()->create([
                    'path' => $imagePath,
                    'sort_order' => $sortOrder,
                ]);
            }
        }
    }
}
