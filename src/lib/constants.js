export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export const API_ENDPOINTS = {};

export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;
export const getAuthToken = () => localStorage.getItem("authToken") || null;
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Real network request helper using fetch
export const apiCall = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };
  
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errText = await response.text();
    let errMsg = `Request failed: ${response.status}`;
    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson.message || errMsg;
    } catch {
      errMsg = errText || errMsg;
    }
    throw new Error(errMsg);
  }

  return response.json();
};

export const apiCallFormData = async (endpoint, formData, options = {}) => {
  return apiCall(endpoint, {
    ...options,
    method: options.method || "POST",
    body: formData,
  });
};
