# API Integration Guide

This guide shows how to safely integrate your React frontend with your Node/Express backend without modifying existing code.

## Files Created

1. **`src/services/api.ts`** - Centralized API service
2. **`src/components/ApiExamples.tsx`** - Example components showing API usage
3. **`package.json`** - Added proxy configuration

## Backend Configuration

- **Backend URL**: `http://localhost:3003`
- **Frontend URL**: `http://localhost:3000`
- **Proxy**: Added to package.json for development convenience

## How to Use

### 1. Import the API service in any component:

```typescript
import { productApi, memberApi, orderApi } from '../services/api';
```

### 2. Use API functions:

```typescript
// Fetch products
const response = await productApi.getAllProducts();
if (response.success) {
  console.log(response.data); // Array of products
}

// Login user
const loginResponse = await memberApi.login({
  memberPhone: '1234567890',
  memberPassword: 'password123'
});

// Create order
const orderResponse = await orderApi.createOrder({
  orderTotal: 100,
  orderItems: [...]
});
```

### 3. Import example components (optional):

```typescript
import { ApiProductList, ApiHealthCheck } from '../components/ApiExamples';

// Use in your JSX
<ApiProductList />
<ApiHealthCheck />
```

## API Endpoints Supported

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search?q=query` - Search products
- `GET /api/products/category/:category` - Get products by category

### Members
- `POST /api/members/login` - Login
- `POST /api/members/register` - Register
- `GET /api/members/me` - Get current user
- `POST /api/members/logout` - Logout
- `PUT /api/members/profile` - Update profile

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status

## Features

- ✅ **Type Safety**: Full TypeScript support
- ✅ **Error Handling**: Comprehensive error handling
- ✅ **CORS Safe**: Handles cross-origin requests
- ✅ **Cookie Support**: Includes credentials for authentication
- ✅ **Proxy Support**: Development proxy configured
- ✅ **No Existing Code Changes**: Safe to integrate

## Testing

1. Start your backend on port 3003
2. Start your frontend on port 3000
3. Import and use the API service in any component
4. Check browser console for any CORS or network errors

## Example Integration

Add this to any existing component to test API connectivity:

```typescript
import { apiUtils } from '../services/api';

// In your component
useEffect(() => {
  const checkApi = async () => {
    const isHealthy = await apiUtils.checkHealth();
    console.log('Backend API healthy:', isHealthy);
  };
  checkApi();
}, []);
```
