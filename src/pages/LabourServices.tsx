import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  HardHat,
  Zap,
  Droplets,
  PaintBucket,
  Hammer,
  Users,
  Star,
  IndianRupee,
  Settings2,
  TrendingUp,
  Activity,
  Pencil,
  Save,
  BarChart3,
  Shield,
  Clock,
  CheckCircle2,
  Loader2,
  Calendar,
  X,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { labourService } from "@/lib/api";

/* ─── Labour Category Type ─── */
interface LabourCategory {
  id: string;
  categoryId: string;
  title: string;
  subtitle: string;
  rate: number;
  unit: string;
  badge: string | null;
  skills: string[];
  rating: number;
  reviews: number;
  icon?: React.ElementType;
  color?: string;
  bg?: string;
  border?: string;
  defaultRate?: number;
}

/* ─── Default Labour Categories (for reference & comparison) ─── */
const defaultLabourCategories = [
  { categoryId: "mason", rate: 950 },
  { categoryId: "electrician", rate: 1100 },
  { categoryId: "plumber", rate: 900 },
  { categoryId: "painter", rate: 800 },
  { categoryId: "carpenter", rate: 1000 },
  { categoryId: "helper", rate: 600 },
];

const catTemplates: Record<string, any> = {
  mason: { icon: HardHat, color: "from-amber-500 to-orange-600", bg: "bg-amber-50", border: "border-amber-200" },
  electrician: { icon: Zap, color: "from-yellow-400 to-amber-500", bg: "bg-yellow-50", border: "border-yellow-200" },
  plumber: { icon: Droplets, color: "from-blue-500 to-sky-600", bg: "bg-blue-50", border: "border-blue-200" },
  painter: { icon: PaintBucket, color: "from-purple-500 to-violet-600", bg: "bg-purple-50", border: "border-purple-200" },
  carpenter: { icon: Hammer, color: "from-rose-500 to-pink-600", bg: "bg-rose-50", border: "border-rose-200" },
  helper: { icon: Users, color: "from-green-500 to-emerald-600", bg: "bg-green-50", border: "border-green-200" },
};

/* ─── Component ─── */
const LabourServices = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<LabourCategory[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState("");
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [catRes, bookRes] = await Promise.all([
        labourService.getLabourCategories().catch(err => {
          console.error("Labour categories error:", err);
          return { success: false, categories: [] };
        }),
        labourService.getLabourBookings().catch(err => {
          console.error("Labour bookings error:", err);
          return { success: false, bookings: [] };
        })
      ]);

      if (catRes.success) {
        setCategories(catRes.categories);
      }
      if (bookRes.success) {
        setBookings(bookRes.bookings);
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load labour system logs.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRate = async (catId: string) => {
    const newRate = parseInt(editRate, 10);
    if (isNaN(newRate) || newRate < 100 || newRate > 50000) {
      toast({ title: "Invalid Rate", description: "Rate must be between ₹100 - ₹50,000", variant: "destructive" });
      return;
    }

    try {
      setIsUpdatingRate(true);
      const res = await labourService.updateLabourRate(catId, newRate);
      if (res.success) {
        setCategories(prev => prev.map(c => c.categoryId === catId ? { ...c, rate: newRate } : c));
        setEditingId(null);
        toast({ title: "Rate Updated ✓", description: `Daily rate saved in cloud database.` });
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      toast({ title: "Update Failed", description: "Failed to save rate inside database.", variant: "destructive" });
    } finally {
      setIsUpdatingRate(false);
    }
  };

  const handleResetRates = async () => {
    try {
      setIsLoading(true);
      const res = await labourService.resetLabourRates();
      if (res.success) {
        setCategories(res.categories);
        toast({ title: "Rates Restored ✓", description: "All rates restored to defaults." });
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      toast({ title: "Reset Failed", description: "Could not reset pricing indices.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const res = await labourService.updateLabourBookingStatus(id, newStatus);
      if (res.success) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
        toast({ title: "Status Updated ✓", description: `Labour booking marked as ${newStatus}` });
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      toast({ title: "Update Failed", description: "Could not update status.", variant: "destructive" });
    }
  };

  // Map templates
  const displayCategories = categories.map((cat) => {
    const template = catTemplates[cat.categoryId] || catTemplates.helper;
    const defaultRate = defaultLabourCategories.find(d => d.categoryId === cat.categoryId)?.rate || 500;
    return {
      ...cat,
      id: cat.categoryId, // Aligned with the legacy view
      icon: template.icon,
      color: template.color,
      bg: template.bg,
      border: template.border,
      defaultRate
    };
  });

  const avgRate = displayCategories.length > 0 
    ? Math.round(displayCategories.reduce((sum, c) => sum + c.rate, 0) / displayCategories.length)
    : 0;
  const totalReviews = displayCategories.reduce((sum, c) => sum + c.reviews, 0);
  const avgRating = displayCategories.length > 0
    ? (displayCategories.reduce((sum, c) => sum + c.rating, 0) / displayCategories.length).toFixed(1)
    : "0.0";

  const statCards = [
    { title: "Total Categories", value: displayCategories.length, icon: BarChart3, color: "from-blue-600 to-indigo-700" },
    { title: "Avg. Daily Rate", value: `₹${avgRate.toLocaleString()}`, icon: IndianRupee, color: "from-amber-500 to-orange-600" },
    { title: "Avg. Rating", value: `${avgRating}★`, icon: Star, color: "from-emerald-500 to-teal-600" },
    { title: "Total Reviews", value: totalReviews.toLocaleString(), icon: TrendingUp, color: "from-purple-500 to-violet-600" },
  ];

  if (isLoading && categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
        <p className="text-slate-500 font-bold">Synchronizing database rates and customer bookings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-[#1e3a5f] bg-clip-text text-transparent">
            Labour Services Management
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Manage database worker categories, live daily rates, and client booking requests
          </p>
        </div>
        <Button
          onClick={handleResetRates}
          variant="outline"
          className="border-slate-200 hover:border-amber-400 text-slate-700 font-bold gap-2 self-start py-5 px-6 rounded-xl shadow-sm"
        >
          <Settings2 className="w-4 h-4" />
          Reset All Rates
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="bg-white border border-slate-200 shadow-sm relative group overflow-hidden">
            <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
                <p className="text-2xl font-black text-slate-800 tracking-tight mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Labour Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {displayCategories.map((cat) => {
          const Icon = cat.icon || HardHat;
          const isEditing = editingId === cat.categoryId;
          const isCustomRate = cat.rate !== cat.defaultRate;

          return (
            <Card key={cat.categoryId} className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
              <div className={`h-1.5 bg-gradient-to-r ${cat.color}`} />
              <CardContent className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-[10px] font-bold px-2.5 py-0.5 ${cat.bg} ${cat.border} border text-slate-700`}>
                      {cat.badge || "Verified"}
                    </Badge>
                    {isCustomRate && (
                      <Badge className="text-[10px] font-bold bg-amber-50 border-amber-200 border text-amber-700">
                        Custom
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{cat.title}</h3>
                  <p className="text-sm text-slate-500">{cat.subtitle}</p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-slate-800 text-sm">{cat.rating}</span>
                  <span className="text-xs text-slate-400">({cat.reviews.toLocaleString()} reviews)</span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5">
                  {cat.skills.map((skill) => (
                    <span key={skill} className={`text-[11px] px-2.5 py-1 rounded-full ${cat.bg} text-slate-600 font-medium`}>
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Rate + Edit */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-slate-400 font-bold">₹</span>
                      <Input
                        type="number"
                        value={editRate}
                        onChange={(e) => setEditRate(e.target.value)}
                        className="h-9 w-28 border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                        placeholder="Rate"
                        min={100}
                        max={50000}
                        autoFocus
                      />
                      <span className="text-xs text-slate-400">/day</span>
                      <Button
                        size="sm"
                        onClick={() => handleSaveRate(cat.categoryId)}
                        disabled={isUpdatingRate}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-3 rounded-lg"
                      >
                        {isUpdatingRate ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                        className="h-9 px-3 rounded-lg text-slate-500"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <span className="text-2xl font-black text-slate-900">₹{cat.rate.toLocaleString()}</span>
                        <span className="text-xs text-slate-400 ml-1">/{cat.unit}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditingId(cat.categoryId); setEditRate(String(cat.rate)); }}
                        className="h-9 px-3 border-slate-200 hover:border-amber-400 hover:text-amber-600 rounded-lg font-bold text-xs gap-1.5"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit Rate
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bookings Tracker (Integrated Booking Requests) */}
      <Card className="border border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 py-5">
          <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            Client Booking Requests Log
          </CardTitle>
          <CardDescription className="text-xs font-semibold text-slate-400">
            View and manage real-time labour service reservations placed by clients.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {bookings.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-bold">
              No active labour booking requests received.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/75 border-b border-slate-200">
                <TableRow>
                  <TableHead className="font-extrabold text-slate-700 py-4 pl-6">Client Name</TableHead>
                  <TableHead className="font-extrabold text-slate-700 py-4">Phone Number</TableHead>
                  <TableHead className="font-extrabold text-slate-700 py-4">Address</TableHead>
                  <TableHead className="font-extrabold text-slate-700 py-4">Service Required</TableHead>
                  <TableHead className="font-extrabold text-slate-700 py-4">Duration & Qty</TableHead>
                  <TableHead className="font-extrabold text-slate-700 py-4">Total Cost</TableHead>
                  <TableHead className="font-extrabold text-slate-700 py-4">Status</TableHead>
                  <TableHead className="font-extrabold text-slate-700 py-4 pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => {
                  const dateLabel = new Date(booking.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  });

                  return (
                    <TableRow key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="py-4 pl-6 font-bold text-slate-800 text-sm">
                        {booking.name}
                      </TableCell>
                      <TableCell className="py-4 font-semibold text-slate-500 text-xs">
                        {booking.phone}
                      </TableCell>
                      <TableCell className="py-4 text-xs text-slate-500 font-medium max-w-[180px] truncate" title={booking.address}>
                        {booking.address}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-50 text-blue-700 border-blue-100 border text-[10px] font-bold">
                            {booking.labourService?.title.split(" / ")[0] || "Labour"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-xs font-semibold text-slate-600">
                        {booking.quantity} worker(s) × {booking.days} day(s)
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">Start: {dateLabel}</div>
                      </TableCell>
                      <TableCell className="py-4 font-black text-slate-800 text-sm">
                        ₹{booking.totalCost.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge className={`text-[10px] font-bold px-2 py-0.5 border ${
                          booking.status === "PENDING"
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : booking.status === "ACCEPTED"
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : booking.status === "COMPLETED"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-red-50 border-red-200 text-red-700"
                        }`}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {booking.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateBookingStatus(booking.id, "ACCEPTED")}
                                className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border-slate-200 font-bold text-xs"
                                title="Accept Request"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateBookingStatus(booking.id, "CANCELLED")}
                                className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border-slate-200 font-bold text-xs"
                                title="Cancel Request"
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                          {booking.status === "ACCEPTED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateBookingStatus(booking.id, "COMPLETED")}
                              className="h-8 px-2.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border-slate-200 font-bold text-xs gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Rate Comparison Table */}
      <Card className="border border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 py-5">
          <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-amber-500" />
            Rate Comparison Table
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/75 border-b border-slate-200">
              <TableRow>
                <TableHead className="font-extrabold text-slate-700 py-4 pl-6">Worker Type</TableHead>
                <TableHead className="font-extrabold text-slate-700 py-4">Default Rate</TableHead>
                <TableHead className="font-extrabold text-slate-700 py-4">Current Rate</TableHead>
                <TableHead className="font-extrabold text-slate-700 py-4">Status</TableHead>
                <TableHead className="font-extrabold text-slate-700 py-4">Rating</TableHead>
                <TableHead className="font-extrabold text-slate-700 py-4">Reviews</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayCategories.map((cat) => {
                const defaultRate = cat.defaultRate || 500;
                const isCustom = cat.rate !== defaultRate;
                const diff = cat.rate - defaultRate;

                return (
                  <TableRow key={cat.categoryId} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-sm`}>
                          <cat.icon className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{cat.title.split(" / ")[0]}</p>
                          <p className="text-[11px] text-slate-400 font-medium">{cat.subtitle}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 font-semibold text-slate-500">₹{defaultRate.toLocaleString()}/day</TableCell>
                    <TableCell className="py-4 font-black text-amber-600">₹{cat.rate.toLocaleString()}/day</TableCell>
                    <TableCell className="py-4">
                      {isCustom ? (
                        <Badge className={`text-[10px] font-bold border ${diff > 0 ? "bg-emerald-50 border-emerald-200 text-emerald-700" : diff < 0 ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
                          {diff > 0 ? `+₹${diff}` : diff < 0 ? `-₹${Math.abs(diff)}` : "Same"}
                        </Badge>
                      ) : (
                        <Badge className="text-[10px] font-bold bg-slate-50 border-slate-200 border text-slate-500">Default</Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-slate-700 text-sm">{cat.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 font-semibold text-slate-600 text-sm">{cat.reviews.toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Trust / Info Banner */}
      <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a4f82] border-0 overflow-hidden rounded-2xl shadow-lg">
        <CardContent className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Shield, label: "Verified Workers", value: "100%" },
              { icon: Star, label: "Avg. Rating", value: `${avgRating}★` },
              { icon: Users, label: "Workers Deployed", value: "5,000+" },
              { icon: Clock, label: "On-Time Rate", value: "97%" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="space-y-2">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Icon className="w-6 h-6 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white">{value}</div>
                <div className="text-xs text-blue-200 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabourServices;
