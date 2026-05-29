// Admin API - DUMMY DATA MODE (Backend Disconnected)

// ── Dummy Data ──────────────────────────────────────────────

const DUMMY_CATEGORIES = [
  { id: "cat-1", title: "Power Tools", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=300&auto=format&fit=crop", createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: "cat-2", title: "Cement & Sand", image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=300&auto=format&fit=crop", createdAt: new Date(Date.now() - 8 * 86400000).toISOString() },
  { id: "cat-3", title: "Electricals", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=300&auto=format&fit=crop", createdAt: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: "cat-4", title: "Paints", image: "https://images.unsplash.com/photo-1595206133361-b1fe343e5e23?q=80&w=300&auto=format&fit=crop", createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: "cat-5", title: "Plumbing", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=300&auto=format&fit=crop", createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: "cat-6", title: "Safety Equipment", image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?q=80&w=300&auto=format&fit=crop", createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: "cat-7", title: "Hardware & Locks", image: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=300&auto=format&fit=crop", createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: "cat-8", title: "Steel & Iron", image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=300&auto=format&fit=crop", createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
];

const DUMMY_ITEMS = [
  { id: "item-1", title: "Bosch GSB 500 RE Professional Impact Drill Machine", retailprice: "2499", wholesaleprice: "2199", currentQty: 45, categoryId: "cat-1", category: { id: "cat-1", title: "Power Tools" }, images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop"], availability: "BOTH", unit: "piece", discount: 20, description: "Professional 500W impact drill for heavy-duty construction use.", warranty: "1 Year Brand Warranty", variants: [{ size: "500W Standard", price: 2499 }, { size: "600W Heavy Duty", price: 2999 }] },
  { id: "item-2", title: "Ultratech Premium Portland Pozzolana Cement (PPC)", retailprice: "375", wholesaleprice: "350", currentQty: 8, categoryId: "cat-2", category: { id: "cat-2", title: "Cement & Sand" }, images: ["https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=600&auto=format&fit=crop"], availability: "BOTH", unit: "bag", discount: 10, description: "Premium PPC cement for high-strength concrete structures.", warranty: "N/A", variants: [{ size: "50kg Bag", price: 375 }, { size: "1 Ton Bundle", price: 7200 }] },
  { id: "item-3", title: "Havells Life Line FR-LSH House Wire (90m)", retailprice: "1599", wholesaleprice: "1399", currentQty: 3, categoryId: "cat-3", category: { id: "cat-3", title: "Electricals" }, images: ["https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=600&auto=format&fit=crop"], availability: "BOTH", unit: "roll", discount: 15, description: "FR-LSH fire resistant copper house wire.", warranty: "20 Years", variants: [{ size: "1.5 Sqmm", price: 1599 }, { size: "2.5 Sqmm", price: 2499 }] },
  { id: "item-4", title: "Godrej Brass Nav-Tal Padlock 6-Levers", retailprice: "799", wholesaleprice: "699", currentQty: 62, categoryId: "cat-7", category: { id: "cat-7", title: "Hardware & Locks" }, images: ["https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=600&auto=format&fit=crop"], availability: "BOTH", unit: "piece", discount: 18, description: "Heavy-duty brass padlock with 6-lever security.", warranty: "5 Years", variants: [{ size: "50mm", price: 650 }, { size: "65mm", price: 799 }] },
  { id: "item-5", title: "Asian Paints Apex Ultima Exterior Emulsion White", retailprice: "3200", wholesaleprice: "2890", currentQty: 0, categoryId: "cat-4", category: { id: "cat-4", title: "Paints" }, images: ["https://images.unsplash.com/photo-1595206133361-b1fe343e5e23?q=80&w=600&auto=format&fit=crop"], availability: "BOTH", unit: "bucket", discount: 22, description: "Premium exterior emulsion with 7-year performance warranty.", warranty: "7 Years", variants: [{ size: "4 Litre", price: 1450 }, { size: "10 Litre", price: 3200 }] },
  { id: "item-6", title: "Supreme PVC Pressure Pipe 4 Inch Class-3 (6m)", retailprice: "499", wholesaleprice: "420", currentQty: 120, categoryId: "cat-5", category: { id: "cat-5", title: "Plumbing" }, images: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop"], availability: "BOTH", unit: "piece", discount: 12, description: "High-pressure uPVC pipe for water supply networks.", warranty: "10 Years", variants: [{ size: "3 Inch", price: 399 }, { size: "4 Inch", price: 499 }] },
  { id: "item-7", title: "Tata Tiscon TMT Steel Rebar Fe 550D", retailprice: "850", wholesaleprice: "760", currentQty: 5, categoryId: "cat-8", category: { id: "cat-8", title: "Steel & Iron" }, images: ["https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=600&auto=format&fit=crop"], availability: "BOTH", unit: "rod", discount: 8, description: "High-strength TMT rebar for earthquake-resistant structures.", warranty: "N/A", variants: [{ size: "10mm", price: 650 }, { size: "12mm", price: 850 }] },
  { id: "item-8", title: "Cera Brass Designer Basin Faucet Chrome Finish", retailprice: "1799", wholesaleprice: "1499", currentQty: 28, categoryId: "cat-5", category: { id: "cat-5", title: "Plumbing" }, images: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop"], availability: "BOTH", unit: "piece", discount: 25, description: "Premium brass faucet with ceramic disc cartridge.", warranty: "7 Years", variants: [{ size: "Standard Cold", price: 1799 }, { size: "Quarter Turn Mixer", price: 2999 }] },
];

const DUMMY_ORDERS = [
  { id: "ORD-2024-001", totalPrice: "4298", status: "DELIVERED", paymentType: "COD", createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), customer: { user: { name: "Rahul Sharma", email: "rahul@example.com" } }, deliveryAddress: { city: "Mumbai", state: "Maharashtra", pincode: "400001", flatnumber: 12 }, orderItems: [{ id: "oi-1", quantity: 1, unitPrice: "2499", lineTotal: "2499", item: { title: "Bosch GSB 500 RE Impact Drill", images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=300&auto=format&fit=crop"] } }] },
  { id: "ORD-2024-002", totalPrice: "3200", status: "PROCESSING", paymentType: "COD", createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), customer: { user: { name: "Priya Patel", email: "priya@example.com" } }, deliveryAddress: { city: "Delhi", state: "Delhi", pincode: "110001", flatnumber: 5 }, orderItems: [{ id: "oi-2", quantity: 1, unitPrice: "3200", lineTotal: "3200", item: { title: "Asian Paints Apex Ultima 10L", images: ["https://images.unsplash.com/photo-1595206133361-b1fe343e5e23?q=80&w=300&auto=format&fit=crop"] } }] },
  { id: "ORD-2024-003", totalPrice: "7500", status: "PENDING", paymentType: "COD", createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), customer: { user: { name: "Amit Kumar", email: "amit@example.com" } }, deliveryAddress: { city: "Bengaluru", state: "Karnataka", pincode: "560001", flatnumber: 8 }, orderItems: [{ id: "oi-3", quantity: 20, unitPrice: "375", lineTotal: "7500", item: { title: "Ultratech Cement 50kg Bag", images: ["https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=300&auto=format&fit=crop"] } }] },
  { id: "ORD-2024-004", totalPrice: "1599", status: "ACCEPTED", paymentType: "COD", createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), customer: { user: { name: "Sunita Verma", email: "sunita@example.com" } }, deliveryAddress: { city: "Pune", state: "Maharashtra", pincode: "411001", flatnumber: 33 }, orderItems: [{ id: "oi-4", quantity: 1, unitPrice: "1599", lineTotal: "1599", item: { title: "Havells House Wire 1.5 Sqmm 90m", images: ["https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=300&auto=format&fit=crop"] } }] },
  { id: "ORD-2024-005", totalPrice: "2550", status: "CANCELLED", paymentType: "COD", createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), customer: { user: { name: "Vikram Singh", email: "vikram@example.com" } }, deliveryAddress: { city: "Hyderabad", state: "Telangana", pincode: "500001", flatnumber: 17 }, orderItems: [{ id: "oi-5", quantity: 3, unitPrice: "850", lineTotal: "2550", item: { title: "Tata Tiscon TMT Rebar 12mm", images: ["https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=300&auto=format&fit=crop"] } }] },
];

const DUMMY_CUSTOMERS = [
  { id: "cust-1", user: { name: "Rahul Sharma", email: "rahul@example.com", profileimage: null }, city: "Mumbai", state: "Maharashtra", pincode: "400001", phone: "9876543210", type: "RETAILER", createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: "cust-2", user: { name: "Priya Patel", email: "priya@example.com", profileimage: null }, city: "Delhi", state: "Delhi", pincode: "110001", phone: "9876543211", type: "WHOLESALER", createdAt: new Date(Date.now() - 20 * 86400000).toISOString() },
  { id: "cust-3", user: { name: "Amit Kumar", email: "amit@example.com", profileimage: null }, city: "Bengaluru", state: "Karnataka", pincode: "560001", phone: "9876543212", type: "RETAILER", createdAt: new Date(Date.now() - 15 * 86400000).toISOString() },
  { id: "cust-4", user: { name: "Sunita Verma", email: "sunita@example.com", profileimage: null }, city: "Pune", state: "Maharashtra", pincode: "411001", phone: "9876543213", type: "RETAILER", createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: "cust-5", user: { name: "Vikram Singh", email: "vikram@example.com", profileimage: null }, city: "Hyderabad", state: "Telangana", pincode: "500001", phone: "9876543214", type: "WHOLESALER", createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
];

const DUMMY_DASHBOARD = {
  totalItems: DUMMY_ITEMS.length,
  totalCategories: DUMMY_CATEGORIES.length,
  totalOrders: DUMMY_ORDERS.length,
  pendingOrders: DUMMY_ORDERS.filter(o => o.status === "PENDING").length,
  recentOrders: DUMMY_ORDERS.slice(0, 5),
  lowStockItems: DUMMY_ITEMS.filter(i => i.currentQty <= 8).map(i => ({ id: i.id, title: i.title, currentQty: i.currentQty, minimumQty: 10 })),
};

const DUMMY_PROFILE = {
  user: { name: "Admin User", email: "admin@gharsekro.com", profileimage: null },
  shopname: "GharSeKro Hardware Store",
  shopaddress: [{ city: "Mumbai", state: "Maharashtra", pincode: "400001", flatnumber: 1 }],
  phone: "9876543200",
  gstnumber: "27ABCDE1234F1Z5",
};

// ── In-memory mutable state for demo CRUD ──────────────────
let _categories = [...DUMMY_CATEGORIES];
let _items = [...DUMMY_ITEMS];
let _orders = [...DUMMY_ORDERS];

// ── Service Exports ─────────────────────────────────────────

export const categoryService = {
  getCategories: async () => ({ success: true, categories: _categories }),
  addCategory: async (title: string, image: File | null, imageUrl?: string | null) => {
    const newCat = { id: `cat-${Date.now()}`, title, image: imageUrl || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=300&auto=format&fit=crop", createdAt: new Date().toISOString() };
    _categories = [..._categories, newCat];
    return { success: true, category: newCat };
  },
  updateCategory: async (id: string, title: string) => {
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
    const newItem = { id: `item-${Date.now()}`, ...itemData, images: itemData.imageUrls || ["https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop"], category: _categories.find(c => c.id === itemData.categoryId) || { id: itemData.categoryId, title: "Hardware" } };
    _items = [..._items, newItem];
    return { success: true, item: newItem };
  },
  addQuantity: async (itemId: string, quantity: string) => {
    _items = _items.map(i => i.id === itemId ? { ...i, currentQty: i.currentQty + parseInt(quantity) } : i);
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
    _orders = _orders.map(o => o.id === orderId ? { ...o, status } : o);
    return { success: true };
  },
};

export const dashboardService = {
  getDashboard: async () => ({
    success: true,
    data: {
      ...DUMMY_DASHBOARD,
      totalItems: _items.length,
      totalCategories: _categories.length,
      totalOrders: _orders.length,
      pendingOrders: _orders.filter(o => o.status === "PENDING").length,
      recentOrders: _orders.slice(0, 5),
      lowStockItems: _items.filter(i => i.currentQty <= 8).map(i => ({ id: i.id, title: i.title, currentQty: i.currentQty, minimumQty: 10 })),
    }
  }),
};

export const customerService = {
  getCustomers: async () => ({ success: true, customers: DUMMY_CUSTOMERS }),
};

export const profileService = {
  getProfile: async () => ({ success: true, profile: DUMMY_PROFILE }),
  updateProfile: async (data: any) => ({ success: true, profile: { ...DUMMY_PROFILE, ...data } }),
};

export const shopService = {
  setupShop: async (shopData: any) => ({ success: true }),
  getShopImages: async () => ({ success: true, images: [] }),
  addShopImage: async (formData: any) => ({ success: true }),
  deleteShopImage: async (id: string) => ({ success: true }),
};

export const authService = {
  verifyToken: async () => ({ success: true }),
  logout: async () => ({ success: true }),
};
