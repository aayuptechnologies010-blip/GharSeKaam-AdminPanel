// Admin API - Connected to Real Backend (http://localhost:3000/api/v1)

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const getToken = () => localStorage.getItem("authToken") || null;

const authHeaders = (): Record<string, string> => {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

const call = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers as Record<string, string> || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `Request failed: ${res.status}`);
  return data;
};

const callForm = async (url: string, formData: FormData, method = "POST") => {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${url}`, { method, headers, body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `Request failed: ${res.status}`);
  return data;
};

// ── Category Service ─────────────────────────────────────────
export const categoryService = {
  getCategories: () => call("/owner/inventory/categories"),

  addCategory: async (title: string, image: File | null, imageUrl?: string | null) => {
    const fd = new FormData();
    fd.append("title", title);
    if (image) fd.append("image", image);
    else if (imageUrl) fd.append("imageUrl", imageUrl);
    return callForm("/owner/inventory/category", fd);
  },

  updateCategory: async (id: string, title: string, image?: File | null) => {
    const fd = new FormData();
    fd.append("title", title);
    if (image) fd.append("image", image);
    return callForm(`/owner/inventory/category/${id}`, fd, "PUT");
  },

  deleteCategory: (id: string) =>
    call(`/owner/inventory/category/${id}`, { method: "DELETE" }),
};

// ── Item Service ─────────────────────────────────────────────
export const itemService = {
  getItems: (categoryId?: string) => {
    if (categoryId) return call(`/owner/inventory/category/${categoryId}/items`);
    return call("/owner/inventory/items");
  },

  addItem: async (itemData: any) => {
    const fd = new FormData();
    const fields = ["title", "wholesaleprice", "retailprice", "unit", "description",
      "availability", "currentQty", "warranty", "discount", "categoryId", "minimumpurchase"];
    fields.forEach((f) => { if (itemData[f] !== undefined) fd.append(f, String(itemData[f])); });
    if (itemData.variants) fd.append("variants", JSON.stringify(itemData.variants));
    if (itemData.addons) fd.append("addons", JSON.stringify(itemData.addons));
    if (itemData.images && itemData.images.length > 0) {
      itemData.images.forEach((img: File) => fd.append("images", img));
    } else if (itemData.imageUrls && itemData.imageUrls.length > 0) {
      itemData.imageUrls.forEach((u: string) => fd.append("imageUrls", u));
    }
    return callForm("/owner/inventory/item", fd);
  },

  updateItem: async (id: string, itemData: any) => {
    const fd = new FormData();
    const fields = ["title", "wholesaleprice", "retailprice", "unit", "description",
      "currentQty", "warranty", "discount", "categoryId", "minimumpurchase"];
    fields.forEach((f) => { if (itemData[f] !== undefined) fd.append(f, String(itemData[f])); });
    if (itemData.variants) fd.append("variants", JSON.stringify(itemData.variants));
    if (itemData.addons) fd.append("addons", JSON.stringify(itemData.addons));
    if (itemData.images && itemData.images.length > 0) {
      itemData.images.forEach((img: File) => fd.append("images", img));
    }
    return callForm(`/owner/inventory/item/${id}`, fd, "PUT");
  },

  addQuantity: (itemId: string, quantity: string) =>
    call(`/owner/inventory/item/${itemId}/add-quantity`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    }),

  deleteItem: (itemId: string) =>
    call(`/owner/inventory/item/${itemId}`, { method: "DELETE" }),
};

// ── Order Service ─────────────────────────────────────────────
export const orderService = {
  getOrders: () => call("/owner/orders"),

  // Backend uses PATCH with specific action endpoints
  updateOrderStatus: (orderId: string, status: string) => {
    const statusMap: Record<string, string> = {
      accept: "accept",
      accepted: "accept",
      reject: "reject",
      rejected: "reject",
      cancel: "cancel",
      cancelled: "cancel",
      "delivery-pickup": "delivery-pickup",
      delivered: "delivered",
    };
    const action = statusMap[status.toLowerCase()] || status.toLowerCase();
    return call(`/owner/orders/${orderId}/${action}`, { method: "PATCH" });
  },

  deleteOrder: (orderId: string) =>
    call(`/owner/orders/${orderId}`, { method: "DELETE" }),
};

// ── Dashboard Service ─────────────────────────────────────────
export const dashboardService = {
  getDashboard: () => call("/owner/dashboard"),
};

// ── Customer Service ──────────────────────────────────────────
export const customerService = {
  getCustomers: () => call("/owner/customers"),
};

// ── Profile Service ───────────────────────────────────────────
export const profileService = {
  getProfile: () => call("/owner/auth/profile"),
  updateProfile: (data: any) =>
    call("/owner/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ── Shop / Image Service ──────────────────────────────────────
export const shopService = {
  setupShop: (shopData: any) =>
    call("/owner/auth/signup", {
      method: "POST",
      body: JSON.stringify(shopData),
    }),

  getShopImages: () => call("/owner/inventory/shop-images"),

  addShopImage: (imageFile: File | null, description: string) => {
    const fd = new FormData();
    fd.append("description", description);
    if (imageFile) fd.append("image", imageFile);
    return callForm("/owner/inventory/shop-image", fd);
  },

  updateShopImage: (id: string, description: string) => {
    const fd = new FormData();
    fd.append("description", description);
    return callForm(`/owner/inventory/shop-image/${id}`, fd, "PUT");
  },

  deleteShopImage: (id: string) =>
    call(`/owner/inventory/shop-image/${id}`, { method: "DELETE" }),
};

// ── Labour Service ───────────────────────────────────────────
export const labourService = {
  getLabourCategories: () => call("/owner/labour/categories"),
  updateLabourRate: (categoryId: string, rate: number) =>
    call(`/owner/labour/rate/${categoryId}`, {
      method: "PATCH",
      body: JSON.stringify({ rate }),
    }),
  resetLabourRates: () =>
    call("/owner/labour/reset-rates", {
      method: "POST"
    }),
  getLabourBookings: () => call("/owner/labour/bookings"),
  updateLabourBookingStatus: (id: string, status: string) =>
    call(`/owner/labour/booking/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    })
};

// ── Auth Service ──────────────────────────────────────────────
export const authService = {
  verifyToken: () => call("/owner/auth/profile"),
  logout: async () => {
    localStorage.clear();
    return { success: true };
  },
};
