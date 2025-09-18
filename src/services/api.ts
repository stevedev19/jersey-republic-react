/**
 * Centralized API service for communicating with the backend
 * Backend runs on http://localhost:3003
 * Frontend runs on http://localhost:3000
 */

// Backend base URL
const API_BASE_URL = 'http://localhost:3003';

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Product {
  _id: string;
  productName: string;
  productPrice: number;
  productImage?: string;
  productDescription?: string;
  productCategory?: string;
  productCollection?: string;
  productSize?: string;
  productVolume?: string;
  productDiscount?: number;
  productViews?: number;
  productLikes?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Member {
  _id: string;
  memberNick: string;
  memberPhone: string;
  memberPassword: string;
  memberImage?: string;
  memberType: string;
  memberStatus: string;
  memberAddress?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  _id: string;
  orderTotal: number;
  orderStatus: string;
  orderItems: OrderItem[];
  memberId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  _id: string;
  productId: string;
  quantity: number;
  price: number;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Product API functions
export const productApi = {
  // Get all products
  getAllProducts: async (): Promise<ApiResponse<Product[]>> => {
    return apiRequest<Product[]>('/api/products');
  },

  // Get product by ID
  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    return apiRequest<Product>(`/api/products/${id}`);
  },

  // Search products
  searchProducts: async (query: string): Promise<ApiResponse<Product[]>> => {
    return apiRequest<Product[]>(`/api/products/search?q=${encodeURIComponent(query)}`);
  },

  // Get products by category
  getProductsByCategory: async (category: string): Promise<ApiResponse<Product[]>> => {
    return apiRequest<Product[]>(`/api/products/category/${encodeURIComponent(category)}`);
  },
};

// Member API functions
export const memberApi = {
  // Login
  login: async (credentials: { memberPhone: string; memberPassword: string }): Promise<ApiResponse<Member>> => {
    return apiRequest<Member>('/api/members/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Register
  register: async (memberData: Partial<Member>): Promise<ApiResponse<Member>> => {
    return apiRequest<Member>('/api/members/register', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<Member>> => {
    return apiRequest<Member>('/api/members/me');
  },

  // Logout
  logout: async (): Promise<ApiResponse<void>> => {
    return apiRequest<void>('/api/members/logout', {
      method: 'POST',
    });
  },

  // Update profile
  updateProfile: async (memberData: Partial<Member>): Promise<ApiResponse<Member>> => {
    return apiRequest<Member>('/api/members/profile', {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
  },
};

// Order API functions
export const orderApi = {
  // Get user orders
  getUserOrders: async (): Promise<ApiResponse<Order[]>> => {
    return apiRequest<Order[]>('/api/orders');
  },

  // Create order
  createOrder: async (orderData: Partial<Order>): Promise<ApiResponse<Order>> => {
    return apiRequest<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Get order by ID
  getOrderById: async (id: string): Promise<ApiResponse<Order>> => {
    return apiRequest<Order>(`/api/orders/${id}`);
  },

  // Update order status
  updateOrderStatus: async (id: string, status: string): Promise<ApiResponse<Order>> => {
    return apiRequest<Order>(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// Utility functions
export const apiUtils = {
  // Check if API is available
  checkHealth: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  },

  // Get API base URL
  getBaseUrl: (): string => API_BASE_URL,
};

export default {
  productApi,
  memberApi,
  orderApi,
  apiUtils,
};
