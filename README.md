# SzopInzynierka

Ane-commerce platform built with Django REST Framework, React, and React Native.

## Architecture

This platform consists of:

- **Backend**: Django REST Framework with PostgreSQL, Redis, and MinIO
- **Frontend**: React web application with TypeScript and Tailwind CSS
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
npm run generate:api     # Regenerate API clients
```

The React app will be available at `http://localhost:3000`

### Mobile Setup

```bash
cd mobile
npx expo start           # Start Expo dev server
npx expo run:ios         # Run on iOS simulator
npx expo start --ios     # Regenerate API clients
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

## API Documentation

The API is fully documented using OpenAPI 3.0 specification:

-`http://localhost:8000/api/schema/swagger-ui/`

API clients are automatically generated using Orval from these OpenAPI specs.

