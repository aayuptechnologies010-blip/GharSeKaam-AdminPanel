// API Service for GharSeKro.com Admin Panel
import { apiCall, apiCallFormData, API_ENDPOINTS } from "./constants";

// Category API Services
export const categoryService = {
  // Get all categories
  getCategories: async () => {
    return await apiCall(API_ENDPOINTS.GET_CATEGORIES);
  },

  // Add new category
  addCategory: async (title, image) => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("image", image);

    return await apiCallFormData(API_ENDPOINTS.ADD_CATEGORY, formData);
  },

  // Update category (future implementation)
  updateCategory: async (id, title, image) => {
    const formData = new FormData();
    formData.append("title", title);
    if (image) {
      formData.append("image", image);
    }

    return await apiCallFormData(`/owner/inventory/category/${id}`, formData, {
      method: "PUT",
    });
  },

  // Delete category (future implementation)
  deleteCategory: async (id) => {
    return await apiCall(`/owner/inventory/category/${id}`, {
      method: "DELETE",
    });
  },
};

// Item API Services
export const itemService = {
  // Get all items or items by category
  getItems: async (categoryId) => {
    if (categoryId) {
      return await apiCall(
        `${API_ENDPOINTS.GET_ITEMS_BY_CATEGORY}/${categoryId}/items`
      );
    }
    return await apiCall(API_ENDPOINTS.GET_ITEMS);
  },

  // Get items by category (alias for clarity)
  getItemsByCategory: async (categoryId) => {
    return await apiCall(
      `${API_ENDPOINTS.GET_ITEMS_BY_CATEGORY}/${categoryId}/items`
    );
  },

  // Add new item
  addItem: async (itemData) => {
    const formData = new FormData();
    formData.append("title", itemData.title);
    formData.append("description", itemData.description);
    formData.append("wholesaleprice", itemData.wholesaleprice.toString());
    formData.append("retailprice", itemData.retailprice.toString());
    formData.append("unit", itemData.unit);
    formData.append("currentQty", itemData.currentQty.toString());
    formData.append("warranty", itemData.warranty);
    formData.append("discount", itemData.discount.toString());
    formData.append("categoryId", itemData.categoryId);
    formData.append("availability", itemData.availability);
    formData.append("minimumPurchase", itemData.minimumPurchase.toString());

    if (itemData.addons) {
      formData.append("addons", itemData.addons);
    }

    // Handle variants
    if (itemData.variants) {
      formData.append("variants", itemData.variants);
    }

    // Handle multiple images
    if (itemData.images && itemData.images.length > 0) {
      itemData.images.forEach((image, index) => {
        formData.append("images", image);
      });
    }

    return await apiCallFormData(API_ENDPOINTS.ADD_ITEM, formData);
  },

  // Update existing item
  updateItem: async (itemId, itemData) => {
    const body = {
      title: itemData.title,
      wholesaleprice: parseFloat(itemData.wholesaleprice),
      retailprice: parseFloat(itemData.retailprice),
      unit: itemData.unit,
      description: itemData.description,
      currentQty: parseInt(itemData.currentQty),
      warranty: itemData.warranty,
      addons: itemData.addons,
      discount: parseFloat(itemData.discount),
      categoryId: itemData.categoryId,
      minimumPurchase: parseInt(itemData.minimumPurchase),
    };

    // Include variants if provided
    if (itemData.variants) {
      body.variants = itemData.variants;
    }

    return await apiCall(`${API_ENDPOINTS.UPDATE_ITEM}/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  },

  // Add quantity to existing item
  addQuantity: async (itemId, quantity) => {
    return await apiCall(
      `${API_ENDPOINTS.ADD_ITEM_QUANTITY}/${itemId}/add-quantity`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: parseInt(quantity),
        }),
      }
    );
  },

  // Delete item (future implementation)
  deleteItem: async (itemId) => {
    return await apiCall(`${API_ENDPOINTS.UPDATE_ITEM}/${itemId}`, {
      method: "DELETE",
    });
  },
};

// Order API Services
export const orderService = {
  // Get all orders
  getOrders: async () => {
    return await apiCall(API_ENDPOINTS.GET_ORDERS);
  },

  // Update order status - direct status endpoint
  updateOrderStatus: async (orderId, status) => {
    return await apiCall(
      `${API_ENDPOINTS.UPDATE_ORDER_STATUS}/${orderId}/${status}`,
      {
        method: "PATCH",
      }
    );
  },
};

// Shop Setup API Services
export const shopService = {
  // Setup shop
  setupShop: async (shopData) => {
    const formData = new FormData();
    formData.append("shopName", shopData.shopName);
    formData.append("ownerName", shopData.ownerName);
    formData.append("phone", shopData.phone);
    formData.append("address", shopData.address);
    formData.append("pincode", shopData.pincode);

    if (shopData.logo) {
      formData.append("logo", shopData.logo);
    }

    return await apiCallFormData(API_ENDPOINTS.SETUP_SHOP, formData);
  },
};

// Authentication API Services
export const authService = {
  // Verify token
  verifyToken: async () => {
    return await apiCall("/auth/verify");
  },

  // Logout
  logout: async () => {
    return await apiCall("/auth/logout", {
      method: "POST",
    });
  },
};

// Dashboard API Services
export const dashboardService = {
  // Get dashboard stats and recent data
  getDashboard: async () => {
    return await apiCall(API_ENDPOINTS.GET_DASHBOARD);
  },
};

// Customer API Services
export const customerService = {
  // Get all customers with history and stats
  getCustomers: async () => {
    return await apiCall(API_ENDPOINTS.GET_CUSTOMERS);
  },
};

// Profile API Services
export const profileService = {
  // Get shopkeeper profile from database
  getProfile: async () => {
    return await apiCall(API_ENDPOINTS.GET_PROFILE);
  },

  // Update shopkeeper profile (name, phone, shopname)
  updateProfile: async (data) => {
    return await apiCall(API_ENDPOINTS.UPDATE_PROFILE, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
};

