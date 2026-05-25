// API Constants for GharSeKro.com Admin Panel

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"; // Change this to your actual backend URL

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  OAUTH_CALLBACK: "/auth/google/callback",

  // Categories
  GET_CATEGORIES: "/owner/inventory/categories",
  ADD_CATEGORY: "/owner/inventory/category",

  // Items
  GET_ITEMS: "/owner/inventory/items",
  GET_ITEMS_BY_CATEGORY: "/owner/inventory/category", // + /{categoryId}/items
  ADD_ITEM: "/owner/inventory/item",
  UPDATE_ITEM: "/owner/inventory/item", // + /{itemId}
  ADD_ITEM_QUANTITY: "/owner/inventory/item", // + /{itemId}/add-quantity
  ADD_SHOP_IMAGE: "/owner/inventory/shop-image",
  GET_SHOP_IMAGES: "/owner/inventory/shop-images",
  PUT_SHOP_IMAGE: "/owner/inventory/shop-image/:id", // + /{imageId}
  DELETE_SHOP_IMAGE: "/owner/inventory/shop-image/:id", // + /{imageId}
  // Orders
  GET_ORDERS: "/owner/orders",
  UPDATE_ORDER_STATUS: "/owner/orders", // + /{orderId}/{status}

  // Dashboard
  GET_DASHBOARD: "/owner/dashboard",

  // Customers
  GET_CUSTOMERS: "/owner/customers",

  // Profile
  GET_PROFILE: "/owner/auth/profile",
  UPDATE_PROFILE: "/owner/auth/profile",

  // Shop Setup
  SETUP_SHOP: "/owner/shop/setup",
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to get auth token
export const getAuthToken = () => {
  return (
    localStorage.getItem("tempAuthToken") || localStorage.getItem("authToken")
  );
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = getAuthToken();
  if (!token) return {};
  const headerValue = typeof token === 'string' && token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  return {
    Authorization: headerValue,
  };
};

// Helper function for API calls with authentication
export const apiCall = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Helper function for FormData API calls (for file uploads)
export const apiCallFormData = async (endpoint, formData, options = {}) => {
  const url = getApiUrl(endpoint);
  const headers = {
    ...getAuthHeaders(),
    // Don't set Content-Type for FormData, let browser set it with boundary
    ...options.headers,
  };

  const config = {
    method: "POST",
    body: formData,
    headers,
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`FormData API call failed for ${endpoint}:`, error);
    throw error;
  }
};
