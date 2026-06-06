import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Bell, Search, ShoppingCart, Layers, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardService } from "@/lib/api";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    profile?: string;
  } | null>(null);

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Fetch dynamic database notification updates (orders, low stock items)
    const fetchRealNotifications = async () => {
      try {
        const response = await dashboardService.getDashboard();
        if (response.success && response.data) {
          const { recentOrders, lowStockItems } = response.data;
          const generatedNotifs: any[] = [];

          // 1. Process real orders from database
          (recentOrders || []).forEach((order: any) => {
            const notifId = `order_${order.id}`;
            const isSeen = localStorage.getItem(`notif_seen_${notifId}`) === "true";

            generatedNotifs.push({
              id: notifId,
              title: "New Order Received",
              description: `Order #${order.id.slice(0, 8).toUpperCase()} has been placed by ${order.customer?.user?.name || "Customer"} (₹${Number(order.totalPrice).toLocaleString()})`,
              time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: "order",
              link: "/orders",
              seen: isSeen
            });
          });

          // 2. Process real low stock/out of stock items from database
          (lowStockItems || []).forEach((item: any) => {
            const notifId = `stock_${item.id}_${item.currentQty}`;
            const isSeen = localStorage.getItem(`notif_seen_${notifId}`) === "true";
            const isOutOfStock = item.currentQty === 0;

            generatedNotifs.push({
              id: notifId,
              title: isOutOfStock ? "Out of Stock Alert" : "Low Stock Alert",
              description: isOutOfStock
                ? `${item.title} is completely out of stock! Please restock immediately.`
                : `${item.title} is running low on stock (${item.currentQty} items left)`,
              time: "Alert",
              type: "stock",
              link: "/inventory/items",
              seen: isSeen
            });
          });

          // Sort notifications so that unseen items appear first
          const sorted = generatedNotifs.sort((a, b) => {
            if (a.seen === b.seen) return 0;
            return a.seen ? 1 : -1;
          });

          setNotifications(sorted);
        }
      } catch (error) {
        console.warn("Failed to fetch real-time notifications:", error);
      }
    };

    fetchRealNotifications();
  }, [location.pathname]); // Fetch on mount and on route changes!

  useEffect(() => {
    // Load user data (authentication is already checked by ProtectedRoute)
    const syncUserFromStorage = () => {
      const name = localStorage.getItem('userName') || '';
      const email = localStorage.getItem('userEmail') || '';
      const profile = localStorage.getItem('userProfile') || '';
      setUser({ name, email, profile });
    };

    syncUserFromStorage();

    // Re-sync when Profile page fires a profile-updated event
    window.addEventListener('userProfileUpdated', syncUserFromStorage);
    return () => window.removeEventListener('userProfileUpdated', syncUserFromStorage);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth');
  };

  const handleNotificationClick = (notif: any) => {
    // Mark as seen in localStorage
    localStorage.setItem(`notif_seen_${notif.id}`, "true");
    setNotifications(prev =>
      prev.map(n => n.id === notif.id ? { ...n, seen: true } : n)
    );
    // Navigate to link
    navigate(notif.link);
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach(n => {
      localStorage.setItem(`notif_seen_${n.id}`, "true");
    });
    setNotifications(prev =>
      prev.map(n => ({ ...n, seen: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order": return ShoppingCart;
      case "stock": return Package;
      case "category": return Layers;
      default: return Bell;
    }
  };

  const getNotificationIconBg = (type: string) => {
    switch (type) {
      case "order": return "bg-gradient-to-br from-blue-500 to-blue-600";
      case "stock": return "bg-gradient-to-br from-amber-500 to-orange-600";
      case "category": return "bg-gradient-to-br from-purple-500 to-indigo-600";
      default: return "bg-gradient-to-br from-slate-500 to-slate-600";
    }
  };

  const unreadCount = notifications.filter(n => !n.seen).length;

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard':
        return 'Dashboard';
      case '/inventory/categories':
        return 'Categories';
      case '/inventory/items':
        return 'Items';
      case '/inventory/add-category':
        return 'Add Category';
      case '/inventory/add-item':
        return 'Add Item';
      case '/orders':
        return 'Orders';
      case '/customers':
        return 'Customers';
      case '/profile':
        return 'Profile Settings';
      default:
        return 'GharSeKro.com Admin';
    }
  };

  const getPageDescription = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard':
        return 'Overview of your store performance and metrics';
      case '/inventory/categories':
        return 'Manage your product categories';
      case '/inventory/items':
        return 'View and manage your inventory items';
      case '/inventory/add-category':
        return 'Create a new product category';
      case '/inventory/add-item':
        return 'Add a new item to your inventory';
      case '/orders':
        return 'Manage customer orders and transactions';
      case '/customers':
        return 'Monitor and manage customer profiles, addresses, and order purchase history';
      case '/profile':
        return 'View and edit your personal information and shop details';
      default:
        return 'Welcome to GharSeKro.com Admin Panel';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-slate-400 mt-2">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-8 flex-shrink-0 z-40">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-slate-900">
              {getPageTitle()}
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              {getPageDescription()}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Button */}
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-slate-100">
              <Search className="h-4 w-4 text-slate-600" />
            </Button>

            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-slate-100 relative rounded-xl transition-all duration-200">
                  <Bell className="h-4 w-4 text-slate-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 sm:w-96 bg-white border border-slate-200 shadow-xl rounded-xl p-0 overflow-hidden z-50">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <span className="font-semibold text-slate-900 text-sm">Notifications ({unreadCount} unread)</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead} 
                      className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1 hover:text-blue-700"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                
                {/* Notification List */}
                <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const Icon = getNotificationIcon(notif.type);
                      const iconBg = getNotificationIconBg(notif.type);
                      return (
                        <div 
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={cn(
                            "flex gap-3 p-4 hover:bg-slate-50 transition-colors cursor-pointer text-left relative",
                            !notif.seen && "bg-blue-50/20 font-medium"
                          )}
                        >
                          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm", iconBg)}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-bold text-slate-800 truncate">{notif.title}</p>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">{notif.time}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 leading-normal break-words line-clamp-2">
                              {notif.description}
                            </p>
                          </div>
                          {!notif.seen && (
                            <div className="absolute top-1/2 right-2 transform -translate-y-1/2 w-2 h-2 bg-amber-500 rounded-full shrink-0 animate-pulse" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 p-2 h-auto hover:bg-slate-100 rounded-xl">
                  <Avatar className="h-10 w-10 ring-2 ring-slate-200">
                    <AvatarImage src={user.profile} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 shadow-xl rounded-xl">
                <DropdownMenuItem onClick={() => navigate('/profile')} className="hover:bg-slate-50">
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="hover:bg-red-50 text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto min-h-0 p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;