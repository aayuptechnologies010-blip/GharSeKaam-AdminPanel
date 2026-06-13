import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ShoppingCart,
  FolderOpen,
  TrendingUp,
  Plus,
  Eye,
  Activity,
  IndianRupee,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dashboardService, categoryService, itemService, orderService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface DashboardStats {
  totalItems: number;
  totalCategories: number;
  totalOrders: number;
  pendingOrders: number;
}

interface RecentOrder {
  id: string;
  totalPrice: string;
  status: string;
  createdAt: string;
  customer?: {
    user?: {
      name: string;
      email: string;
    };
  };
  deliveryAddress?: {
    city: string;
    state: string;
    pincode: string;
    flatnumber: string;
  };
}

interface LowStockItem {
  id: string;
  title: string;
  currentQty: number;
  minimumQty?: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  lowStockItems: LowStockItem[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData>({
    stats: {
      totalItems: 0,
      totalCategories: 0,
      totalOrders: 0,
      pendingOrders: 0
    },
    recentOrders: [],
    lowStockItems: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Revenue analytics states
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    grossSales: 0,
    codRevenue: 0,
    cashRevenue: 0
  });
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<any[]>([]);

  // Baseline dummy data to fall back on if store is empty
  const defaultSalesTrend = [
    { name: "Mon", Sales: 0, Orders: 0 },
    { name: "Tue", Sales: 0, Orders: 0 },
    { name: "Wed", Sales: 0, Orders: 0 },
    { name: "Thu", Sales: 0, Orders: 0 },
    { name: "Fri", Sales: 0, Orders: 0 },
    { name: "Sat", Sales: 0, Orders: 0 },
    { name: "Sun", Sales: 0, Orders: 0 },
  ];

  const defaultCategoryDistribution = [
    { name: "Empty", value: 100, color: "#cbd5e1" }
  ];

  const [salesTrend, setSalesTrend] = useState<any[]>(defaultSalesTrend);
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>(defaultCategoryDistribution);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Establish WebSocket connection for real-time dashboard updates
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    let shopkeeperId = '';
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadDecoded = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
      shopkeeperId = payloadDecoded.shopkeeperid || payloadDecoded.userid || '';
    } catch (e) {
      console.error("Failed to decode token for WS dashboard:", e);
    }

    if (!shopkeeperId) return;

    const wsUrl = `ws://localhost:3000/?role=owner&id=${shopkeeperId}`;
    console.log("[WS Dashboard] Connecting to:", wsUrl);

    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("[WS Dashboard] Connected as owner", shopkeeperId);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === 'NEW_ORDER') {
            toast({
              title: "🚨 New Order Placed!",
              description: `A new order #${payload.data.id.slice(-8)} has been placed!`,
            });
            // Reload dashboard data
            fetchDashboardData();
          } else if (payload.event === 'ORDER_STATUS_UPDATE') {
            // Reload dashboard data
            fetchDashboardData();
          }
        } catch (err) {
          console.error("[WS Dashboard] Error handling message:", err);
        }
      };

      ws.onerror = (err) => {
        console.log("[WS Dashboard] Error:", err);
      };

      ws.onclose = () => {
        console.log("[WS Dashboard] Disconnected");
      };
    } catch (err) {
      console.error("[WS Dashboard] Connection error:", err);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [toast]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Parallel resilient requests - catching individual promise failures gracefully
      const [dashRes, catRes, itemRes, orderRes] = await Promise.all([
        dashboardService.getDashboard().catch(err => {
          console.error("Dashboard stats fetch failed:", err);
          return { success: false, data: null };
        }),
        categoryService.getCategories().catch(err => {
          console.error("Categories fetch failed:", err);
          return { success: false, categories: [] };
        }),
        itemService.getItems().catch(err => {
          console.error("Items fetch failed:", err);
          return { success: false, items: [] };
        }),
        orderService.getOrders().catch(err => {
          console.error("Orders fetch failed:", err);
          return { success: false, orders: [] };
        })
      ]);

      if (dashRes && dashRes.success && dashRes.data) {
        setData({
          stats: {
            totalItems: dashRes.data.totalItems || 0,
            totalCategories: dashRes.data.totalCategories || 0,
            totalOrders: dashRes.data.totalOrders || 0,
            pendingOrders: dashRes.data.pendingOrders || 0
          },
          recentOrders: dashRes.data.recentOrders || [],
          lowStockItems: dashRes.data.lowStockItems || []
        });

        // 1. Compute Category Shares dynamically based on active items
        if (catRes && catRes.success && itemRes && itemRes.success) {
          const categoriesList = catRes.categories || [];
          const itemsList = itemRes.items || [];
          
          if (itemsList.length > 0 && categoriesList.length > 0) {
            const counts: { [key: string]: number } = {};
            categoriesList.forEach((c: any) => {
              counts[c.id] = 0;
            });

            itemsList.forEach((item: any) => {
              if (counts[item.categoryId] !== undefined) {
                counts[item.categoryId]++;
              }
            });

            const colors = ["#1e3a5f", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#f43f5e", "#06b6d4"];
            const distribution = categoriesList
              .map((c: any, index: number) => {
                const count = counts[c.id] || 0;
                const value = Math.round((count / itemsList.length) * 100);
                return {
                  name: c.title,
                  value: value,
                  color: colors[index % colors.length]
                };
              })
              .filter((d: any) => d.value > 0);

            if (distribution.length > 0) {
              setCategoryDistribution(distribution);
            }
          }
        }

        // 2. Compute Weekly Sales Trends dynamically from real orders
        if (orderRes && orderRes.success && orderRes.orders) {
          const allOrders = orderRes.orders || [];
          
          const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const salesMap: { [key: string]: { sales: number; count: number } } = {};
          
          // Initialize last 7 calendar days
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayName = daysOfWeek[d.getDay()];
            salesMap[dayName] = { sales: 0, count: 0 };
          }

          allOrders.forEach((o: any) => {
            const date = new Date(o.createdAt);
            const dayName = daysOfWeek[date.getDay()];
            if (salesMap[dayName]) {
              salesMap[dayName].sales += parseFloat(o.totalPrice || 0);
              salesMap[dayName].count++;
            }
          });

          const trendData: any[] = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayName = daysOfWeek[d.getDay()];
            trendData.push({
              name: dayName,
              Sales: Math.round(salesMap[dayName].sales),
              Orders: salesMap[dayName].count
            });
          }
          
          setSalesTrend(trendData);

          // Compute Revenue Stats
          let totalDeliveredRevenue = 0;
          let grossSales = 0;
          let codRevenue = 0;
          let cashRevenue = 0;

          allOrders.forEach((o: any) => {
            const price = parseFloat(o.totalPrice || 0);
            grossSales += price;
            
            const statusLower = (o.status || "").toLowerCase();
            const isDelivered = statusLower === "delivered";
            if (isDelivered) {
              totalDeliveredRevenue += price;
            }

            const isCod = o.paymentType === "COD";
            const isCash = o.paymentType === "CASH";

            if (isCod) {
              codRevenue += price;
            } else if (isCash) {
              cashRevenue += price;
            }
          });

          setRevenueStats({
            totalRevenue: Math.round(totalDeliveredRevenue),
            grossSales: Math.round(grossSales),
            codRevenue: Math.round(codRevenue),
            cashRevenue: Math.round(cashRevenue)
          });

          // Compute Monthly Revenue Trends
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const monthlyMap: { [key: string]: number } = {};
          
          // Initialize last 6 months
          for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            monthlyMap[monthNames[d.getMonth()]] = 0;
          }

          allOrders.forEach((o: any) => {
            const date = new Date(o.createdAt);
            const mName = monthNames[date.getMonth()];
            if (monthlyMap[mName] !== undefined) {
              const statusLower = (o.status || "").toLowerCase();
              if (statusLower !== "cancelled" && statusLower !== "cancel" && statusLower !== "rejected" && statusLower !== "reject") {
                monthlyMap[mName] += parseFloat(o.totalPrice || 0);
              }
            }
          });

          const monthlyTrend = Object.entries(monthlyMap).map(([name, revenue]) => ({
            name,
            Revenue: Math.round(revenue)
          }));

          setMonthlyRevenueData(monthlyTrend);
        }
      } else {
        throw new Error("Failed to load core dashboard stats. Please check backend connection.");
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast({
        title: "Error loading dashboard",
        description: error instanceof Error ? error.message : "Failed to fetch dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Add New Item",
      description: "Add products to your inventory",
      icon: Plus,
      action: () => navigate("/inventory/add-item"),
      color: "bg-blue-600 shadow-blue-100 hover:bg-blue-700"
    },
    {
      title: "Add Category",
      description: "Create new product categories",
      icon: FolderOpen,
      action: () => navigate("/inventory/add-category"),
      color: "bg-amber-500 shadow-amber-100 hover:bg-amber-600"
    },
    {
      title: "View Orders",
      description: "Check recent customer orders",
      icon: ShoppingCart,
      action: () => navigate("/orders"),
      color: "bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700"
    },
    {
      title: "View Items",
      description: "Browse your inventory",
      icon: Package,
      action: () => navigate("/inventory/items"),
      color: "bg-indigo-600 shadow-indigo-100 hover:bg-indigo-700"
    }
  ];

  const statsCards = [
    {
      title: "Total Products",
      value: data.stats.totalItems,
      icon: Package,
      gradient: "from-blue-600 to-indigo-700",
      description: "Available items in inventory",
    },
    {
      title: "Active Categories",
      value: data.stats.totalCategories,
      icon: FolderOpen,
      gradient: "from-emerald-500 to-teal-700",
      description: "Product catalog categories",
    },
    {
      title: "Total Booked Orders",
      value: data.stats.totalOrders,
      icon: ShoppingCart,
      gradient: "from-purple-600 to-violet-700",
      description: "Purchases made by customers",
    },
    {
      title: "Pending Orders",
      value: data.stats.pendingOrders,
      icon: TrendingUp,
      gradient: "from-amber-500 to-orange-600",
      description: "Orders awaiting acceptance",
    }
  ];

  return (
    <div className="space-y-8 font-sans">
      
      {/* ── Welcome Header Section ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-[#1e3a5f] to-[#f59e0b] bg-clip-text text-transparent">
            GharSeKro Admin Portal
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Real-time management dashboard of your store inventory, orders, and sales activity
          </p>
        </div>
        <div className="flex items-center gap-3 self-start lg:self-center">
          <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping shrink-0" />
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full shadow-sm">
            STORE LIVE & ONLINE
          </span>
        </div>
      </div>

      {/* ── Stats Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, i) => (
          <Card key={i} className="bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative group">
            {/* Top border colored line */}
            <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
            
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
                  <p className="text-3xl font-black text-slate-800 tracking-tight group-hover:scale-105 origin-left transition-transform duration-300">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">{stat.description}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg shadow-slate-100 group-hover:rotate-6 transition-transform duration-300`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Quick Action Tiles ── */}
      <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center gap-2.5 text-lg font-black text-slate-800">
            <Activity className="h-5 w-5 text-amber-500" />
            Quick Store Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={action.action}
                className="group flex flex-col items-center gap-3.5 p-6 rounded-xl border border-slate-150 hover:border-amber-400 bg-slate-50/50 hover:bg-amber-50/10 shadow-sm hover:shadow-lg transition-all duration-300 text-center cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-800 group-hover:text-amber-600 transition-colors">{action.title}</div>
                  <div className="text-xs text-slate-400 mt-1 max-w-[160px]">{action.description}</div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Financial Insights & Revenue Analytics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Stats summary */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between">
          <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-700" />
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Financial Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5 flex-1 flex flex-col justify-center">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Realized Revenue (Delivered)</span>
              <p className="text-3xl font-black text-emerald-600">₹{revenueStats.totalRevenue.toLocaleString()}</p>
            </div>
            
            <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Gross Sales</span>
                <p className="font-extrabold text-slate-800 text-sm">₹{revenueStats.grossSales.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">B2B & Retail Cash</span>
                <p className="font-extrabold text-slate-800 text-sm">₹{revenueStats.cashRevenue.toLocaleString()}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Payment Method Split</span>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" /> COD (Home Delivery)
                </span>
                <span className="font-bold text-slate-800">₹{revenueStats.codRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" /> Cash Payments
                </span>
                <span className="font-bold text-slate-800">₹{revenueStats.cashRevenue.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue Bar Chart */}
        <Card className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-700" />
          <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between py-4">
            <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              Monthly Revenue Performance
            </CardTitle>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border text-[10px] font-bold">
              Delivered & Active
            </Badge>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px", fontFamily: "sans-serif" }}
                  />
                  <Bar dataKey="Revenue" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={45}>
                    {monthlyRevenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#10b981" : "#059669"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Animated Analytics Charts Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Sales & Orders Trends (Line/Area Chart) */}
        <Card className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-amber-500" />
                Weekly Sales & Orders Trend
              </CardTitle>
              <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
                Live Analytics
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px", fontFamily: "sans-serif" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  <Area type="monotone" dataKey="Sales" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" activeDot={{ r: 6 }} />
                  <Area type="monotone" dataKey="Orders" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOrders)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Category distribution (Pie Chart) */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-amber-500" />
              Category Inventory Shares
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col justify-between items-center h-[328px]">
            <div className="h-[180px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Shares</span>
                <span className="text-xl font-black text-slate-700">100%</span>
              </div>
            </div>
            
            {/* Legend indicators */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-100">
              {categoryDistribution.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="truncate">{c.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ── Recent Activity Lists Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Orders List */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2.5 text-slate-800 text-lg font-black">
              <ShoppingCart className="h-5 w-5 text-amber-500" />
              Recent Received Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {data.recentOrders.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-semibold text-sm">
                  No orders have been received yet.
                </div>
              ) : (
                data.recentOrders.slice(0, 4).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-amber-50/5 border border-slate-100 hover:border-amber-300 rounded-xl transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#1e3a5f] to-[#1a4f82] rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 shadow">
                        #{order.id.toString().slice(-4)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Order #{order.id.slice(0, 12)}...</p>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          Buyer: {order.customer?.user?.name || "GharSeKro Buyer"}
                        </p>
                        <p className="text-xs text-amber-600 font-black mt-0.5">
                          ₹{Number(order.totalPrice || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={`text-[10px] font-bold px-2.5 py-0.5 border ${
                      order.status.toLowerCase() === "pending" || order.status.toLowerCase() === "processing"
                        ? "bg-amber-55 bg-amber-50 border-amber-200 text-amber-700"
                        : order.status.toLowerCase() === "accept" || order.status.toLowerCase() === "accepted" || order.status.toLowerCase() === "delivered"
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}>
                      {order.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
            <Button
              onClick={() => navigate("/orders")}
              className="w-full mt-5 bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-xl text-sm"
            >
              Manage & View All Orders
            </Button>
          </CardContent>
        </Card>

        {/* Low Stock Items List */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2.5 text-slate-800 text-lg font-black">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Low Stock Warnings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {data.lowStockItems.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-semibold text-sm">
                  ✓ All products are fully stocked in inventory.
                </div>
              ) : (
                data.lowStockItems.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-red-50/5 border border-slate-100 hover:border-red-200 rounded-xl transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 shadow">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                        <p className="text-xs text-red-600 font-semibold mt-0.5">
                          Critical Alert: {item.currentQty} Units Left
                        </p>
                        {item.minimumQty && (
                          <p className="text-[10px] text-slate-400 mt-0.5">Alert Threshold: {item.minimumQty} units</p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 px-2.5 py-0.5 rounded-full">
                      Low Stock
                    </span>
                  </div>
                ))
              )}
            </div>
            <Button
              onClick={() => navigate("/inventory/items")}
              className="w-full mt-5 bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-xl text-sm"
            >
              Update Inventory Levels
            </Button>
          </CardContent>
        </Card>

      </div>

    </div>
  );
};

export default Dashboard;