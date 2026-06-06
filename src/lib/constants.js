// ── DUMMY MODE — Backend Disconnected ────────────────────────
export const API_BASE_URL = "__BACKEND_DISABLED__";

export const API_ENDPOINTS = {};

export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;
export const getAuthToken = () => localStorage.getItem("authToken") || null;
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Blocked stubs — will never reach backend
export const apiCall = async (endpoint) => {
  console.warn(`[DUMMY MODE] apiCall blocked: ${endpoint}`);
  throw new Error("Backend disconnected");
};

export const apiCallFormData = async (endpoint) => {
  console.warn(`[DUMMY MODE] apiCallFormData blocked: ${endpoint}`);
  throw new Error("Backend disconnected");
};
