const { run, query } = require('./database');

async function seed() {
  try {
    // Check if data already exists
    const existingCategories = await query('SELECT COUNT(*) as count FROM categories');
    if (existingCategories[0].count > 0) {
      console.log('Database already seeded!');
      return;
    }

    console.log('Seeding database...');

    // Insert categories
    const categories = [
      { name: 'إلكترونيات', name_en: 'Electronics', image: 'https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=400' },
      { name: 'أزياء', name_en: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400' },
      { name: 'المنزل والمطبخ', name_en: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400' },
      { name: 'الجمال', name_en: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400' },
      { name: 'الرياضة', name_en: 'Sports', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400' },
      { name: 'الأطفال', name_en: 'Kids', image: 'https://images.unsplash.com/photo-1560506840-ec148e82a604?w=400' },
      { name: 'السوبر ماركت', name_en: 'Supermarket', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' },
    ];

    for (const cat of categories) {
      await run(
        'INSERT INTO categories (name, name_en, image) VALUES (?, ?, ?)',
        [cat.name, cat.name_en, cat.image]
      );
    }
    console.log('✅ Categories seeded');

    // Insert products
    const products = [
      { name: 'آيفون 15 برو ماكس', name_en: 'iPhone 15 Pro Max', description: 'أحدث هاتف آيفون مع كاميرا متطورة', description_en: 'Latest iPhone with advanced camera', price: 4599, old_price: 5099, image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400', category_id: 1, rating: 4.8, reviews: 234, badge: 'الأكثر مبيعاً', badge_en: 'Best Seller', is_new: 0, is_best_seller: 1, stock: 50 },
      { name: 'سماعات لاسلكية فاخرة', name_en: 'Premium Wireless Headphones', description: 'صوت عالي الجودة مع عزل الضوضاء', description_en: 'High quality sound with noise cancellation', price: 299, old_price: 449, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', category_id: 1, rating: 4.6, reviews: 189, badge: 'خصم', badge_en: 'Sale', is_new: 0, is_best_seller: 0, stock: 120 },
      { name: 'ساعة ذكية متطورة', name_en: 'Advanced Smartwatch', description: 'تتبع اللياقة والإشعارات', description_en: 'Fitness tracking and notifications', price: 459, old_price: 599, image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400', category_id: 1, rating: 4.5, reviews: 156, badge: null, badge_en: null, is_new: 1, is_best_seller: 0, stock: 80 },
      { name: 'ماك بوك برو', name_en: 'MacBook Pro', description: 'حاسوب محمول احترافي', description_en: 'Professional laptop', price: 5499, old_price: null, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', category_id: 1, rating: 4.9, reviews: 89, badge: 'مميز', badge_en: 'Featured', is_new: 0, is_best_seller: 0, stock: 30 },
      { name: 'فستان أنيق', name_en: 'Elegant Dress', description: 'فستان سهرة فاخر', description_en: 'Luxury evening dress', price: 349, old_price: 499, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', category_id: 2, rating: 4.4, reviews: 67, badge: 'خصم', badge_en: 'Sale', is_new: 0, is_best_seller: 0, stock: 45 },
      { name: 'قميص رجالي فاخر', name_en: 'Premium Men Shirt', description: 'قميص قطني 100%', description_en: '100% cotton shirt', price: 149, old_price: null, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', category_id: 2, rating: 4.3, reviews: 112, badge: null, badge_en: null, is_new: 0, is_best_seller: 0, stock: 200 },
      { name: 'حذاء رياضي خفيف', name_en: 'Lightweight Sports Shoes', description: 'راحة فائقة للجري والمشي', description_en: 'Maximum comfort for running and walking', price: 279, old_price: 359, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', category_id: 2, rating: 4.7, reviews: 298, badge: 'الأكثر مبيعاً', badge_en: 'Best Seller', is_new: 0, is_best_seller: 1, stock: 85 },
      { name: 'ماكينة قهوة احترافية', name_en: 'Professional Coffee Machine', description: 'تحضير القهوة مثل المحترفين', description_en: 'Make coffee like professionals', price: 899, old_price: 1199, image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400', category_id: 3, rating: 4.6, reviews: 78, badge: 'خصم', badge_en: 'Sale', is_new: 0, is_best_seller: 0, stock: 40 },
      { name: 'طقم أواني طهي', name_en: 'Cookware Set', description: 'طقم كامل من الأواني غير اللاصقة', description_en: 'Complete non-stick cookware set', price: 349, old_price: null, image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400', category_id: 3, rating: 4.5, reviews: 134, badge: null, badge_en: null, is_new: 0, is_best_seller: 0, stock: 60 },
      { name: 'مجموعة عناية بالبشرة', name_en: 'Skincare Set', description: 'مجموعة كاملة للعناية اليومية', description_en: 'Complete daily skincare routine', price: 199, old_price: 279, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', category_id: 4, rating: 4.7, reviews: 245, badge: 'الأكثر مبيعاً', badge_en: 'Best Seller', is_new: 0, is_best_seller: 1, stock: 150 },
      { name: 'عطر فاخر', name_en: 'Luxury Perfume', description: 'عطر مستورد فاخر', description_en: 'Imported luxury fragrance', price: 459, old_price: null, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400', category_id: 4, rating: 4.8, reviews: 89, badge: 'مميز', badge_en: 'Featured', is_new: 0, is_best_seller: 0, stock: 55 },
      { name: 'أجهزة رياضية منزلية', name_en: 'Home Gym Equipment', description: 'مجموعة أجهزة رياضية للمنزل', description_en: 'Home gym equipment set', price: 1299, old_price: 1599, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400', category_id: 5, rating: 4.4, reviews: 45, badge: 'خصم', badge_en: 'Sale', is_new: 0, is_best_seller: 0, stock: 25 },
      { name: 'لعبة تعليمية للأطفال', name_en: 'Educational Toy', description: 'لعبة تعليمية تفاعلية', description_en: 'Interactive educational toy', price: 89, old_price: null, image: 'https://images.unsplash.com/photo-1560506840-ec148e82a604?w=400', category_id: 6, rating: 4.5, reviews: 167, badge: null, badge_en: null, is_new: 1, is_best_seller: 0, stock: 100 },
      { name: 'زيت زيتون عضوي', name_en: 'Organic Olive Oil', description: 'زيت زيتون عضوي بكر ممتاز', description_en: 'Extra virgin organic olive oil', price: 49, old_price: null, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', category_id: 7, rating: 4.6, reviews: 312, badge: null, badge_en: null, is_new: 0, is_best_seller: 0, stock: 500 },
      { name: 'أرز بسمتي', name_en: 'Basmati Rice', description: 'أرز بسمتي هندي فاخر 5 كجم', description_en: 'Premium Indian basmati rice 5kg', price: 35, old_price: 45, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', category_id: 7, rating: 4.3, reviews: 478, badge: 'خصم', badge_en: 'Sale', is_new: 0, is_best_seller: 0, stock: 1000 },
    ];

    for (const prod of products) {
      await run(
        `INSERT INTO products (name, name_en, description, description_en, price, old_price, image, category_id, rating, reviews, badge, badge_en, is_new, is_best_seller, stock) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [prod.name, prod.name_en, prod.description, prod.description_en, prod.price, prod.old_price, prod.image, prod.category_id, prod.rating, prod.reviews, prod.badge, prod.badge_en, prod.is_new, prod.is_best_seller, prod.stock]
      );
    }
    console.log('✅ Products seeded');

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Seed error:', error);
  }
}

module.exports = { seed };
