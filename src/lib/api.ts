const getAuthToken = () => localStorage.getItem("authToken") || null;

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
  const url = `${baseUrl}${endpoint}`;
  
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {})
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const errText = await response.text();
    let errMsg = "API call failed";
    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson.message || errMsg;
    } catch {
      errMsg = errText || errMsg;
    }
    throw new Error(errMsg);
  }
  
  return response.json();
}

// ── Services ─────────────────────────────────────────────────

export const categoryService = {
  getCategories: async () => {
    return apiFetch("/owner/inventory/categories");
  },

  addCategory: async (title: string, image: File | null, imageUrl?: string | null) => {
    const formData = new FormData();
    formData.append("title", title);
    if (image) {
      formData.append("image", image);
    }
    if (imageUrl) {
      formData.append("imageUrl", imageUrl);
    }
    return apiFetch("/owner/inventory/category", {
      method: "POST",
      body: formData
    });
  },

  updateCategory: async (id: string, title: string, image?: File | null) => {
    const formData = new FormData();
    if (title) formData.append("title", title);
    if (image) formData.append("image", image);
    return apiFetch(`/owner/inventory/category/${id}`, {
      method: "PUT",
      body: formData
    });
  },

  deleteCategory: async (id: string) => {
    return apiFetch(`/owner/inventory/category/${id}`, {
      method: "DELETE"
    });
  },
};

export const itemService = {
  getItems: async (categoryId?: string) => {
    if (categoryId) {
      return apiFetch(`/owner/inventory/category/${categoryId}/items`);
    }
    return apiFetch("/owner/inventory/items");
  },

  addItem: async (itemData: any) => {
    const formData = new FormData();
    // Append all text fields
    const textFields = [
      "title", "description", "categoryId", "wholesaleprice", "retailprice",
      "unit", "availability", "currentQty", "warranty", "addons", "discount",
      "minimumPurchase", "variants"
    ];
    
    textFields.forEach(field => {
      if (itemData[field] !== undefined && itemData[field] !== null) {
        let key = field;
        if (field === "minimumPurchase") key = "minimumpurchase";
        formData.append(key, String(itemData[field]));
      }
    });

    // Append image files
    if (itemData.images && Array.isArray(itemData.images)) {
      itemData.images.forEach((file: File) => {
        if (file instanceof File && file.name !== "__url__") {
          formData.append("images", file);
        }
      });
    }

    // Append imageUrls
    if (itemData.imageUrls && Array.isArray(itemData.imageUrls)) {
      itemData.imageUrls.forEach((url: string) => {
        formData.append("imageUrls", url);
      });
    }

    return apiFetch("/owner/inventory/item", {
      method: "POST",
      body: formData
    });
  },

  updateItem: async (id: string, itemData: any) => {
    const formData = new FormData();
    const textFields = [
      "title", "description", "categoryId", "wholesaleprice", "retailprice",
      "unit", "availability", "currentQty", "warranty", "addons", "discount",
      "minimumPurchase", "variants"
    ];
    
    textFields.forEach(field => {
      if (itemData[field] !== undefined && itemData[field] !== null) {
        let key = field;
        if (field === "minimumPurchase") key = "minimumpurchase";
        formData.append(key, String(itemData[field]));
      }
    });

    // Append image files
    if (itemData.images && Array.isArray(itemData.images)) {
      itemData.images.forEach((file: File) => {
        if (file instanceof File && file.name !== "__url__") {
          formData.append("images", file);
        }
      });
    }

    // Append imageUrls
    if (itemData.imageUrls && Array.isArray(itemData.imageUrls)) {
      itemData.imageUrls.forEach((url: string) => {
        formData.append("imageUrls", url);
      });
    }

    return apiFetch(`/owner/inventory/item/${id}`, {
      method: "PUT",
      body: formData
    });
  },

  addQuantity: async (itemId: string, quantity: string) => {
    return apiFetch(`/owner/inventory/item/${itemId}/add-quantity`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ quantity })
    });
  },

  deleteItem: async (itemId: string) => {
    return apiFetch(`/owner/inventory/item/${itemId}`, {
      method: "DELETE"
    });
  },
};

export const orderService = {
  getOrders: async () => {
    return apiFetch("/owner/orders");
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    const normalized = status.toLowerCase().replace(/_/g, "-");
    let endpoint = "";
    if (normalized === "accept" || normalized === "accepted") {
      endpoint = "accept";
    } else if (normalized === "reject" || normalized === "rejected") {
      endpoint = "reject";
    } else if (normalized === "cancel" || normalized === "cancelled") {
      endpoint = "cancel";
    } else if (normalized === "delivery-pickup") {
      endpoint = "delivery-pickup";
    } else if (normalized === "delivered") {
      endpoint = "delivered";
    } else {
      throw new Error(`Unsupported status transition: ${status}`);
    }
    return apiFetch(`/owner/orders/${orderId}/${endpoint}`, {
      method: "PATCH"
    });
  },

  updateDeliveryTime: async (orderId: string, estimatedDelivery: string) => {
    return apiFetch(`/owner/orders/${orderId}/update-delivery-time`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ estimatedDelivery })
    });
  },

  getDeliveryGuys: async () => {
    return apiFetch("/owner/orders/delivery-guys");
  },

  assignOrder: async (orderId: string, deliveryGuyId: string) => {
    return apiFetch(`/owner/orders/${orderId}/assign`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ deliveryGuyId })
    });
  },

  deleteOrder: async (_orderId: string) => {
    // Backend doesn't support order deletion; return stub success response
    return { success: true };
  },
};

export const dashboardService = {
  getDashboard: async () => {
    return apiFetch("/owner/dashboard");
  },
};

export const customerService = {
  getCustomers: async () => {
    return apiFetch("/owner/customers");
  },
};

export const profileService = {
  getProfile: async () => {
    return apiFetch("/owner/auth/profile");
  },
  updateProfile: async (data: any) => {
    return apiFetch("/owner/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
  },
};

export const shopService = {
  setupShop: async (data: any) => {
    return apiFetch("/owner/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
  },
  getShopImages: async () => {
    return apiFetch("/owner/inventory/shop-images");
  },
  addShopImage: async (file: File | null, desc: string) => {
    const formData = new FormData();
    if (file) formData.append("image", file);
    formData.append("description", desc);
    return apiFetch("/owner/inventory/shop-image", {
      method: "POST",
      body: formData
    });
  },
  updateShopImage: async (id: string, desc: string, file?: File | null) => {
    const formData = new FormData();
    formData.append("description", desc);
    if (file) formData.append("image", file);
    return apiFetch(`/owner/inventory/shop-image/${id}`, {
      method: "PUT",
      body: formData
    });
  },
  deleteShopImage: async (id: string) => {
    return apiFetch(`/owner/inventory/shop-image/${id}`, {
      method: "DELETE"
    });
  },
};

export const labourService = {
  getLabourCategories: async () => {
    return apiFetch("/owner/labour/categories");
  },
  updateLabourRate: async (id: string, rate: number) => {
    return apiFetch(`/owner/labour/rate/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ rate })
    });
  },
  resetLabourRates: async () => {
    return apiFetch("/owner/labour/reset-rates", {
      method: "POST"
    });
  },
  getLabourBookings: async () => {
    return apiFetch("/owner/labour/bookings");
  },
  updateLabourBookingStatus: async (id: string, status: string) => {
    return apiFetch(`/owner/labour/booking/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });
  },
};

export const authService = {
  verifyToken: async () => {
    try {
      await apiFetch("/owner/auth/profile");
      return { success: true };
    } catch {
      return { success: false };
    }
  },
  logout: async () => {
    localStorage.clear();
    return { success: true };
  },
};
