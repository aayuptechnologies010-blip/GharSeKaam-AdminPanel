// ── DUMMY DATA MODE — Backend Disconnected ───────────────────

const DUMMY_CATEGORIES = [
  { id: "cat-1", title: "Power Tools", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=300&auto=format&fit=crop", createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: "cat-2", title: "Cement & Sand", image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=300&auto=format&fit=crop", createdAt: new Date(Date.now() - 8 * 86400000).toISOString() },
  { id: "cat-3", title: "Electricals", image: "https://images.unsplash.com/photo-1601597111158-2fceff270190?q=80&w=300&auto=format&fit=crop", createdAt: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: "cat-4", title: "Paints", image: "https://images.unsplash.com/photo-1562973831-2d378b66d4c1?q=80&w=300&auto=format&fit=crop", createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: "cat-5", title: "Plumbing", image: "https://images.unsplash.com/photo-1585131838827-0fa870c52bb3?q=80&w=300&auto=format&fit=crop", createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: "cat-6", title: "Safety Equipment", image: "https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?q=80&w=300&auto=format&fit=crop", createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: "cat-7", title: "Hardware & Locks", image: "https://images.unsplash.com/photo-1590397576390-67258d537f59?q=80&w=300&auto=format&fit=crop", createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: "cat-8", title: "Steel & Iron", image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=300&auto=format&fit=crop", createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
];

const DUMMY_ITEMS = [
  { id: "item-1", title: "Bosch GSB 500 RE Professional Impact Drill Machine", retailprice: "2499", wholesaleprice: "2199", currentQty: 45, categoryId: "cat-1", category: { id: "cat-1", title: "Power Tools" }, images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop"], availability: "BOTH", unit: "piece", discount: 20, description: "Professional 500W impact drill.", warranty: "1 Year", variants: [{ size: "500W Standard", price: 2499 }, { size: "600W Heavy Duty", price: 2999 }] },
  { id: "item-2", title: "Ultratech Premium Portland Pozzolana Cement (PPC)", retailprice: "375", wholesaleprice: "350", currentQty: 8, categoryId: "cat-2", category: { id: "cat-2", title: "Cement & Sand" }, images: ["https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=600&auto=format&fit=crop"], availability: "BOTH", unit: "bag", discount: 10, description: "Premium PPC cement.", warranty: "N/A", variants: [{ size: "50kg Bag", price: 375 }, { size: "1 Ton Bundle", price: 7200 }] },
  { id: "item-3", title: "Havells Life Line FR-LSH House Wire (90m)", retailprice: "1599", wholesaleprice: "1399", currentQty: 3, categoryId: "cat-3", category: { id: "cat-3", title: "Electricals" }, images: ["https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=600&auto=format&fit=crop"], availability: "BOTH", unit: "roll", discount: 15, description: "FR-LSH fire resistant copper wire.", warranty: "20 Years", variants: [{ size: "1.5 Sqmm", price: 1599 }, { size: "2.5 Sqmm", price: 2499 }] },
  { id: "item-4", title: "Godrej Brass Nav-Tal Padlock 6-Levers", retailprice: "799", wholesaleprice: "699", currentQty: 62, categoryId: "cat-7", category: { id: "cat-7", title: "Hardware & Locks" }, images: ["https://images.unsplash.com/photo-1590397576390-67258d537f59?q=80&w=600&auto=format&fit=crop"], availability: "BOTH", unit: "piece", discount: 18, description: "Heavy-duty brass padlock.", warranty: "5 Years", variants: [{ size: "50mm", price: 650 }, { size: "65mm", price: 799 }] },
  { id: "item-5", title: "Asian Paints Apex Ultima Exterior Emulsion White", retailprice: "3200", wholesaleprice: "2890", currentQty: 0, categoryId: "cat-4", category: { id: "cat-4", title: "Paints" }, images: ["https://images.unsplash.com/photo-1562973831-2d378b66d4c1?q=80&w=600&auto=format&fit=crop"], availability: "BOTH", unit: "bucket", discount: 22, description: "Premium exterior emulsion.", warranty: "7 Years", variants: [{ size: "4 Litre", price: 1450 }, { size: "10 Litre", price: 3200 }] },
  { id: "item-6", title: "Supreme PVC Pressure Pipe 4 Inch Class-3 (6m)", retailprice: "499", wholesaleprice: "420", currentQty: 120, categoryId: "cat-5", category: { id: "cat-5", title: "Plumbing" }, images: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop"], availability: "BOTH", unit: "piece", discount: 12, description: "High-pressure uPVC pipe.", warranty: "10 Years", variants: [{ size: "3 Inch", price: 399 }, { size: "4 Inch", price: 499 }] },
  { id: "item-7", title: "Tata Tiscon TMT Steel Rebar Fe 550D", retailprice: "850", wholesaleprice: "760", currentQty: 5, categoryId: "cat-8", category: { id: "cat-8", title: "Steel & Iron" }, images: ["https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=600&auto=format&fit=crop"], availability: "BOTH", unit: "rod", discount: 8, description: "High-strength TMT rebar.", warranty: "N/A", variants: [{ size: "10mm", price: 650 }, { size: "12mm", price: 850 }] },
  { id: "item-8", title: "Cera Brass Designer Basin Faucet Chrome Finish", retailprice: "1799", wholesaleprice: "1499", currentQty: 28, categoryId: "cat-5", category: { id: "cat-5", title: "Plumbing" }, images: ["https://images.unsplash.com/photo-1609840114035-3c97126944e8?q=80&w=600&auto=format&fit=crop"], availability: "BOTH", unit: "piece", discount: 25, description: "Premium brass faucet.", warranty: "7 Years", variants: [{ size: "Standard Cold", price: 1799 }, { size: "Quarter Turn Mixer", price: 2999 }] },
];

const DUMMY_ORDERS = [
  { id: "ORD-2024-001", totalPrice: "4298", status: "DELIVERED", paymentType: "COD", createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), customerId: "cust-1", shopkeeperId: "shop-1", deliveryAddressId: "addr-1", updatedAt: new Date().toISOString(), customer: { id: "cust-1", user: { name: "Rahul Sharma", email: "rahul@example.com" } }, deliveryAddress: { city: "Mumbai", state: "Maharashtra", pincode: "400001", flatnumber: 12, latitude: 19.0760, longitude: 72.8777 }, orderItems: [{ id: "oi-1", orderId: "ORD-2024-001", itemId: "item-1", quantity: 1, unitPrice: "2499", lineTotal: "2499", variants: null, item: { title: "Bosch GSB 500 RE Impact Drill", unit: "piece", variants: null } }] },
  { id: "ORD-2024-002", totalPrice: "3200", status: "PROCESSING", paymentType: "COD", createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), customerId: "cust-2", shopkeeperId: "shop-1", deliveryAddressId: "addr-2", updatedAt: new Date().toISOString(), customer: { id: "cust-2", user: { name: "Priya Patel", email: "priya@example.com" } }, deliveryAddress: { city: "Delhi", state: "Delhi", pincode: "110001", flatnumber: 5, latitude: 28.6139, longitude: 77.2090 }, orderItems: [{ id: "oi-2", orderId: "ORD-2024-002", itemId: "item-5", quantity: 1, unitPrice: "3200", lineTotal: "3200", variants: null, item: { title: "Asian Paints Apex Ultima 10L", unit: "bucket", variants: null } }] },
  { id: "ORD-2024-003", totalPrice: "7500", status: "PENDING", paymentType: "COD", createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), customerId: "cust-3", shopkeeperId: "shop-1", deliveryAddressId: "addr-3", updatedAt: new Date().toISOString(), customer: { id: "cust-3", user: { name: "Amit Kumar", email: "amit@example.com" } }, deliveryAddress: { city: "Bengaluru", state: "Karnataka", pincode: "560001", flatnumber: 8, latitude: 12.9716, longitude: 77.5946 }, orderItems: [{ id: "oi-3", orderId: "ORD-2024-003", itemId: "item-2", quantity: 20, unitPrice: "375", lineTotal: "7500", variants: null, item: { title: "Ultratech Cement 50kg Bag", unit: "bag", variants: null } }] },
  { id: "ORD-2024-004", totalPrice: "1599", status: "ACCEPTED", paymentType: "COD", createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), customerId: "cust-4", shopkeeperId: "shop-1", deliveryAddressId: "addr-4", updatedAt: new Date().toISOString(), customer: { id: "cust-4", user: { name: "Sunita Verma", email: "sunita@example.com" } }, deliveryAddress: { city: "Pune", state: "Maharashtra", pincode: "411001", flatnumber: 33, latitude: 18.5204, longitude: 73.8567 }, orderItems: [{ id: "oi-4", orderId: "ORD-2024-004", itemId: "item-3", quantity: 1, unitPrice: "1599", lineTotal: "1599", variants: null, item: { title: "Havells House Wire 1.5 Sqmm 90m", unit: "roll", variants: null } }] },
  { id: "ORD-2024-005", totalPrice: "2550", status: "CANCELLED", paymentType: "COD", createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), customerId: "cust-5", shopkeeperId: "shop-1", deliveryAddressId: "addr-5", updatedAt: new Date().toISOString(), customer: { id: "cust-5", user: { name: "Vikram Singh", email: "vikram@example.com" } }, deliveryAddress: { city: "Hyderabad", state: "Telangana", pincode: "500001", flatnumber: 17, latitude: 17.3850, longitude: 78.4867 }, orderItems: [{ id: "oi-5", orderId: "ORD-2024-005", itemId: "item-7", quantity: 3, unitPrice: "850", lineTotal: "2550", variants: null, item: { title: "Tata Tiscon TMT Rebar 12mm", unit: "rod", variants: null } }] },
];

const DUMMY_CUSTOMERS = [
  { id: "cust-1", type: "RETAILER" as const, shopname: "", shopnumber: "", gstnumber: "", adhaarnumber: "", user: { name: "Rahul Sharma", email: "rahul@example.com", phone: "9876543210", profileimage: null }, addresses: [{ id: "addr-1", flatnumber: 12, city: "Mumbai", state: "Maharashtra", pincode: "400001" }], orders: [{ id: "ORD-2024-001", totalPrice: 4298, status: "DELIVERED", createdAt: new Date(Date.now() - 7 * 86400000).toISOString() }], totalOrdersCount: 1, totalSpent: 4298, lastOrderDate: new Date(Date.now() - 7 * 86400000).toISOString(), createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: "cust-2", type: "WHOLESALER" as const, shopname: "Patel Hardware", shopnumber: "9876543211", gstnumber: "24ABCDE1234F1Z5", adhaarnumber: "123412341234", user: { name: "Priya Patel", email: "priya@example.com", phone: "9876543211", profileimage: null }, addresses: [{ id: "addr-2", flatnumber: 5, city: "Delhi", state: "Delhi", pincode: "110001" }], orders: [{ id: "ORD-2024-002", totalPrice: 3200, status: "PROCESSING", createdAt: new Date(Date.now() - 1 * 86400000).toISOString() }], totalOrdersCount: 1, totalSpent: 3200, lastOrderDate: new Date(Date.now() - 1 * 86400000).toISOString(), createdAt: new Date(Date.now() - 20 * 86400000).toISOString() },
  { id: "cust-3", type: "RETAILER" as const, shopname: "", shopnumber: "", gstnumber: "", adhaarnumber: "", user: { name: "Amit Kumar", email: "amit@example.com", phone: "9876543212", profileimage: null }, addresses: [{ id: "addr-3", flatnumber: 8, city: "Bengaluru", state: "Karnataka", pincode: "560001" }], orders: [{ id: "ORD-2024-003", totalPrice: 7500, status: "PENDING", createdAt: new Date(Date.now() - 2 * 3600000).toISOString() }], totalOrdersCount: 1, totalSpent: 7500, lastOrderDate: new Date(Date.now() - 2 * 3600000).toISOString(), createdAt: new Date(Date.now() - 15 * 86400000).toISOString() },
  { id: "cust-4", type: "RETAILER" as const, shopname: "", shopnumber: "", gstnumber: "", adhaarnumber: "", user: { name: "Sunita Verma", email: "sunita@example.com", phone: "9876543213", profileimage: null }, addresses: [{ id: "addr-4", flatnumber: 33, city: "Pune", state: "Maharashtra", pincode: "411001" }], orders: [{ id: "ORD-2024-004", totalPrice: 1599, status: "ACCEPTED", createdAt: new Date(Date.now() - 5 * 3600000).toISOString() }], totalOrdersCount: 1, totalSpent: 1599, lastOrderDate: new Date(Date.now() - 5 * 3600000).toISOString(), createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: "cust-5", type: "WHOLESALER" as const, shopname: "Singh Steel Traders", shopnumber: "9876543214", gstnumber: "36FGHIJ5678K2L6", adhaarnumber: "432143214321", user: { name: "Vikram Singh", email: "vikram@example.com", phone: "9876543214", profileimage: null }, addresses: [{ id: "addr-5", flatnumber: 17, city: "Hyderabad", state: "Telangana", pincode: "500001" }], orders: [{ id: "ORD-2024-005", totalPrice: 2550, status: "CANCELLED", createdAt: new Date(Date.now() - 3 * 86400000).toISOString() }], totalOrdersCount: 1, totalSpent: 2550, lastOrderDate: new Date(Date.now() - 3 * 86400000).toISOString(), createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
];

const DUMMY_PROFILE = {
  user: { name: "Admin User", email: "admin@gharsekro.com", phone: "9876543200", profileimage: null },
  shopname: "GharSeKro Hardware Store",
  shopaddress: [{ city: "Mumbai", state: "Maharashtra", pincode: "400001", flatnumber: 1 }],
  gstnumber: "27ABCDE1234F1Z5",
};

// ── In-memory mutable state ──────────────────────────────────
let _categories = [...DUMMY_CATEGORIES];
let _items = [...DUMMY_ITEMS];
let _orders = [...DUMMY_ORDERS];

// ── Services ─────────────────────────────────────────────────

export const categoryService = {
  getCategories: async () => ({ success: true, categories: _categories }),

  addCategory: async (title: string, _image: File | null, imageUrl?: string | null) => {
    const newCat = {
      id: `cat-${Date.now()}`,
      title,
      image: imageUrl || "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?q=80&w=300&auto=format&fit=crop",
      createdAt: new Date().toISOString(),
    };
    _categories = [..._categories, newCat];
    return { success: true, category: newCat };
  },

  updateCategory: async (id: string, title: string, _image?: File | null) => {
    _categories = _categories.map(c => c.id === id ? { ...c, title } : c);
    return { success: true };
  },

  deleteCategory: async (id: string) => {
    _categories = _categories.filter(c => c.id !== id);
    return { success: true };
  },
};

export const itemService = {
  getItems: async (categoryId?: string) => {
    const items = categoryId ? _items.filter(i => i.categoryId === categoryId) : _items;
    return { success: true, items };
  },

  addItem: async (itemData: any) => {
    const cat = _categories.find(c => c.id === itemData.categoryId);
    const newItem = {
      id: `item-${Date.now()}`,
      ...itemData,
      images: itemData.imageUrls?.length ? itemData.imageUrls : ["https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?q=80&w=600&auto=format&fit=crop"],
      category: cat ? { id: cat.id, title: cat.title } : { id: itemData.categoryId, title: "Hardware" },
    };
    _items = [..._items, newItem];
    return { success: true, item: newItem };
  },

  updateItem: async (id: string, itemData: any) => {
    _items = _items.map(i => i.id === id ? { ...i, ...itemData } : i);
    return { success: true };
  },

  addQuantity: async (itemId: string, quantity: string) => {
    _items = _items.map(i => i.id === itemId ? { ...i, currentQty: (i.currentQty || 0) + parseInt(quantity) } : i);
    return { success: true };
  },

  deleteItem: async (itemId: string) => {
    _items = _items.filter(i => i.id !== itemId);
    return { success: true };
  },
};

export const orderService = {
  getOrders: async () => ({ success: true, orders: _orders }),

  updateOrderStatus: async (orderId: string, status: string) => {
    const statusMap: Record<string, string> = {
      accept: "ACCEPTED", accepted: "ACCEPTED",
      reject: "REJECTED", rejected: "REJECTED",
      cancel: "CANCELLED", cancelled: "CANCELLED",
      "delivery-pickup": "DELIVERY-PICKUP",
      delivered: "DELIVERED",
    };
    const newStatus = statusMap[status.toLowerCase()] || status.toUpperCase();
    _orders = _orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    return { success: true };
  },

  deleteOrder: async (orderId: string) => {
    _orders = _orders.filter(o => o.id !== orderId);
    return { success: true };
  },
};

export const dashboardService = {
  getDashboard: async () => ({
    success: true,
    data: {
      totalItems: _items.length,
      totalCategories: _categories.length,
      totalOrders: _orders.length,
      pendingOrders: _orders.filter(o => ["PENDING", "PROCESSING"].includes(o.status)).length,
      recentOrders: _orders.slice(0, 5),
      lowStockItems: _items
        .filter(i => i.currentQty <= 8)
        .map(i => ({ id: i.id, title: i.title, currentQty: i.currentQty, minimumQty: 10 })),
    },
  }),
};

export const customerService = {
  getCustomers: async () => ({ success: true, customers: DUMMY_CUSTOMERS }),
};

export const profileService = {
  getProfile: async () => ({ success: true, profile: DUMMY_PROFILE }),
  updateProfile: async (data: any) => {
    Object.assign(DUMMY_PROFILE.user, data);
    if (data.shopname) DUMMY_PROFILE.shopname = data.shopname;
    return { success: true, profile: DUMMY_PROFILE };
  },
};

export const shopService = {
  setupShop: async (_data: any) => ({ success: true }),
  getShopImages: async () => ({ success: true, images: [] }),
  addShopImage: async (_file: File | null, _desc: string) => ({ success: true }),
  updateShopImage: async (_id: string, _desc: string) => ({ success: true }),
  deleteShopImage: async (_id: string) => ({ success: true }),
};

export const labourService = {
  getLabourCategories: async () => ({ success: true, categories: [] }),
  updateLabourRate: async (_id: string, _rate: number) => ({ success: true }),
  resetLabourRates: async () => ({ success: true }),
  getLabourBookings: async () => ({ success: true, bookings: [] }),
  updateLabourBookingStatus: async (_id: string, _status: string) => ({ success: true }),
};

export const authService = {
  verifyToken: async () => ({ success: true }),
  logout: async () => { localStorage.clear(); return { success: true }; },
};
