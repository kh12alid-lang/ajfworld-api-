require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, seed } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ajfworld-super-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());

// JWT Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

function isAdmin(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// ============ AUTH ROUTES ============

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    
    // Check if email exists
    const existing = db.findOne('users', u => u.email === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = db.insert('users', {
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      password: hashedPassword,
      role: 'customer'
    });
    
    const token = jwt.sign({ id: user.id, email, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      success: true,
      token,
      user: { id: user.id, name, email, phone, role: 'customer' }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = db.findOne('users', u => u.email === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.findOne('users', u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PRODUCT ROUTES ============

// Get all products
app.get('/api/products', (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    let products = db.query('products');
    
    if (category) {
      products = products.filter(p => String(p.category_id) === category);
    }
    
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.name_en && p.name_en.toLowerCase().includes(q))
      );
    }
    
    // Add category info
    products = products.map(p => {
      const cat = db.findOne('categories', c => c.id === p.category_id);
      return { ...p, category_name: cat?.name, category_name_en: cat?.name_en };
    });
    
    const total = products.length;
    const start = (parseInt(page) - 1) * parseInt(limit);
    const paginated = products.slice(start, start + parseInt(limit));
    
    res.json({
      success: true,
      products: paginated,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.findOne('products', p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const cat = db.findOne('categories', c => c.id === product.category_id);
    res.json({ success: true, product: { ...product, category_name: cat?.name, category_name_en: cat?.name_en } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product (Admin)
app.post('/api/products', authenticateToken, isAdmin, (req, res) => {
  try {
    const product = db.insert('products', req.body);
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product (Admin)
app.put('/api/products/:id', authenticateToken, isAdmin, (req, res) => {
  try {
    const product = db.update('products', p => p.id === parseInt(req.params.id), req.body);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product (Admin)
app.delete('/api/products/:id', authenticateToken, isAdmin, (req, res) => {
  try {
    const removed = db.remove('products', p => p.id === parseInt(req.params.id));
    if (!removed) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ CATEGORY ROUTES ============

// Get all categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.query('categories');
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create category (Admin)
app.post('/api/categories', authenticateToken, isAdmin, (req, res) => {
  try {
    const category = db.insert('categories', req.body);
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ORDER ROUTES ============

// Create order
app.post('/api/orders', authenticateToken, (req, res) => {
  try {
    const { items, total, shipping, payment_method, address_id } = req.body;
    const user_id = req.user.id;
    const orderNumber = `AJ-${Date.now().toString(36).toUpperCase()}`;
    
    const order = db.insert('orders', {
      order_number: orderNumber,
      user_id,
      total,
      shipping: shipping || 0,
      payment_method,
      address_id,
      status: 'pending'
    });
    
    // Insert order items
    for (const item of items) {
      db.insert('order_items', {
        order_id: order.id,
        product_id: item.product_id,
        name: item.name,
        name_en: item.name_en,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      });
    }
    
    // Add tracking
    db.insert('tracking', {
      order_id: order.id,
      status: 'pending',
      location: 'Order received'
    });
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user orders
app.get('/api/orders', authenticateToken, (req, res) => {
  try {
    let orders = db.query('orders', o => o.user_id === req.user.id);
    
    // Add items
    orders = orders.map(o => ({
      ...o,
      items: db.query('order_items', i => i.order_id === o.id)
    }));
    
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single order
app.get('/api/orders/:id', authenticateToken, (req, res) => {
  try {
    const order = db.findOne('orders', o => o.id === parseInt(req.params.id) && o.user_id === req.user.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    order.items = db.query('order_items', i => i.order_id === order.id);
    order.tracking = db.query('tracking', t => t.order_id === order.id);
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ TRACKING ============

// Track by order number
app.get('/api/tracking/:orderNumber', (req, res) => {
  try {
    const order = db.findOne('orders', o => o.order_number === req.params.orderNumber);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    const tracking = db.query('tracking', t => t.order_id === order.id);
    
    res.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        estimated_delivery: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
      },
      tracking
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ADDRESS ROUTES ============

app.get('/api/addresses', authenticateToken, (req, res) => {
  try {
    const addresses = db.query('addresses', a => a.user_id === req.user.id);
    res.json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/addresses', authenticateToken, (req, res) => {
  try {
    if (req.body.is_default) {
      db.query('addresses', a => a.user_id === req.user.id).forEach(a => {
        db.update('addresses', x => x.id === a.id, { is_default: 0 });
      });
    }
    const address = db.insert('addresses', { ...req.body, user_id: req.user.id });
    res.json({ success: true, address });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ CART ============

app.get('/api/cart', authenticateToken, (req, res) => {
  try {
    const items = db.query('cart', c => c.user_id === req.user.id);
    const enriched = items.map(item => {
      const product = db.findOne('products', p => p.id === item.product_id);
      return { ...item, name: product?.name, name_en: product?.name_en, price: product?.price, image: product?.image };
    });
    res.json({ success: true, items: enriched });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cart', authenticateToken, (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const existing = db.findOne('cart', c => c.user_id === req.user.id && c.product_id === product_id);
    
    if (existing) {
      db.update('cart', c => c.id === existing.id, { quantity: existing.quantity + quantity });
    } else {
      db.insert('cart', { user_id: req.user.id, product_id, quantity });
    }
    res.json({ success: true, message: 'Added to cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/cart/:id', authenticateToken, (req, res) => {
  try {
    db.update('cart', c => c.id === parseInt(req.params.id) && c.user_id === req.user.id, { quantity: req.body.quantity });
    res.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cart/:id', authenticateToken, (req, res) => {
  try {
    db.remove('cart', c => c.id === parseInt(req.params.id) && c.user_id === req.user.id);
    res.json({ success: true, message: 'Removed from cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ADMIN STATS ============

app.get('/api/admin/stats', authenticateToken, isAdmin, (req, res) => {
  try {
    const users = db.query('users');
    const products = db.query('products');
    const orders = db.query('orders');
    const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    
    res.json({
      success: true,
      stats: {
        users: users.length,
        products: products.length,
        orders: orders.length,
        revenue
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ WISHLIST ============

app.get('/api/wishlist', authenticateToken, (req, res) => {
  try {
    const items = db.query('wishlist', w => w.user_id === req.user.id);
    const enriched = items.map(item => {
      const product = db.findOne('products', p => p.id === item.product_id);
      return { ...item, product };
    });
    res.json({ success: true, items: enriched });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/wishlist', authenticateToken, (req, res) => {
  try {
    const existing = db.findOne('wishlist', w => w.user_id === req.user.id && w.product_id === req.body.product_id);
    if (!existing) {
      db.insert('wishlist', { user_id: req.user.id, product_id: req.body.product_id });
    }
    res.json({ success: true, message: 'Added to wishlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/wishlist/:productId', authenticateToken, (req, res) => {
  try {
    db.remove('wishlist', w => w.user_id === req.user.id && w.product_id === parseInt(req.params.productId));
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ERROR HANDLER ============

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start
async function start() {
  await seed();
  
  app.listen(PORT, () => {
    console.log('🚀 AJFworld API Server Running!');
    console.log(`📡 Port: ${PORT}`);
    console.log(`📊 Stats: http://localhost:${PORT}/api/admin/stats`);
    console.log(`🛍️ Products: http://localhost:${PORT}/api/products`);
    console.log('');
    console.log('📋 Available Endpoints:');
    console.log('  POST /api/auth/register');
    console.log('  POST /api/auth/login');
    console.log('  GET  /api/auth/me');
    console.log('  GET  /api/products');
    console.log('  GET  /api/products/:id');
    console.log('  GET  /api/categories');
    console.log('  GET  /api/cart');
    console.log('  POST /api/cart');
    console.log('  POST /api/orders');
    console.log('  GET  /api/orders');
    console.log('  GET  /api/tracking/:orderNumber');
    console.log('  GET  /api/admin/stats');
  });
}

start();
