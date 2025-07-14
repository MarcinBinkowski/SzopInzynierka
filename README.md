# SzopInzynierka

An e-commerce platform built with Django REST Framework, React, and React Native.

## Architecture

This platform consists of:

- **Backend**: Django REST Framework with PostgreSQL, Redis, and MinIO
- **Frontend**: React web application with TypeScript, Shadcn-ui and Tailwind CSS
- **Mobile**: React Native app with Expo
- **API**: Auto-generated TypeScript clients using Orval from OpenAPI specs

## Quick Start

### Prerequisites

- **Docker & Docker Compose** (for backend services)
- **Node.js 18+** (for frontend and mobile)
- **Python 3.13+** (for backend development)
- **Xcode** (for iOS development)

### Backend Setup

The backend runs in Docker containers with the following services:

```bash
cd backend
make up          # Start all services
make down        # Stop all services
make build       # Rebuild containers

# then you'll have to login to minio admin
http://localhost:9001
user: minioadmin
password: minioadmin123

# then create bucket:
product-images
```

This command starts:
- **PostgreSQL** (port 5432) - Main database
- **Redis** (port 6379) - Celery broker
- **MinIO** (ports 9000/9001) - Object storage for images (S3 compliant)
- **Django** (port 8000) - REST API server
- **Celery Worker** - Background task processing
- **Push Notification Relay** (port 5055) - Mobile notifications, used due to limitations of the IOS simulator

### Frontend Setup

```bash
cd frontend
npm run dev              # Start development server
```

The React app will be available at `http://localhost:3000`

### Mobile Setup

```bash
cd mobile
npx expo start --ios     # Run on iOS simulator
```

### API Client Generation

Both frontend and mobile use auto-generated TypeScript clients:

```bash
# Frontend
cd frontend
npm run generate:api

# Mobile
cd mobile
npm run generate:api
```

## Tech Stack

### Backend
- **Django 5.2+** - Web framework
- **Django REST Framework** - API framework
- **Django Allauth (headless)** - Authentication
- **PostgreSQL** - Primary database
- **Redis** - Message broker
- **Celery** - Background task processing
- **MinIO** - S3-compatible object storage
- **DRF Spectacular** - OpenAPI schema generation
- **Stripe** - Payment processing

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **TanStack Router** - Routing
- **TanStack Query** - Data fetching
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Tailwind CSS** - Styling
- **Material React Table** - Data tables
- **Shadcn/ui** - Styled componets
- **Zustand** - State management

### Mobile
- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Native Paper** - Material Design components
- **Expo Router** - File-based routing
- **React Native Reanimated** - Animations
- **Stripe React Native** - Payment processing
- **Expo Notifications** - Push notifications

## 📱 Features

### Mobile E-commerce
- **Product Catalog** - Categories, manufacturers, tags, search
- **Shopping Cart** - Add/remove items, quantity management
- **Order Management** - Order processing, status tracking
- **Payment Processing** - Stripe integration
- **Image Management** - MinIO storage with pre-signed URLs
- **Inventory Management** - Stock tracking, low stock alerts

### User Management
- **Authentication** - JWT-based auth with refresh tokens
- **Role-Based Access Control** - Admin, Employee, User roles
- **User Profiles** - Address management, preferences
- **Wishlist** - Save favorite products

### Advanced Features
- **Push Notifications** - Mobile notifications via Expo (and Relay)
- **Order Processing Notes** - Internal order management
- **Coupon System** - Discount codes and promotions
- **Invoice Generation** - PDF invoice creation (via configurable templates)
- **Shipment Tracking** - Order fulfillment tracking
- **Background Tasks** - Celery for async processing
- **Database Automation** - PostgreSQL triggers for automatic order status updates:
  - When `shipped_at` is set → Order status becomes `'shipped'`
  - When `delivered_at` is set → Order status becomes `'delivered'`



## Authentication & Authorization

- **Dual Authentication System** - Different approaches for web vs mobile:
  - **Frontend (Browser)**: Django session cookies + CSRF protection    
  - **Mobile (App)**: Session tokens with `X-Session-Token` header
- **Role-Based Access** - Three user roles with different permissions
- **Storage** - Frontend uses cookies and localStorage, mobile uses SecureStore

## Database Schema

### Tables
- `auth_user`
- `catalog_category`
- `catalog_manufacturer`
- `catalog_notificationhistory`
- `catalog_notificationpreference`
- `catalog_product`
- `catalog_product_tags`
- `catalog_productdelivery`
- `catalog_productimage`
- `catalog_supplier`
- `catalog_tag`
- `catalog_wishlistitem`
- `checkout_cart`
- `checkout_cartitem`
- `checkout_cartstatus`
- `checkout_coupon`
- `checkout_couponredemption`
- `checkout_courier`
- `checkout_invoice`
- `checkout_invoicetemplate`
- `checkout_order`
- `checkout_orderitem`
- `checkout_orderprocessingnote`
- `checkout_payment`
- `checkout_shipment`
- `checkout_shippingmethod`
- `django_migrations`
- `django_session`
- `geographic_country`
- `profile_address`
- `profile_profile`

### Entity Relationships

#### **One-to-One (1:1) Relationships**
- `User` ↔ `Profile` - Each user has exactly one profile
- `User` ↔ `NotificationPreference` - Each user has one notification preference
- `Order` ↔ `Payment` - Each order has one payment record
- `Order` ↔ `Shipment` - Each order has one shipment tracking
- `Order` ↔ `Invoice` - Each order has one invoice

#### **One-to-Many (1:N) Relationships**
- `User` → `Order[]` - Users can have multiple orders
- `User` → `Cart[]` - Users can have multiple carts (active/historic)
- `User` → `Address[]` (via Profile) - Users can have multiple addresses
- `User` → `WishlistItem[]` - Users can have multiple wishlist items
- `User` → `CouponRedemption[]` - Users can redeem multiple coupons
- `User` → `OrderProcessingNote[]` - Staff can create multiple order notes
- `User` → `NotificationHistory[]` - Users receive multiple notifications
- `User` → `Payment[]` - Users can have multiple payments
- `User` → `InvoiceTemplate[]` - Users can create multiple invoice templates
- `User` → `OrderProcessingNote[]` - Staff can create multiple order processing notes
- `Profile` → `Address[]` - Profiles can have multiple addresses
- `Category` → `Product[]` - Categories contain multiple products
- `Manufacturer` → `Product[]` - Manufacturers make multiple products
- `Product` → `ProductImage[]` - Products can have multiple images
- `Product` → `CartItem[]` - Products can be in multiple carts
- `Product` → `OrderItem[]` - Products can be in multiple orders
- `Product` → `WishlistItem[]` - Products can be wishlisted by multiple users
- `Product` → `ProductDelivery[]` - Products can have multiple delivery records
- `Product` → `NotificationHistory[]` - Products can trigger multiple notifications
- `Cart` → `CartItem[]` - Carts contain multiple items
- `Order` → `OrderItem[]` - Orders contain multiple items
- `Order` → `OrderProcessingNote[]` - Orders can have multiple processing notes
- `Order` → `CouponRedemption[]` - Orders can have coupon redemptions
- `CartStatus` → `Cart[]` - Cart statuses can be used by multiple carts
- `Courier` → `ShippingMethod[]` - Couriers offer multiple shipping methods
- `Coupon` → `CouponRedemption[]` - Coupons can be redeemed multiple times
- `Coupon` → `Cart[]` - Coupons can be applied to multiple carts
- `Coupon` → `Order[]` - Coupons can be applied to multiple orders
- `ShippingMethod` → `Cart[]` - Shipping methods can be used in multiple carts
- `ShippingMethod` → `Order[]` - Shipping methods can be used in multiple orders
- `Country` → `Address[]` - Countries can have multiple addresses
- `Supplier` → `ProductDelivery[]` - Suppliers can make multiple deliveries

#### **Many-to-Many (N:N) Relationships**
- `Product` ↔ `Tag` - Products can have multiple tags, tags can be on multiple products


### Database Functions & Triggers

#### **PostgreSQL Functions**
-- Automatic order status updates based on shipment changes


#### **Database Triggers**
-- Trigger that automatically updates order status when shipment changes


### Database Constraints

#### **Unique Constraints**
- `ProductImage`: Only one primary image per product (`unique_primary_image_per_product`)
- `Address`: Only one default address per profile and type (`unique_default_address_per_profile`)
- `WishlistItem`: User can only wishlist a product once (`user`, `product`)
- `CartItem`: Product can only appear once per cart (`cart`, `product`)
- `CouponRedemption`: User can only redeem same coupon once per order (`user`, `coupon`, `order`)
- `InvoiceTemplate`: Only one default template allowed (`unique_default_template`)
- `InvoiceTemplate`: Template names must be unique (`name`)
- `CartStatus`: Status codes must be unique (`code`)
- `Courier`: Courier names must be unique (`name`)
- `Country`: Country codes must be unique (`code`)

#### **Field Constraints**
- `Product.price`, `ProductDelivery.cost_per_unit`: Minimum 0.01
- `CartItem.quantity`, `ProductDelivery.quantity`: Minimum 1
- Various `max_length` constraints on text fields
- Email validation on email fields
- URL validation on `Manufacturer.website`
- Role choices validation on `Profile.role` (1=Admin, 2=Employee, 3=User)
- Order status choices validation on `Order.status` (pending, confirmed, shipped, delivered, cancelled)
- Cart status choices validation on `Cart.status` (active, converted, abandoned, expired)
- Payment status choices validation on `Payment.status` (pending, completed, failed, canceled)
- Notification type choices validation on `NotificationHistory.notification_type` (stock_available, price_drop)

### Django Signals & Automation

#### **Automatic Record Creation**
- **Profile Creation**: Auto-created when user registers
- **Shipment Creation**: Auto-created when order is placed  
- **Invoice Creation**: Auto-created when order is confirmed

#### **Status Automation**
- **Order Status**: Automatically updated via PostgreSQL triggers when shipment dates change
- **Cart Status**: Updated when cart converts to order


## API Documentation

The API is fully documented using OpenAPI 3.0 specification:

-`http://localhost:8000/api/schema/swagger-ui/`

API clients are automatically generated using Orval from these OpenAPI specs.


## Testing

### available user

- **admin@test.com**: test12345
- **employee@test.com**: test12345
- **user@test.com**: test12345


### Stripe Payments

For testing Stripe payments, use the following test card details:

- **Card Number**: `4242424242424242`
- **Expiry Date**: Any future MM/YY (e.g., `12/25`)
- **CVC**: Any 3-digit number (e.g., `123`)

