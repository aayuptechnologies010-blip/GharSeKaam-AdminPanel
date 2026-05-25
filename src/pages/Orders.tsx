import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Search,
  Eye,
  Package2,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Check,
  X,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  ShoppingBag
} from "lucide-react";
import { orderService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Order {
  id: string;
  customerId: string;
  shopkeeperId: string;
  paymentType: string;
  totalPrice: string;
  status: "PENDING" | "PROCESSING" | "ACCEPT" | "ACCEPTED" | "REJECT" | "REJECTED" | "CANCEL" | "CANCELLED" | "DELIVERY-PICKUP" | "DELIVERED";
  deliveryAddressId: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    user?: {
      name: string;
      email: string;
    };
  };
  orderItems: {
    id: string;
    orderId: string;
    itemId: string;
    quantity: number;
    unitPrice: string;
    lineTotal: string;
    variants?: {
      size: string;
      price: number;
    } | null;
    item: {
      title: string;
      unit: string;
      variants?: Array<{
        size: string;
        price: number;
      }> | null;
    };
  }[];
  deliveryAddress: {
    city: string;
    state: string;
    pincode: string;
    flatnumber: number;
  };
}

const Orders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await orderService.getOrders();

      if (response.success && response.orders) {
        setOrders(response.orders);
        toast({
          title: "Orders loaded",
          description: `Found ${response.orders.length} store orders`,
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast({
        title: "Error loading orders",
        description: error instanceof Error ? error.message : "Failed to fetch orders",
        variant: "destructive"
      });
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setIsUpdating(orderId);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: newStatus.toUpperCase() as Order['status'] }
            : order
        )
      );
      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update order status",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    await handleStatusUpdate(orderId, "accept");
  };

  const handleRejectOrder = async (orderId: string) => {
    await handleStatusUpdate(orderId, "reject");
  };

  const getStatusDisplayText = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "processing":
        return "Pending Approval";
      case "accept":
      case "accepted":
        return "Accepted";
      case "reject":
      case "rejected":
        return "Rejected";
      case "cancel":
      case "cancelled":
        return "Cancelled";
      case "delivery-pickup":
        return "Out for Delivery";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "pending":
      case "processing":
        return <Clock className="h-3.5 w-3.5" />;
      case "accept":
      case "accepted":
        return <Check className="h-3.5 w-3.5" />;
      case "reject":
      case "rejected":
        return <X className="h-3.5 w-3.5" />;
      case "cancel":
      case "cancelled":
        return <XCircle className="h-3.5 w-3.5" />;
      case "delivery-pickup":
        return <Truck className="h-3.5 w-3.5" />;
      case "delivered":
        return <CheckCircle className="h-3.5 w-3.5" />;
      default:
        return <Clock className="h-3.5 w-3.5" />;
    }
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "pending":
      case "processing":
        return "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100/50";
      case "accept":
      case "accepted":
        return "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/50";
      case "reject":
      case "rejected":
      case "cancel":
      case "cancelled":
        return "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/50";
      case "delivery-pickup":
        return "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100/50";
      case "delivered":
        return "bg-green-50 border-green-200 text-green-700 hover:bg-green-100/50";
      default:
        return "bg-slate-50 border-slate-200 text-slate-700";
    }
  };

  const isFinalStatus = (status: string) => {
    const normalized = status.trim().toLowerCase();
    return ["reject", "rejected", "cancel", "cancelled"].includes(normalized);
  };

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, paymentFilter]);

  // Client-side filtering logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer?.user?.name && order.customer.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      order.orderItems.some(item =>
        item.item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const normalizedStatus = order.status.toLowerCase();
    const matchesStatus =
      statusFilter === "all" ||
      normalizedStatus === statusFilter ||
      normalizedStatus.startsWith(statusFilter);

    const matchesPayment =
      paymentFilter === "all" ||
      order.paymentType.toLowerCase() === paymentFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Pagination helper calculations
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "PENDING" || o.status === "PROCESSING").length,
    accepted: orders.filter(o => o.status === "ACCEPT" || o.status === "ACCEPTED").length,
    completed: orders.filter(o => o.status === "DELIVERED").length,
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-[#1e3a5f] bg-clip-text text-transparent">
            Store Orders Management
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Approve new construction material orders and update their shipping status
          </p>
        </div>
        <Button
          onClick={fetchOrders}
          className="bg-[#1e3a5f] hover:bg-slate-800 text-white font-bold gap-2 self-start py-5 px-6 rounded-xl shadow-md shrink-0 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Orders
        </Button>
      </div>

      {/* ── Stats Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Bookings", value: orderStats.total, icon: ShoppingBag, color: "border-slate-200 text-slate-700 bg-slate-50/50" },
          { title: "Awaiting Action", value: orderStats.pending, icon: Clock, color: "border-amber-200 text-amber-600 bg-amber-50/20" },
          { title: "Accepted Orders", value: orderStats.accepted, icon: Check, color: "border-emerald-200 text-emerald-600 bg-emerald-50/20" },
          { title: "Completed Orders", value: orderStats.completed, icon: CheckCircle, color: "border-green-200 text-green-600 bg-green-50/20" },
        ].map((stat, i) => (
          <Card key={i} className={`border bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
                <p className={`text-3xl font-black mt-1.5 tracking-tight ${stat.color.split(" ")[1]}`}>{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.color.split(" ")[0]} ${stat.color.split(" ")[2]}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Search & Advanced Multi-Filters ── */}
      <Card className="border border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
              <Input
                placeholder="Search orders by Order ID, customer details, or item names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11 border-slate-200 focus:border-amber-400 focus:ring-amber-400 rounded-xl"
              />
            </div>

            {/* Filter by Status */}
            <div className="flex flex-wrap sm:flex-nowrap gap-4 w-full lg:w-auto">
              <div className="w-full sm:w-44">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-11 border-slate-200 focus:border-amber-400 focus:ring-amber-400 rounded-xl">
                    <Filter className="w-4 h-4 text-slate-400 mr-2" />
                    <SelectValue placeholder="Status Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending Approval</SelectItem>
                    <SelectItem value="accept">Accepted</SelectItem>
                    <SelectItem value="reject">Rejected</SelectItem>
                    <SelectItem value="cancel">Cancelled</SelectItem>
                    <SelectItem value="delivery-pickup">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter by Payment Method */}
              <div className="w-full sm:w-48">
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="h-11 border-slate-200 focus:border-amber-400 focus:ring-amber-400 rounded-xl">
                    <CreditCard className="w-4 h-4 text-slate-400 mr-2" />
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="COD">Cash on Delivery</SelectItem>
                    <SelectItem value="ONLINE">Online Pre-paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* ── Orders Table with Pagination ── */}
      <Card className="border border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between py-5">
          <CardTitle className="text-lg font-black text-slate-800">
            Orders Catalog ({totalItems})
          </CardTitle>
          
          {/* Items Per Page Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Limit:</span>
            <Select value={String(itemsPerPage)} onValueChange={(val) => { setItemsPerPage(Number(val)); setCurrentPage(1); }}>
              <SelectTrigger className="w-20 h-8 border-slate-200 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : currentOrders.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <Package2 className="h-16 w-16 text-slate-300 mx-auto" />
              <h3 className="text-lg font-extrabold text-slate-800">No orders found</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                No orders match your search keyword or selected filters. Clear the search bar or filters to view all orders.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/75 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="font-extrabold text-slate-700 py-4 pl-6">Order ID</TableHead>
                    <TableHead className="font-extrabold text-slate-700 py-4">Buyer Details</TableHead>
                    <TableHead className="font-extrabold text-slate-700 py-4">Ordered Items</TableHead>
                    <TableHead className="font-extrabold text-slate-700 py-4">Payment & Total</TableHead>
                    <TableHead className="font-extrabold text-slate-700 py-4">Order Status</TableHead>
                    <TableHead className="font-extrabold text-slate-700 py-4">Date Placed</TableHead>
                    <TableHead className="font-extrabold text-slate-700 py-4">Approve / Ship</TableHead>
                    <TableHead className="font-extrabold text-slate-700 py-4 pr-6 text-right">Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors border-b">
                      
                      {/* ID */}
                      <TableCell className="font-extrabold text-slate-850 pl-6 text-sm py-4">
                        #{order.id.slice(0, 8)}...
                      </TableCell>
                      
                      {/* Buyer */}
                      <TableCell className="py-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800 text-sm">{order.customer?.user?.name || "GharSeKro Customer"}</p>
                          <p className="text-xs text-slate-400 font-medium">
                            {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                          </p>
                        </div>
                      </TableCell>
                      
                      {/* Items length */}
                      <TableCell className="py-4 font-semibold text-slate-600 text-sm">
                        {order.orderItems.length} Product{order.orderItems.length > 1 ? "s" : ""}
                      </TableCell>
                      
                      {/* Total */}
                      <TableCell className="py-4">
                        <div className="space-y-0.5">
                          <p className="font-black text-amber-600 text-sm">
                            ₹{Number(order.totalPrice || 0).toLocaleString()}
                          </p>
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {order.paymentType}
                          </span>
                        </div>
                      </TableCell>
                      
                      {/* Status */}
                      <TableCell className="py-4">
                        <Badge className={`${getStatusColor(order.status)} flex items-center gap-1.5 w-fit border font-bold text-xs px-2.5 py-0.5 rounded-full shadow-sm`}>
                          {getStatusIcon(order.status)}
                          {getStatusDisplayText(order.status)}
                        </Badge>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="py-4 text-xs font-semibold text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </TableCell>
                      
                      {/* Interactive Controls */}
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          {(order.status === "PENDING" || order.status === "PROCESSING") && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAcceptOrder(order.id)}
                                disabled={isUpdating === order.id}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm shadow-emerald-100 rounded-lg text-xs"
                              >
                                <Check className="h-3.5 w-3.5 mr-1" />
                                {isUpdating === order.id ? "Accepting..." : "Accept"}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleRejectOrder(order.id)}
                                disabled={isUpdating === order.id}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm shadow-rose-100 rounded-lg text-xs"
                              >
                                <X className="h-3.5 w-3.5 mr-1" />
                                {isUpdating === order.id ? "Rejecting..." : "Reject"}
                              </Button>
                            </>
                          )}

                          {!isFinalStatus(order.status) && ["ACCEPT", "ACCEPTED", "DELIVERY-PICKUP", "DELIVERED"].includes(order.status) && (
                            <Select
                              value={order.status.toLowerCase()}
                              onValueChange={(newStatus) => handleStatusUpdate(order.id, newStatus)}
                              disabled={isUpdating === order.id}
                            >
                              <SelectTrigger className="w-36 h-9 border-slate-200 rounded-xl focus:ring-amber-400 text-xs font-bold text-slate-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cancel">Cancel Order</SelectItem>
                                <SelectItem value="delivery-pickup">Set: Out for Delivery</SelectItem>
                                <SelectItem value="delivered">Set: Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          
                          {isFinalStatus(order.status) && (
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Locked</span>
                          )}
                        </div>
                      </TableCell>
                      
                      {/* Invoice Details Dialog */}
                      <TableCell className="py-4 pr-6 text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-amber-50 hover:text-amber-600 rounded-xl">
                              <Eye className="h-4.5 w-4.5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl p-0">
                            
                            {/* Indian flag strip */}
                            <div className="h-1.5 bg-gradient-to-r from-orange-500 via-white to-green-500" />
                            
                            <div className="p-6 md:p-8 space-y-6">
                              <DialogHeader>
                                <DialogTitle className="text-xl font-black text-slate-800">
                                  Order Invoice details
                                </DialogTitle>
                              </DialogHeader>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-100 p-5 rounded-2xl text-sm leading-relaxed text-slate-600">
                                <div>
                                  <h4 className="font-extrabold text-slate-800 uppercase tracking-widest text-xs mb-3">Invoice Details</h4>
                                  <p><strong>Order ID:</strong> #{order.id}</p>
                                  <p><strong>Customer ID:</strong> {order.customerId}</p>
                                  <p><strong>Payment Mode:</strong> {order.paymentType}</p>
                                  <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString("en-IN")}</p>
                                  <p className="mt-2 flex items-center">
                                    <strong>Status:</strong>
                                    <Badge className={`ml-2 text-[10px] font-bold ${getStatusColor(order.status)}`}>
                                      {getStatusDisplayText(order.status)}
                                    </Badge>
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-slate-800 uppercase tracking-widest text-xs mb-3">Delivery Address</h4>
                                  <p><strong>Flat/House:</strong> {order.deliveryAddress.flatnumber}</p>
                                  <p><strong>City:</strong> {order.deliveryAddress.city}</p>
                                  <p><strong>State:</strong> {order.deliveryAddress.state}</p>
                                  <p><strong>Pincode:</strong> {order.deliveryAddress.pincode}</p>
                                </div>
                              </div>

                              {/* Items Table */}
                              <div className="space-y-2">
                                <h4 className="font-extrabold text-slate-800 uppercase tracking-widest text-xs">Ordered Products</h4>
                                <div className="border border-slate-100 rounded-xl overflow-hidden">
                                  <Table>
                                    <TableHeader className="bg-slate-50">
                                      <TableRow>
                                        <TableHead className="font-bold text-slate-600 text-xs">Item Name</TableHead>
                                        <TableHead className="font-bold text-slate-600 text-xs">Quantity</TableHead>
                                        <TableHead className="font-bold text-slate-600 text-xs">Unit</TableHead>
                                        <TableHead className="font-bold text-slate-600 text-xs">Variant</TableHead>
                                        <TableHead className="font-bold text-slate-600 text-xs">Unit Rate</TableHead>
                                        <TableHead className="font-bold text-slate-600 text-xs text-right">Total</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {order.orderItems.map((item) => (
                                        <TableRow key={item.id}>
                                          <TableCell className="font-bold text-slate-800 text-xs">{item.item.title}</TableCell>
                                          <TableCell className="font-semibold text-slate-700 text-xs">{item.quantity}</TableCell>
                                          <TableCell className="text-slate-500 text-xs">{item.item.unit}</TableCell>
                                          <TableCell className="text-slate-500 text-xs">{item.variants?.size || "-"}</TableCell>
                                          <TableCell className="font-bold text-slate-750 text-xs">₹{parseFloat(item.unitPrice).toLocaleString()}</TableCell>
                                          <TableCell className="font-extrabold text-slate-800 text-xs text-right">₹{parseFloat(item.lineTotal).toLocaleString()}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>

                              <div className="pt-4 border-t flex justify-between items-center">
                                <span className="text-slate-500 text-xs font-bold uppercase">Estimated Bill</span>
                                <span className="text-2xl font-black text-amber-600">
                                  ₹{Number(order.totalPrice || 0).toLocaleString()}
                                </span>
                              </div>

                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* ── Premium Pagination Navigation Controls Bar ── */}
          {!isLoading && totalPages > 1 && (
            <div className="p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
              
              {/* Showing stats info */}
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Showing <span className="text-slate-700 font-bold">{indexOfFirstItem + 1}</span> to{" "}
                <span className="text-slate-700 font-bold">{Math.min(indexOfLastItem, totalItems)}</span> of{" "}
                <span className="text-slate-700 font-bold">{totalItems}</span> orders
              </div>

              {/* Navigation button arrays */}
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 border-slate-200 rounded-lg hover:border-amber-400 hover:text-amber-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const isCurrent = pageNum === currentPage;
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      variant={isCurrent ? "default" : "outline"}
                      className={`w-9 h-9 rounded-lg font-bold text-xs transition-all ${
                        isCurrent
                          ? "bg-slate-900 text-white shadow-md"
                          : "border-slate-200 text-slate-650 hover:border-amber-400 hover:text-amber-600"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 border-slate-200 rounded-lg hover:border-amber-400 hover:text-amber-600 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

            </div>
          )}

        </CardContent>
      </Card>

    </div>
  );
};

export default Orders;