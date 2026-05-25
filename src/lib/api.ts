// API Service for GharSeKro.com Admin Panel
import { apiCall, apiCallFormData, API_ENDPOINTS } from "./constants";

// Category API Services
export const categoryService = {
  // Get all categories
  getCategories: async () => {
    return await apiCall(API_ENDPOINTS.GET_CATEGORIES);
  },

  // Add new category
  addCategory: async (title: string, image: File) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('image', image);
    
    return await apiCallFormData(API_ENDPOINTS.ADD_CATEGORY, formData);
  },

  // Update category (future implementation)
  updateCategory: async (id: string, title: string, image?: File, description?: string) => {
    const formData = new FormData();
    formData.append('title', title);
    if (description) {
      formData.append('description', description);
    }
    if (image) {
      formData.append('image', image);
    }

    return await apiCallFormData(`/owner/inventory/category/${id}`, formData, {
      method: 'PUT'
    });
  },

  // Delete category (future implementation)
  deleteCategory: async (id: string) => {
    return await apiCall(`/owner/inventory/category/${id}`, {
      method: 'DELETE'
    });
  }
};

// Item API Services (future implementation)
export const itemService = {
  // Get all items
  getItems: async (categoryId?: string) => {
    const endpoint = categoryId 
      ? `${API_ENDPOINTS.GET_ITEMS}?category=${categoryId}`
      : API_ENDPOINTS.GET_ITEMS;
    return await apiCall(endpoint);
  },

  // Add new item
  addItem: async (itemData: {
    title: string;
    description: string;
    price: number;
    categoryId: string;
    image?: File;
  }) => {
    const formData = new FormData();
    formData.append('title', itemData.title);
    formData.append('description', itemData.description);
    formData.append('price', itemData.price.toString());
    formData.append('categoryId', itemData.categoryId);
    
    if (itemData.image) {
      formData.append('image', itemData.image);
    }
    
    return await apiCallFormData(API_ENDPOINTS.ADD_ITEM, formData);
  }
};

// Order API Services (future implementation)
export const orderService = {
  // Get all orders
  getOrders: async () => {
    return await apiCall(API_ENDPOINTS.GET_ORDERS);
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string) => {
    return await apiCall(`/owner/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
  }
};

// Shop Setup API Services
export const shopService = {
  // Setup shop
  setupShop: async (shopData: {
    shopName: string;
    ownerName: string;
    phone: string;
    address: string;
    pincode: string;
    logo?: File;
  }) => {
    const formData = new FormData();
    formData.append('shopName', shopData.shopName);
    formData.append('ownerName', shopData.ownerName);
    formData.append('phone', shopData.phone);
    formData.append('address', shopData.address);
    formData.append('pincode', shopData.pincode);
    
    if (shopData.logo) {
      formData.append('logo', shopData.logo);
    }
    
    return await apiCallFormData(API_ENDPOINTS.SETUP_SHOP, formData);
  }
};

// Authentication API Services
export const authService = {
  // Verify token
  verifyToken: async () => {
    return await apiCall('/auth/verify');
  },

  // Logout
  logout: async () => {
    return await apiCall('/auth/logout', {
      method: 'POST'
    });
  }
};

// Customer API Services
export const customerService = {
  // Get all customers
  getCustomers: async () => {
    return await apiCall(API_ENDPOINTS.GET_CUSTOMERS || '/owner/customers');
  }
};
