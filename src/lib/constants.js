// ── Admin API Configuration ──────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export const API_ENDPOINTS = {
  // Auth
  GOOGLE_LOGIN: "/owner/auth/google",
  OAUTH_CALLBACK: "/owner/auth/google/callback",
  SIGNUP: "/owner/auth/signup",
  GET_PROFILE: "/owner/auth/profile",
  UPDATE_PROFILE: "/owner/auth/profile",
  SETUP_SHOP: "/owner/shop/setup",

  // Categories
  GET_CATEGORIES: "/owner/inventory/categories",
  ADD_CATEGORY: "/owner/inventory/category",
  UPDATE_CATEGORY: "/owner/inventory/category",
  DELETE_CATEGORY: "/owner/inventory/category",

  // Items
  GET_ITEMS: "/owner/inventory/items",
  GET_ITEMS_BY_CATEGORY: "/owner/inventory/category",
  ADD_ITEM: "/owner/inventory/item",
  UPDATE_ITEM: "/owner/inventory/item",
  ADD_ITEM_QUANTITY: "/owner/inventory/item",
  DELETE_ITEM: "/owner/inventory/item",

  // Shop Images
  ADD_SHOP_IMAGE: "/owner/inventory/shop-image",
  GET_SHOP_IMAGES: "/owner/inventory/shop-images",
  PUT_SHOP_IMAGE: "/owner/inventory/shop-image",
  DELETE_SHOP_IMAGE: "/owner/inventory/shop-image",

  // Orders
  GET_ORDERS: "/owner/orders",
  UPDATE_ORDER_STATUS: "/owner/orders",
  DELETE_ORDER: "/owner/orders",

  // Dashboard
  GET_DASHBOARD: "/owner/dashboard",

  // Customers
  GET_CUSTOMERS: "/owner/customers",
};

export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

export const getAuthToken = () => localStorage.getItem("authToken") || null;

export const getAuthHeaders = () => {
  const token = getAuthToken();
  if (!token) return { "Content-Type": "application/json" };
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ── Core API Caller ──────────────────────────────────────────
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data;
};

export const apiCallFormData = async (endpoint, formData, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(url, {
    method: "POST",
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data;
};
