// Backend DISCONNECTED - Full Dummy Data Mode
export const API_BASE_URL = "__BACKEND_DISABLED__";

export const API_ENDPOINTS = {
  OAUTH_CALLBACK: "/auth/google/callback",
  GET_CATEGORIES: "/owner/inventory/categories",
  ADD_CATEGORY: "/owner/inventory/category",
  GET_ITEMS: "/owner/inventory/items",
  GET_ITEMS_BY_CATEGORY: "/owner/inventory/category",
  ADD_ITEM: "/owner/inventory/item",
  UPDATE_ITEM: "/owner/inventory/item",
  ADD_ITEM_QUANTITY: "/owner/inventory/item",
  ADD_SHOP_IMAGE: "/owner/inventory/shop-image",
  GET_SHOP_IMAGES: "/owner/inventory/shop-images",
  PUT_SHOP_IMAGE: "/owner/inventory/shop-image/:id",
  DELETE_SHOP_IMAGE: "/owner/inventory/shop-image/:id",
  GET_ORDERS: "/owner/orders",
  UPDATE_ORDER_STATUS: "/owner/orders",
  GET_DASHBOARD: "/owner/dashboard",
  GET_CUSTOMERS: "/owner/customers",
  GET_PROFILE: "/owner/auth/profile",
  UPDATE_PROFILE: "/owner/auth/profile",
  SETUP_SHOP: "/owner/shop/setup",
};

export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;
export const getAuthToken = () => localStorage.getItem("authToken") || null;
export const getAuthHeaders = () => {
  const token = getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

// Dummy stub - never actually calls backend
export const apiCall = async (endpoint, options = {}) => {
  console.warn(`[DUMMY MODE] apiCall blocked: ${endpoint}`);
  throw new Error("Backend disconnected - running in dummy mode");
};

export const apiCallFormData = async (endpoint, formData, options = {}) => {
  console.warn(`[DUMMY MODE] apiCallFormData blocked: ${endpoint}`);
  throw new Error("Backend disconnected - running in dummy mode");
};
