# SANSE Fashion E-commerce API Documentation

## 🏗️ System Architecture

### **Data Models**
- **User/Auth**: User authentication and management
- **Category**: Product categories with hierarchical structure
- **Product**: Products with customization options
- **Fabric**: Fabric types, colors, and pricing
- **Style**: Style categories and options
- **Accent**: Accent categories and options
- **Cart**: User shopping cart management
- **Order**: Order processing and tracking

---

## 🔐 Authentication APIs

### **Auth Endpoints**
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh-token
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/change-password
POST /api/v1/auth/verify-email
```

---

## 👨‍💼 ADMIN APIs

### **🏠 Admin Dashboard**
```
GET /api/v1/admin/dashboard/stats
- Returns: Revenue, Orders, Customers, Growth metrics
- Response: { revenue, orders, customers, growth, charts }

GET /api/v1/admin/dashboard/charts
- Returns: Monthly revenue/sales data for charts
- Response: { monthlyData, categoryDistribution }

GET /api/v1/admin/dashboard/recent-orders
- Returns: Recent orders list
- Response: { orders[] }
```

### **📂 Category Management**
```
GET /api/v1/admin/categories
- Query: ?page=1&limit=10&search=&type=
- Returns: Paginated categories list
- Response: { categories[], pagination }

POST /api/v1/admin/categories
- Body: { name, description, type, image, parentCategory }
- Returns: Created category
- Response: { category }

GET /api/v1/admin/categories/:id
- Returns: Category details
- Response: { category }

PUT /api/v1/admin/categories/:id
- Body: { name, description, type, image, parentCategory }
- Returns: Updated category
- Response: { category }

DELETE /api/v1/admin/categories/:id
- Returns: Success message
- Response: { message }

POST /api/v1/admin/categories/upload-image
- Body: FormData with image file
- Returns: Image URL
- Response: { imageUrl }
```

### **👕 Product Management**
```
GET /api/v1/admin/products
- Query: ?page=1&limit=10&search=&category=&status=
- Returns: Paginated products list
- Response: { products[], pagination }

POST /api/v1/admin/products
- Body: { name, description, sku, category, images[], basePrice, salePrice, stock, sizes[], colors[], isCustomizable, customizationOptions, specifications }
- Returns: Created product
- Response: { product }

GET /api/v1/admin/products/:id
- Returns: Product details
- Response: { product }

PUT /api/v1/admin/products/:id
- Body: Product update data
- Returns: Updated product
- Response: { product }

DELETE /api/v1/admin/products/:id
- Returns: Success message
- Response: { message }

POST /api/v1/admin/products/upload-images
- Body: FormData with multiple image files
- Returns: Array of image URLs
- Response: { imageUrls[] }

PUT /api/v1/admin/products/:id/status
- Body: { status }
- Returns: Updated product
- Response: { product }
```

### **🧵 Fabric Management**
```
GET /api/v1/admin/fabrics
- Query: ?page=1&limit=10&search=&type=&pattern=
- Returns: Paginated fabrics list
- Response: { fabrics[], pagination }

POST /api/v1/admin/fabrics
- Body: { name, type, color, pattern, weight, season, composition, image, price, stockQuantity, careInstructions, properties }
- Returns: Created fabric
- Response: { fabric }

GET /api/v1/admin/fabrics/:id
- Returns: Fabric details
- Response: { fabric }

PUT /api/v1/admin/fabrics/:id
- Body: Fabric update data
- Returns: Updated fabric
- Response: { fabric }

DELETE /api/v1/admin/fabrics/:id
- Returns: Success message
- Response: { message }

POST /api/v1/admin/fabrics/upload-image
- Body: FormData with image file
- Returns: Image URL
- Response: { imageUrl }
```

### **✨ Style Management**
```
GET /api/v1/admin/styles
- Query: ?page=1&limit=10&search=&category=&applicableFor=
- Returns: Paginated styles list
- Response: { styles[], pagination }

POST /api/v1/admin/styles
- Body: { name, category, description, icon, options[], applicableFor[], isRequired, allowMultipleSelection }
- Returns: Created style
- Response: { style }

GET /api/v1/admin/styles/:id
- Returns: Style details
- Response: { style }

PUT /api/v1/admin/styles/:id
- Body: Style update data
- Returns: Updated style
- Response: { style }

DELETE /api/v1/admin/styles/:id
- Returns: Success message
- Response: { message }

POST /api/v1/admin/styles/upload-icon
- Body: FormData with icon file
- Returns: Icon URL
- Response: { iconUrl }
```

### **🎨 Accent Management**
```
GET /api/v1/admin/accents
- Query: ?page=1&limit=10&search=&category=&applicableFor=
- Returns: Paginated accents list
- Response: { accents[], pagination }

POST /api/v1/admin/accents
- Body: { name, category, description, icon, options[], applicableFor[], isRequired, allowMultipleSelection }
- Returns: Created accent
- Response: { accent }

GET /api/v1/admin/accents/:id
- Returns: Accent details
- Response: { accent }

PUT /api/v1/admin/accents/:id
- Body: Accent update data
- Returns: Updated accent
- Response: { accent }

DELETE /api/v1/admin/accents/:id
- Returns: Success message
- Response: { message }

POST /api/v1/admin/accents/upload-icon
- Body: FormData with icon file
- Returns: Icon URL
- Response: { iconUrl }
```

### **📦 Order Management**
```
GET /api/v1/admin/orders
- Query: ?page=1&limit=10&search=&status=&paymentStatus=&dateFrom=&dateTo=
- Returns: Paginated orders list
- Response: { orders[], pagination }

GET /api/v1/admin/orders/:id
- Returns: Order details
- Response: { order }

PUT /api/v1/admin/orders/:id/status
- Body: { status, note }
- Returns: Updated order
- Response: { order }

PUT /api/v1/admin/orders/:id/payment-status
- Body: { paymentStatus }
- Returns: Updated order
- Response: { order }

PUT /api/v1/admin/orders/:id/shipping
- Body: { trackingNumber, carrier, shippingMethod }
- Returns: Updated order
- Response: { order }

POST /api/v1/admin/orders/:id/refund
- Body: { amount, reason }
- Returns: Refund details
- Response: { refund }
```

---

## 🛍️ USER APIs

### **🏠 Homepage**
```
GET /api/v1/homepage
- Returns: Homepage data with featured products, categories, testimonials
- Response: { featuredProducts[], categories[], testimonials[], stats }

GET /api/v1/homepage/categories
- Returns: Main categories for dropdown
- Response: { categories[] }
```

### **📂 Product Listing**
```
GET /api/v1/products
- Query: ?page=1&limit=12&search=&category=&type=&minPrice=&maxPrice=&colors=&sizes=&sort=
- Returns: Paginated products with filters
- Response: { products[], pagination, filters }

GET /api/v1/products/ready-made
- Query: ?page=1&limit=12&category=&filters...
- Returns: Ready-made products only
- Response: { products[], pagination }

GET /api/v1/products/others
- Query: ?page=1&limit=12&category=&filters...
- Returns: Other products (accessories) only
- Response: { products[], pagination }

GET /api/v1/products/featured
- Returns: Featured products
- Response: { products[] }

GET /api/v1/products/categories
- Returns: Product categories with counts
- Response: { categories[] }

GET /api/v1/products/filters
- Returns: Available filters (colors, sizes, price ranges)
- Response: { colors[], sizes[], priceRange }
```

### **👕 Product Details**
```
GET /api/v1/products/:slug
- Returns: Product details with all information
- Response: { product, relatedProducts[], reviews[] }

GET /api/v1/products/:id/reviews
- Query: ?page=1&limit=10
- Returns: Product reviews
- Response: { reviews[], pagination, averageRating }

POST /api/v1/products/:id/reviews
- Body: { rating, comment, name, email }
- Returns: Created review
- Response: { review }

PUT /api/v1/products/:id/view
- Returns: Updated view count
- Response: { viewCount }
```

### **🎨 Customization System**
```
GET /api/v1/customization/categories
- Returns: Customization categories (Coat, Shirt, Jacket, etc.)
- Response: { categories[] }

GET /api/v1/customization/fabrics
- Query: ?search=&type=&pattern=&color=
- Returns: Available fabrics for customization
- Response: { fabrics[] }

GET /api/v1/customization/styles
- Query: ?applicableFor=&category=
- Returns: Available styles for customization
- Response: { styles[] }

GET /api/v1/customization/accents
- Query: ?applicableFor=&category=
- Returns: Available accents for customization
- Response: { accents[] }

POST /api/v1/customization/calculate-price
- Body: { productId, fabric, styles[], accents[], size, color }
- Returns: Calculated price breakdown
- Response: { basePrice, customizationPrice, totalPrice, breakdown }

GET /api/v1/customization/product/:id
- Returns: Customization options for specific product
- Response: { product, fabrics[], styles[], accents[] }
```

### **🛒 Cart Management**
```
GET /api/v1/cart
- Returns: User's cart with items
- Response: { cart }

POST /api/v1/cart/add
- Body: { productId, quantity, size, color, customization? }
- Returns: Updated cart
- Response: { cart }

PUT /api/v1/cart/update/:itemId
- Body: { quantity }
- Returns: Updated cart
- Response: { cart }

DELETE /api/v1/cart/remove/:itemId
- Returns: Updated cart
- Response: { cart }

DELETE /api/v1/cart/clear
- Returns: Empty cart
- Response: { cart }

POST /api/v1/cart/apply-coupon
- Body: { couponCode }
- Returns: Updated cart with discount
- Response: { cart }

DELETE /api/v1/cart/remove-coupon/:couponCode
- Returns: Updated cart without discount
- Response: { cart }
```

### **💳 Checkout & Orders**
```
POST /api/v1/checkout/validate
- Body: { items[], shippingAddress, billingAddress }
- Returns: Checkout validation and totals
- Response: { isValid, errors[], totals }

POST /api/v1/checkout/create-payment-intent
- Body: { amount, currency }
- Returns: Stripe payment intent
- Response: { clientSecret, paymentIntentId }

POST /api/v1/orders
- Body: { items[], shippingAddress, billingAddress, paymentMethod, paymentIntentId }
- Returns: Created order
- Response: { order }

GET /api/v1/orders/my-orders
- Query: ?page=1&limit=10&status=
- Returns: User's orders
- Response: { orders[], pagination }

GET /api/v1/orders/:orderNumber
- Returns: Order details
- Response: { order }

POST /api/v1/orders/:id/cancel
- Body: { reason }
- Returns: Cancelled order
- Response: { order }

GET /api/v1/orders/:id/track
- Returns: Order tracking information
- Response: { order, timeline[], trackingInfo }
```

### **👤 User Profile**
```
GET /api/v1/profile
- Returns: User profile information
- Response: { user }

PUT /api/v1/profile
- Body: { name, email, phone, address, preferences }
- Returns: Updated user profile
- Response: { user }

POST /api/v1/profile/upload-avatar
- Body: FormData with image file
- Returns: Avatar URL
- Response: { avatarUrl }

GET /api/v1/profile/addresses
- Returns: User's saved addresses
- Response: { addresses[] }

POST /api/v1/profile/addresses
- Body: { address data }
- Returns: Created address
- Response: { address }

PUT /api/v1/profile/addresses/:id
- Body: { address data }
- Returns: Updated address
- Response: { address }

DELETE /api/v1/profile/addresses/:id
- Returns: Success message
- Response: { message }
```

### **🔍 Search & Filters**
```
GET /api/v1/search
- Query: ?q=&category=&type=&filters...
- Returns: Search results
- Response: { products[], categories[], totalResults }

GET /api/v1/search/suggestions
- Query: ?q=
- Returns: Search suggestions
- Response: { suggestions[] }

GET /api/v1/search/popular
- Returns: Popular search terms
- Response: { popular[] }
```

---

## 📊 Analytics & Reporting APIs

### **Admin Analytics**
```
GET /api/v1/admin/analytics/overview
- Query: ?period=30d&compareWith=previous
- Returns: Overview analytics
- Response: { revenue, orders, customers, growth }

GET /api/v1/admin/analytics/products
- Query: ?period=30d&limit=10
- Returns: Product performance analytics
- Response: { topProducts[], categoryPerformance[] }

GET /api/v1/admin/analytics/customers
- Query: ?period=30d
- Returns: Customer analytics
- Response: { newCustomers, returningCustomers, averageOrderValue }

GET /api/v1/admin/analytics/revenue
- Query: ?period=12m&groupBy=month
- Returns: Revenue analytics
- Response: { revenueData[], trends }
```

---

## 🔔 Notification APIs

### **User Notifications**
```
GET /api/v1/notifications
- Query: ?page=1&limit=10&type=&read=
- Returns: User notifications
- Response: { notifications[], pagination }

PUT /api/v1/notifications/:id/read
- Returns: Updated notification
- Response: { notification }

PUT /api/v1/notifications/mark-all-read
- Returns: Success message
- Response: { message }

DELETE /api/v1/notifications/:id
- Returns: Success message
- Response: { message }
```

---

## 🛡️ Security & Middleware

### **Authentication Middleware**
- `verifyToken`: Validates JWT tokens
- `adminMiddleware`: Ensures admin access
- `userMiddleware`: Ensures user access

### **Rate Limiting**
- API rate limiting: 100 requests per 15 minutes per IP
- Auth endpoints: 5 requests per 15 minutes per IP

### **Data Validation**
- Input validation using Joi
- File upload validation
- SQL injection prevention
- XSS protection

### **Error Handling**
- Standardized error responses
- Detailed logging
- Error tracking

---

## 📝 Response Format

### **Success Response**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### **Error Response**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...],
  "code": "ERROR_CODE"
}
```

### **Pagination Response**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 🚀 Implementation Priority

1. **Phase 1**: Authentication, User Management, Basic CRUD
2. **Phase 2**: Product Management, Categories, Basic Cart
3. **Phase 3**: Customization System, Advanced Cart, Orders
4. **Phase 4**: Payment Integration, Analytics, Notifications
5. **Phase 5**: Advanced Features, Optimization, Testing

---

## 📋 Database Relationships

```
User (1) -> (M) Order
User (1) -> (1) Cart
Category (1) -> (M) Product
Product (1) -> (M) CartItem
Product (1) -> (M) OrderItem
Fabric (1) -> (M) CustomizationOption
Style (1) -> (M) CustomizationOption
Accent (1) -> (M) CustomizationOption
Order (1) -> (M) OrderItem
Cart (1) -> (M) CartItem
```

This comprehensive API documentation covers all the functionality seen in both the admin and user dashboards, providing a complete roadmap for implementing the SANSE Fashion e-commerce system. 