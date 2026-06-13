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
  ShoppingBag,
  MapPin
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
    flatnumber: string;
    latitude?: number | string | null;
    longitude?: number | string | null;
  };
  estimatedDelivery?: string;
  deliveryGuyId?: string | null;
  deliveryGuy?: {
    id: string;
    user?: {
      name: string;
      phone: string;
      profileimage: string;
    }
  } | null;
}

interface EstimatedDeliveryPickerProps {
  orderId: string;
  currentValue: string;
  onUpdate: (orderId: string, value: string) => Promise<void>;
}

const EstimatedDeliveryPicker = ({ orderId, currentValue, onUpdate }: EstimatedDeliveryPickerProps) => {
  const presets = [
    "Within 1 Hour",
    "Within 2 Hours",
    "Within 4 Hours",
    "Today by 6:00 PM",
    "Tomorrow by 11:00 AM",
    "Tomorrow by 4:00 PM",
    "Tomorrow by 8:00 PM",
    "Day after tomorrow",
    "Within 3 Days"
  ];

  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getDayAfterString = () => {
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    const yyyy = dayAfter.getFullYear();
    const mm = String(dayAfter.getMonth() + 1).padStart(2, '0');
    const dd = String(dayAfter.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const parseCurrentValue = (val: string) => {
    let dateStr = getTomorrowString();
    let timeStr = "11:00";

    if (!val) return { dateStr, timeStr };

    const todayObj = new Date();
    if (val.toLowerCase().includes("today")) {
      dateStr = getTodayString();
    } else if (val.toLowerCase().includes("tomorrow") && !val.toLowerCase().includes("day after")) {
      dateStr = getTomorrowString();
    } else if (val.toLowerCase().includes("day after")) {
      dateStr = getDayAfterString();
    } else {
      // Try parsing direct date if it's in a general format
      const parsedDate = Date.parse(val.split(" at ")[0]);
      if (!isNaN(parsedDate)) {
        const dObj = new Date(parsedDate);
        const yyyy = dObj.getFullYear();
        const mm = String(dObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dObj.getDate()).padStart(2, '0');
        dateStr = `${yyyy}-${mm}-${dd}`;
      }
    }

    const timeMatch = val.match(/at\s+(\d+):(\d+)\s*(AM|PM)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3].toUpperCase();
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
      timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    return { dateStr, timeStr };
  };

  const formatSelectedDelivery = (dStr: string, tStr: string): string => {
    if (!dStr) return "";
    
    const dateObj = new Date(dStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(today.getDate() + 2);

    let timeFormatted = "";
    if (tStr) {
      const [hoursStr, minutesStr] = tStr.split(":");
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesFormatted = minutes < 10 ? "0" + minutes : minutes;
      timeFormatted = `at ${hours}:${minutesFormatted} ${ampm}`;
    }

    const isSameDay = (d1: Date, d2: Date) => 
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    if (isSameDay(dateObj, today)) {
      return `Today ${timeFormatted}`.trim();
    } else if (isSameDay(dateObj, tomorrow)) {
      return `Tomorrow ${timeFormatted}`.trim();
    } else if (isSameDay(dateObj, dayAfter)) {
      return `Day after tomorrow ${timeFormatted}`.trim();
    } else {
      const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
      const dateFormatted = dateObj.toLocaleDateString('en-US', options);
      return `${dateFormatted} ${timeFormatted}`.trim();
    }
  };

  const isPreset = presets.includes(currentValue) || !currentValue;
  const initialSelect = currentValue ? (isPreset ? currentValue : "custom") : "";

  const [selectValue, setSelectValue] = useState(initialSelect);
  const parsed = parseCurrentValue(currentValue);
  const [selectedDate, setSelectedDate] = useState(parsed.dateStr);
  const [selectedTime, setSelectedTime] = useState(parsed.timeStr);

  const handleSelectChange = async (val: string) => {
    setSelectValue(val);
    if (val !== "custom") {
      await onUpdate(orderId, val);
    } else {
      // Trigger update with default custom date time format
      const formatted = formatSelectedDelivery(selectedDate, selectedTime);
      await onUpdate(orderId, formatted);
    }
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedDate(val);
    const formatted = formatSelectedDelivery(val, selectedTime);
    await onUpdate(orderId, formatted);
  };

  const handleTimeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedTime(val);
    const formatted = formatSelectedDelivery(selectedDate, val);
    await onUpdate(orderId, formatted);
  };

  const handleShortcutClick = async (type: 'today' | 'tomorrow' | 'dayAfter') => {
    let dateVal = "";
    if (type === 'today') dateVal = getTodayString();
    else if (type === 'tomorrow') dateVal = getTomorrowString();
    else dateVal = getDayAfterString();

    setSelectedDate(dateVal);
    const formatted = formatSelectedDelivery(dateVal, selectedTime);
    await onUpdate(orderId, formatted);
  };

  return (
    <div className="mt-4 pt-3 border-t border-slate-200/50 space-y-2 text-left">
      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
        Estimated Delivery Time / Day
      </label>
      <Select value={selectValue} onValueChange={handleSelectChange}>
        <SelectTrigger className="w-full h-9 border-slate-250 rounded-xl text-xs font-semibold text-slate-700 focus:ring-amber-400">
          <SelectValue placeholder="Select delivery estimate..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Within 1 Hour">Within 1 Hour</SelectItem>
          <SelectItem value="Within 2 Hours">Within 2 Hours (Standard)</SelectItem>
          <SelectItem value="Within 4 Hours">Within 4 Hours</SelectItem>
          <SelectItem value="Today by 6:00 PM">Today by 6:00 PM</SelectItem>
          <SelectItem value="Tomorrow by 11:00 AM">Tomorrow by 11:00 AM</SelectItem>
          <SelectItem value="Tomorrow by 4:00 PM">Tomorrow by 4:00 PM</SelectItem>
          <SelectItem value="Tomorrow by 8:00 PM">Tomorrow by 8:00 PM</SelectItem>
          <SelectItem value="Day after tomorrow">Day after tomorrow</SelectItem>
          <SelectItem value="Within 3 Days">Within 3 Days</SelectItem>
          <SelectItem value="custom">Custom Date & Time...</SelectItem>
        </SelectContent>
      </Select>

      {selectValue === "custom" && (
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/50 space-y-3 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Shortcuts */}
          <div className="flex gap-2">
            <button
              type="button"
              className={`text-[10px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg flex-1 border transition-all cursor-pointer ${
                selectedDate === getTodayString() 
                  ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-sm' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
              onClick={() => handleShortcutClick('today')}
            >
              Today
            </button>
            <button
              type="button"
              className={`text-[10px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg flex-1 border transition-all cursor-pointer ${
                selectedDate === getTomorrowString() 
                  ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-sm' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
              onClick={() => handleShortcutClick('tomorrow')}
            >
              Tomorrow
            </button>
            <button
              type="button"
              className={`text-[10px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg flex-1 border transition-all cursor-pointer ${
                selectedDate === getDayAfterString() 
                  ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-sm' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
              onClick={() => handleShortcutClick('dayAfter')}
            >
              Day After
            </button>
          </div>

          {/* Date & Time Selectors */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1 text-left">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                Select Date
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="h-8 text-[11px] border-slate-250 focus:border-amber-400 focus:ring-amber-400 rounded-lg bg-white text-slate-800 font-bold px-2 w-full"
              />
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                Select Time
              </label>
              <Input
                type="time"
                value={selectedTime}
                onChange={handleTimeChange}
                className="h-8 text-[11px] border-slate-250 focus:border-amber-400 focus:ring-amber-400 rounded-lg bg-white text-slate-800 font-bold px-2 w-full"
              />
            </div>
          </div>

          {/* Resulting Preview */}
          <div className="text-[10px] bg-amber-50/50 border border-amber-100/50 p-2 rounded-lg text-amber-800 font-black text-center uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm">
            <span>📅 Scheduled:</span>
            <span>{formatSelectedDelivery(selectedDate, selectedTime) || "Not Set"}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const Orders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
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
    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    try {
      const response = await orderService.getDeliveryGuys();
      if (response.success && response.riders) {
        setRiders(response.riders);
      }
    } catch (err) {
      console.error("Failed to load riders:", err);
    }
  };

  // Establish WebSocket connection for real-time shopkeeper updates
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    let shopkeeperId = '';
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadDecoded = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
      shopkeeperId = payloadDecoded.shopkeeperid || payloadDecoded.userid || '';
    } catch (e) {
      console.error("Failed to decode token for WS:", e);
    }

    if (!shopkeeperId) return;

    const wsUrl = `ws://localhost:3000/?role=owner&id=${shopkeeperId}`;
    console.log("[WS Connection] Shopkeeper connecting to:", wsUrl);

    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("[WS Client] Connected to socket as owner", shopkeeperId);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          console.log("[WS Client] Received message:", payload);
          if (payload.event === 'NEW_ORDER') {
            toast({
              title: "🚨 New Order Placed!",
              description: `A new order #${payload.data.id.slice(-8)} has been placed!`,
            });
            fetchOrders();
          } else if (payload.event === 'ORDER_STATUS_UPDATE' && payload.data) {
            const updated = payload.data;
            toast({
              title: "Order Status Changed",
              description: `Order #${updated.id.slice(-8)} status is now ${updated.status}.`,
            });
            setOrders((prev) =>
              prev.map((o) =>
                o.id === updated.id
                  ? { ...o, status: updated.status, estimatedDelivery: updated.estimatedDelivery, deliveryGuy: updated.deliveryGuy || o.deliveryGuy }
                  : o
              )
            );
          }
        } catch (err) {
          console.error("[WS Client] Error handling message:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("[WS Client] Error:", err);
      };

      ws.onclose = () => {
        console.log("[WS Client] Disconnected from server");
      };
    } catch (err) {
      console.error("[WS Client] Connection error:", err);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [toast]);

  const printInvoice = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - Order #${order.id.slice(0, 8)}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #ddd; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #d97706; }
            .invoice-title { font-size: 28px; font-weight: bold; color: #1e3a5f; }
            .details { margin: 30px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 14px; }
            .section-title { font-weight: bold; text-transform: uppercase; font-size: 12px; color: #666; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { border: 1px solid #eee; padding: 12px; text-align: left; font-size: 14px; }
            th { background-color: #f9f9f9; font-weight: bold; }
            .total-row { font-weight: bold; font-size: 16px; text-align: right; }
            .total-val { color: #d97706; font-size: 20px; }
            .footer { margin-top: 55px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">BuildMart</div>
              <div>Gorakhpur, Uttar Pradesh</div>
            </div>
            <div>
              <div class="invoice-title">INVOICE</div>
              <div>Order ID: #${order.id}</div>
              <div>Date: ${new Date(order.createdAt).toLocaleString("en-IN")}</div>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 30px;">
            <div style="width: 48%;">
              <div class="section-title">Billing/Delivery Address</div>
              <div style="font-size: 14px; line-height: 1.6;">
                <strong>Name:</strong> ${order.customer?.user?.name || "Customer"}<br/>
                <strong>Flat/House:</strong> ${order.deliveryAddress.flatnumber}<br/>
                <strong>City:</strong> ${order.deliveryAddress.city}<br/>
                <strong>State:</strong> ${order.deliveryAddress.state}<br/>
                <strong>Pincode:</strong> ${order.deliveryAddress.pincode}
              </div>
            </div>
            <div style="width: 48%; text-align: right;">
              <div class="section-title">Payment Details</div>
              <div style="font-size: 14px; line-height: 1.6;">
                <strong>Payment Type:</strong> ${order.paymentType}<br/>
                <strong>Status:</strong> ${order.status}<br/>
                <strong>Estimated Delivery:</strong> ${order.estimatedDelivery || "N/A"}
              </div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Variant</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.orderItems.map(item => `
                <tr>
                  <td>${item.item.title}</td>
                  <td>${item.variants?.size || "-"}</td>
                  <td>${item.quantity} ${item.item.unit || "pcs"}</td>
                  <td>₹${parseFloat(item.unitPrice).toLocaleString()}</td>
                  <td style="text-align: right; font-weight: bold;">₹${parseFloat(item.lineTotal).toLocaleString()}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4" style="border: none;">Total Amount:</td>
                <td class="total-val">₹${Number(order.totalPrice).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            Thank you for shopping with BuildMart! For any queries, contact support@buildmart.com
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
                          <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 flex-wrap">
                            <span>{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</span>
                            {(() => {
                              const addressQuery = order.deliveryAddress.latitude && order.deliveryAddress.longitude
                                ? `${order.deliveryAddress.latitude},${order.deliveryAddress.longitude}`
                                : `${order.deliveryAddress.flatnumber}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}`;
                              return (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressQuery)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-amber-500 hover:text-amber-600 inline-flex items-center"
                                  title="View on Google Maps"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MapPin className="h-3.5 w-3.5" />
                                </a>
                              );
                            })()}
                          </p>
                          {order.deliveryGuy && (
                            <div className="text-[10px] font-black uppercase text-amber-650 bg-amber-50/50 px-2 py-0.5 rounded mt-1 border border-amber-200/50 w-fit">
                              🏍️ Rider: {order.deliveryGuy.user?.name || "Assigned"}
                            </div>
                          )}
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
                          )}                          {!isFinalStatus(order.status) && ["ACCEPT", "ACCEPTED", "DELIVERY-PICKUP", "DELIVERED"].includes(order.status) && (
                            <div className="flex flex-col gap-1.5">
                              <Select
                                value={order.status.toLowerCase() === "accept" ? "accepted" : order.status.toLowerCase()}
                                onValueChange={(newStatus) => handleStatusUpdate(order.id, newStatus)}
                                disabled={isUpdating === order.id}
                              >
                                <SelectTrigger className="w-36 h-9 border-slate-200 rounded-xl focus:ring-amber-400 text-xs font-bold text-slate-700">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="accepted">Accepted</SelectItem>
                                  <SelectItem value="delivery-pickup">Out for Delivery</SelectItem>
                                  <SelectItem value="delivered">Completed / Delivered</SelectItem>
                                  <SelectItem value="cancel">Cancel Order</SelectItem>
                                </SelectContent>
                              </Select>

                              {/* Rider Assignment Dropdown next to Status Dropdown */}
                              {["ACCEPT", "ACCEPTED"].includes(order.status) && (
                                <Select
                                  value={order.deliveryGuyId || "unassigned"}
                                  onValueChange={async (riderId) => {
                                    if (riderId === "unassigned") return;
                                    try {
                                      setIsUpdating(order.id);
                                      await orderService.assignOrder(order.id, riderId);
                                      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, deliveryGuyId: riderId } : o));
                                      toast({
                                        title: "Rider Assigned",
                                        description: "Rider successfully assigned to order",
                                      });
                                      fetchOrders();
                                    } catch (err) {
                                      toast({
                                        title: "Assignment Failed",
                                        description: err instanceof Error ? err.message : "Failed to assign rider",
                                        variant: "destructive"
                                      });
                                    } finally {
                                      setIsUpdating(null);
                                    }
                                  }}
                                  disabled={isUpdating === order.id}
                                >
                                  <SelectTrigger className="w-36 h-9 border-slate-200 rounded-xl focus:ring-amber-400 text-xs font-bold text-slate-700 bg-amber-50/50 hover:bg-amber-50">
                                    <SelectValue placeholder="Assign Rider..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {riders.map((r) => (
                                      <SelectItem key={r.id} value={r.id}>
                                        {r.user.name} ({r.status === "AVAILABLE" ? "Idle" : r.status})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          )}
                          
                          {isFinalStatus(order.status) && (
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Locked</span>
                          )}
                        </div>
                      </TableCell>
                      
                      {/* Invoice Details Dialog */}
                      <TableCell className="py-4 pr-6 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Print Invoice"
                            onClick={() => printInvoice(order)}
                            className="hover:bg-amber-50 hover:text-amber-600 rounded-xl h-8 w-8"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-printer"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-amber-50 hover:text-amber-600 rounded-xl h-8 w-8">
                                <Eye className="h-4.5 w-4.5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-0 max-h-[90vh] overflow-y-auto">
                              
                              {/* Indian flag strip */}
                              <div className="h-1.5 bg-gradient-to-r from-orange-500 via-white to-green-500" />
                              
                              <div className="p-6 md:p-8 space-y-6">
                                <DialogHeader className="flex flex-row items-center justify-between pr-6">
                                  <DialogTitle className="text-xl font-black text-slate-800">
                                    Order Invoice details
                                  </DialogTitle>
                                  <Button
                                    onClick={() => printInvoice(order)}
                                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 h-8 px-3 rounded-lg shadow-sm"
                                  >
                                    Download Invoice
                                  </Button>
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

                                  <EstimatedDeliveryPicker
                                    orderId={order.id}
                                    currentValue={order.estimatedDelivery || ""}
                                    onUpdate={async (orderId, val) => {
                                      try {
                                        await orderService.updateDeliveryTime(orderId, val);
                                        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, estimatedDelivery: val } : o));
                                        toast({
                                          title: "Delivery Time Updated",
                                          description: `Estimation set to "${val}"`,
                                        });
                                      } catch (err) {
                                        toast({
                                          title: "Error updating",
                                          description: "Failed to update delivery time",
                                          variant: "destructive"
                                        });
                                      }
                                    }}
                                  />
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-slate-800 uppercase tracking-widest text-xs mb-3">Delivery Address</h4>
                                  <p><strong>Flat/House:</strong> {order.deliveryAddress.flatnumber}</p>
                                  <p><strong>City:</strong> {order.deliveryAddress.city}</p>
                                  <p><strong>State:</strong> {order.deliveryAddress.state}</p>
                                  <p><strong>Pincode:</strong> {order.deliveryAddress.pincode}</p>
                                  {(() => {
                                    const addressQuery = order.deliveryAddress.latitude && order.deliveryAddress.longitude
                                      ? `${order.deliveryAddress.latitude},${order.deliveryAddress.longitude}`
                                      : `${order.deliveryAddress.flatnumber}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}`;
                                    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressQuery)}`;
                                    return (
                                      <div className="mt-3 space-y-2">
                                        <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-200">
                                          <iframe
                                            title="Delivery Location Map"
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            src={`https://maps.google.com/maps?q=${encodeURIComponent(addressQuery)}&z=15&output=embed`}
                                            allowFullScreen
                                            loading="lazy"
                                          ></iframe>
                                        </div>
                                        <a
                                          href={mapsUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1.5 text-xs font-black text-amber-650 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition-all shadow-sm w-full justify-center"
                                        >
                                          <MapPin className="h-3.5 w-3.5" />
                                          Open in Google Maps
                                        </a>
                                      </div>
                                    );
                                  })()}
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
                      </div>
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