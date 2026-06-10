import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Plus,
  FolderOpen,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Home,
  Layers,
  Settings,
  GalleryHorizontal,
  Users,
  HardHat,
  Warehouse
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    color: "from-blue-500 to-blue-600"
  },
  {
    title: "Inventory",
    icon: Layers,
    color: "from-purple-500 to-purple-600",
    items: [
      {
        title: "Categories",
        url: "/inventory/categories",
        icon: FolderOpen,
        color: "from-green-500 to-green-600"
      },
      {
        title: "Items",
        url: "/inventory/items",
        icon: Package,
        color: "from-orange-500 to-orange-600"
      },
      {
        title: "Add Category",
        url: "/inventory/add-category",
        icon: Plus,
        color: "from-teal-500 to-teal-600"
      },
      {
        title: "Add Item",
        url: "/inventory/add-item",
        icon: Plus,
        color: "from-pink-500 to-pink-600"
      },
    ],
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ShoppingCart,
    color: "from-red-500 to-red-600"
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
    color: "from-blue-500 to-indigo-600"
  },
  {
    title: "Shop Images",
    url: "/inventory/upload-shop-image",
    icon: GalleryHorizontal,
    color: "from-yellow-500 to-yellow-600"
  },
  {
    title: "Wholesale Settings",
    url: "/wholesale-settings",
    icon: Warehouse,
    color: "from-emerald-500 to-teal-600"
  },
  {
    title: "Labour Services",
    url: "/labour-services",
    icon: HardHat,
    color: "from-amber-500 to-orange-600"
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Inventory"]);

  const isActive = (path: string) => location.pathname === path;

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isGroupExpanded = (title: string) => expandedGroups.includes(title);

  return (
    <div className={cn(
      "relative flex-shrink-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out shadow-lg text-sidebar-foreground flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(100,116,139,0.05)_1px,transparent_0)] bg-[length:20px_20px]" />

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full bg-sidebar-accent border border-sidebar-border hover:bg-sidebar-accent/80 text-sidebar-foreground shadow-lg"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <div className="relative z-10 flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-sm border bg-white p-1">
              <img src="/logo.png" alt="GharSeKro logo" className="w-full h-full object-contain" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <h2 className="font-extrabold text-white text-base leading-tight tracking-tight">GharSeKro</h2>
                <span className="text-[10px] text-[#febd69] font-black uppercase tracking-wider">Admin Portal</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            if (item.items) {
              // Group with sub-items
              return (
                <div key={item.title} className="space-y-1">
                  <button
                    onClick={() => !collapsed && toggleGroup(item.title)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group border border-transparent",
                      "hover:bg-sidebar-accent/60 text-sidebar-foreground hover:text-[#febd69]"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-sm",
                      item.color
                    )}>
                      <item.icon className="h-4 w-4 text-white" />
                    </div>
                    {!collapsed && (
                      <>
                        <span className="font-medium flex-1 text-left">{item.title}</span>
                        <ChevronRight className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isGroupExpanded(item.title) && "rotate-90"
                        )} />
                      </>
                    )}
                  </button>

                  {!collapsed && isGroupExpanded(item.title) && (
                    <div className="ml-4 space-y-1 border-l border-sidebar-border pl-4">
                      {item.items.map((subItem) => (
                        <NavLink
                          key={subItem.title}
                          to={subItem.url}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group border border-transparent",
                            isActive(subItem.url)
                              ? "bg-sidebar-accent text-[#febd69] border-sidebar-border shadow-md"
                              : "text-sidebar-foreground hover:text-[#febd69] hover:bg-sidebar-accent/40"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-md flex items-center justify-center bg-gradient-to-br shadow-sm",
                            subItem.color,
                            isActive(subItem.url) ? "shadow-lg scale-105" : "opacity-80"
                          )}>
                            <subItem.icon className="h-3 w-3 text-white" />
                          </div>
                          <span className="font-medium text-sm">{subItem.title}</span>
                          {isActive(subItem.url) && (
                            <div className="ml-auto w-2 h-2 bg-primary rounded-full shadow shadow-primary animate-pulse" />
                          )}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            } else {
              // Single menu item
              return (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group border border-transparent",
                    isActive(item.url)
                      ? "bg-sidebar-accent text-[#febd69] border-sidebar-border shadow-md"
                      : "text-sidebar-foreground hover:text-[#febd69] hover:bg-sidebar-accent/40"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-sm",
                    item.color,
                    isActive(item.url) ? "shadow-lg scale-105" : ""
                  )}>
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                  {!collapsed && (
                    <>
                      <span className="font-medium">{item.title}</span>
                      {isActive(item.url) && (
                        <div className="ml-auto w-2 h-2 bg-primary rounded-full shadow shadow-primary animate-pulse" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            }
          })}
        </div>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="bg-sidebar-accent/60 border border-sidebar-border rounded-xl p-3">
              <div className="flex items-center gap-2 text-[#febd69] mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-black">Store Active</span>
              </div>
              <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                Your store is live and ready for customers
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}