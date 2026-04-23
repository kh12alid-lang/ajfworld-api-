# AJFworld API - Backend Server

## ⚡ ما هو هذا؟
هذا خادم API backend لموقع AJFworld E-commerce. يحتوي على:
- ✅ تسجيل ودخول المستخدمين (JWT)
- ✅ قاعدة بيانات JSON (لا تحتاج تثبيت SQL)
- ✅ إدارة المنتجات والفئات
- ✅ سلة تسوق وطلبات
- ✅ تتبع الشحنات
- ✅ لوحة إدارة مع إحصائيات

---

## 🚀 طريقة التثبيت

### 1️⃣ فك الضغط

```bash
unzip AJFworld-api.zip
cd AJFworld-api
```

### 2️⃣ تثبيت الحزم

```bash
npm install
```

### 3️⃣ تشغيل الخادم

```bash
npm start
```

### 4️⃣ اختبار

افتح المتصفح واكتب:
```
http://localhost:3000/api/products
```

---

## 📡 Endpoints المتاحة

### المصادقة
- `POST /api/auth/register` - تسجيل حساب
- `POST /api/auth/login` - تسجيل دخول
- `GET /api/auth/me` - بيانات المستخدم

### المنتجات
- `GET /api/products` - كل المنتجات
- `GET /api/products/:id` - منتج واحد
- `POST /api/products` - إضافة منتج (Admin)
- `PUT /api/products/:id` - تعديل منتج (Admin)
- `DELETE /api/products/:id` - حذف منتج (Admin)

### الفئات
- `GET /api/categories` - كل الفئات
- `POST /api/categories` - إضافة فئة (Admin)

### السلة
- `GET /api/cart` - محتويات السلة
- `POST /api/cart` - إضافة للسلة
- `PUT /api/cart/:id` - تحديث الكمية
- `DELETE /api/cart/:id` - حذف من السلة

### الطلبات
- `GET /api/orders` - طلبات المستخدم
- `POST /api/orders` - إنشاء طلب
- `GET /api/orders/:id` - تفاصيل طلب

### التتبع
- `GET /api/tracking/:orderNumber` - تتبع شحنة

### المفضلة
- `GET /api/wishlist` - المفضلة
- `POST /api/wishlist` - إضافة للمفضلة
- `DELETE /api/wishlist/:productId` - حذف من المفضلة

### الإدارة
- `GET /api/admin/stats` - إحصائيات

---

## 📝 مثال على الطلبات

### تسجيل حساب:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"خالد","email":"khaled@ajfworld.ae","password":"123456"}'
```

### تسجيل دخول:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"khaled@ajfworld.ae","password":"123456"}'
```

---

## 🔧 ربط الموقع بالـ API

في ملف `.env` الموقع الأمامي:
```
VITE_API_URL=http://localhost:3000/api
```

---

## 📊 المالك: Khaled Mohammed Saleh Awad Aljaberi
## 🌐 الموقع: AJFworld.ae
