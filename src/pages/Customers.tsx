import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Search,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  CreditCard,
  ShoppingCart,
  FileText,
  BadgeCent,
  Eye,
  Award
} from "lucide-react";
import { customerService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface OrderLog {
  id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface Address {
  id: string;
  flatnumber: string;
  city: string;
  state: string;
  pincode: string;
}

interface CustomerUser {
  name: string;
  email: string;
  phone: string;
  profileimage: string;
}

interface Customer {
  id: string;
  type: "RETAILER" | "WHOLESALER";
  shopname: string;
  shopnumber: string;
  gstnumber: string;
  adhaarnumber: string;
  createdAt: string;
  user: CustomerUser;
  addresses: Address[];
  orders: OrderLog[];
  totalOrdersCount: number;
  totalSpent: number;
  lastOrderDate: string;
}

const Customers = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Selected customer for drill-down view
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await customerService.getCustomers();
      if (response.success && response.customers) {
        setCustomers(response.customers);
      } else {
        throw new Error(response.message || "Failed to load customers");
      }
    } catch (error) {
      console.error("Failed to load customers:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load customers.",
        variant: "destructive"
      });
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    (c.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.shopname || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.gstnumber || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics calculations
  const totalSpend = customers.reduce((sum, c) => sum + Number(c.totalSpent || 0), 0);
  const totalWholesalers = customers.filter(c => c.type === "WHOLESALER").length;
  const totalRetailers = customers.filter(c => c.type === "RETAILER").length;

  const statsCards = [
    {
      title: "Active Buyers",
      value: customers.length,
      icon: Users,
      gradient: "from-blue-600 to-indigo-700",
      description: "Unique ordering customers"
    },
    {
      title: "Wholesalers",
      value: totalWholesalers,
      icon: Building,
      gradient: "from-purple-600 to-violet-700",
      description: "Wholesale buying profiles"
    },
    {
      title: "Retailers",
      value: totalRetailers,
      icon: Award,
      gradient: "from-amber-500 to-orange-600",
      description: "Standard retail buyers"
    },
    {
      title: "Lifetime Spent (LTV)",
      value: `₹${totalSpend.toLocaleString()}`,
      icon: BadgeCent,
      gradient: "from-emerald-500 to-teal-700",
      description: "Total revenue generated"
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Drill-down Customer Details View */}
      {selectedCustomer ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-350">
          {/* Header Action */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCustomer(null)}
              className="bg-white hover:bg-slate-50 border-slate-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Customer Main Profile Card */}
            <Card className="shadow-admin-lg border-0 bg-white overflow-hidden relative">
              <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-700" />
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-md">
                    {selectedCustomer.user.profileimage ? (
                      <img
                        src={selectedCustomer.user.profileimage}
                        alt={selectedCustomer.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <Users className="w-10 h-10 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 leading-tight">
                      {selectedCustomer.user.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2 mt-1.5">
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                        {selectedCustomer.id.slice(0, 8).toUpperCase()}
                      </Badge>
                      <Badge className={cn(
                        "text-[10px] font-bold",
                        selectedCustomer.type === "WHOLESALER" 
                          ? "bg-purple-55 bg-purple-50 text-purple-700 border border-purple-200" 
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      )}>
                        {selectedCustomer.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Profile Fields */}
                <div className="space-y-4 pt-4 border-t border-slate-100 text-sm">
                  {selectedCustomer.shopname && (
                    <div className="flex items-start gap-3">
                      <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shop Name</p>
                        <p className="font-semibold text-slate-700">{selectedCustomer.shopname}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                      <p className="font-semibold text-slate-700 break-all">{selectedCustomer.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Phone</p>
                      <p className="font-semibold text-slate-700">{selectedCustomer.user.phone || selectedCustomer.shopnumber || "N/A"}</p>
                    </div>
                  </div>

                  {selectedCustomer.gstnumber && (
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GST Number</p>
                        <p className="font-semibold text-slate-700 uppercase">{selectedCustomer.gstnumber}</p>
                      </div>
                    </div>
                  )}

                  {selectedCustomer.adhaarnumber && (
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aadhar Number</p>
                        <p className="font-semibold text-slate-700">{selectedCustomer.adhaarnumber}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joined Since</p>
                      <p className="font-semibold text-slate-700">
                        {new Date(selectedCustomer.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              {/* 2. Address History */}
              <Card className="shadow-admin-md border-0 bg-white">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    Registered Shipping Addresses
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {selectedCustomer.addresses.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No registered shipping address found.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedCustomer.addresses.map((addr) => (
                        <div key={addr.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex gap-3">
                          <MapPin className="w-5 h-5 text-indigo-500 shrink-0" />
                          <div className="text-xs space-y-1">
                            <p className="font-bold text-slate-700">Flat/House No. {addr.flatnumber}</p>
                            <p className="text-slate-500">{addr.city}, {addr.state}</p>
                            <p className="font-semibold text-slate-400">Pincode: {addr.pincode}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 3. Detailed Orders History */}
              <Card className="shadow-admin-md border-0 bg-white">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-amber-500" />
                    Order Purchase logs ({selectedCustomer.orders.length} orders)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {selectedCustomer.orders.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm italic">
                      No purchase orders recorded for this customer yet.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="font-bold text-slate-700 pl-6">Order ID</TableHead>
                          <TableHead className="font-bold text-slate-700">Order Date</TableHead>
                          <TableHead className="font-bold text-slate-700">Total Price</TableHead>
                          <TableHead className="font-bold text-slate-700">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCustomer.orders.map((order) => (
                          <TableRow key={order.id} className="hover:bg-slate-50 transition-colors">
                            <TableCell className="font-semibold text-slate-900 pl-6">
                              #{order.id.length > 8 ? `${order.id.slice(0, 8).toUpperCase()}...` : order.id.toUpperCase()}
                            </TableCell>
                            <TableCell className="text-slate-500 text-sm">
                              {new Date(order.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell className="font-black text-slate-800">
                              ₹{Number(order.totalPrice || 0).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge className={cn(
                                "text-[10px] font-bold px-2 py-0.5 border",
                                order.status.toLowerCase() === "pending" || order.status.toLowerCase() === "processing"
                                  ? "bg-amber-50 border-amber-250 text-amber-700"
                                  : order.status.toLowerCase() === "accepted" || order.status.toLowerCase() === "delivered"
                                  ? "bg-green-50 border-green-200 text-green-700"
                                  : "bg-red-50 border-red-200 text-red-700"
                              )}>
                                {order.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        /* Main Customers List View */
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-slate-800">Customers</h1>
              <p className="text-muted-foreground text-sm">Monitor user profiles, billing details, and order counts</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, i) => (
              <Card key={i} className="bg-white border border-slate-200 shadow-sm relative group overflow-hidden">
                <div className={cn("h-1 bg-gradient-to-r", stat.gradient)} />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
                      <p className="text-2xl font-black text-slate-800 tracking-tight">
                        {stat.value}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">{stat.description}</p>
                    </div>
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white shadow shadow-slate-100 bg-gradient-to-br", stat.gradient)}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search Card */}
          <Card className="shadow-admin-sm border-0">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search customers by name, email, shop, or GST..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Customers Table */}
          <Card className="shadow-admin-md border-0 bg-white overflow-hidden">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
                  ))}
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">No customers found</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {searchTerm ? "No customers match your search criteria." : "No orders have been received yet to populate customer lists."}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-700 pl-6">Customer</TableHead>
                      <TableHead className="font-semibold text-slate-700">Type</TableHead>
                      <TableHead className="font-semibold text-slate-700">Shop / GST Details</TableHead>
                      <TableHead className="font-semibold text-slate-700">Orders</TableHead>
                      <TableHead className="font-semibold text-slate-700">Lifetime Spent</TableHead>
                      <TableHead className="font-semibold text-slate-700">Last Order Date</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700 pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((cust) => (
                      <TableRow key={cust.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border bg-slate-50 shadow-sm shrink-0">
                              {cust.user.profileimage ? (
                                <img
                                  src={cust.user.profileimage}
                                  alt={cust.user.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Users className="w-5 h-5 text-slate-400" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate">{cust.user.name}</p>
                              <p className="text-xs text-slate-500 truncate">{cust.user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-[10px] font-bold px-2 py-0.5",
                            cust.type === "WHOLESALER" 
                              ? "bg-purple-50 text-purple-700 border border-purple-200" 
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          )}>
                            {cust.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs space-y-0.5">
                            {cust.shopname && <p className="font-bold text-slate-700">{cust.shopname}</p>}
                            {cust.gstnumber && <p className="text-slate-400 uppercase">GST: {cust.gstnumber}</p>}
                            {!cust.shopname && !cust.gstnumber && <p className="text-slate-400 italic">No shop registered</p>}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-slate-800">
                          {cust.totalOrdersCount} orders
                        </TableCell>
                        <TableCell className="font-black text-slate-800">
                          ₹{Number(cust.totalSpent || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {cust.lastOrderDate ? (
                            new Date(cust.lastOrderDate).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 hover:bg-slate-100 text-slate-600 flex items-center gap-1.5 ml-auto"
                            onClick={() => setSelectedCustomer(cust)}
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Customers;
