import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Warehouse,
  Percent,
  TrendingUp,
  Search,
  Pencil,
  Save,
  Users,
  Building,
  Check,
  ShoppingBag,
  Info,
  ChevronRight,
  TrendingDown,
  X
} from "lucide-react";
import { itemService, customerService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Item {
  id: string;
  title: string;
  images: string[];
  wholesaleprice: string;
  retailprice: string;
  unit: string;
  description: string;
  currentQty: number;
  minimumpurchase?: string | number;
  discount: number;
  categoryId: string;
  createdAt: string;
}

interface Address {
  id: string;
  flatnumber: number;
  city: string;
  state: string;
  pincode: string;
}

interface Customer {
  id: string;
  type: "RETAILER" | "WHOLESALER";
  shopname: string;
  shopnumber: string;
  gstnumber: string;
  adhaarnumber: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    phone: string;
    profileimage: string;
  };
  addresses: Address[];
  totalOrdersCount: number;
  totalSpent: number;
  lastOrderDate: string;
}

const WholesaleSettings = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [itemSearch, setItemSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [activeTab, setActiveTab] = useState("pricing");
  const [filterWholesaleOnly, setFilterWholesaleOnly] = useState(false);

  // Quick edit states
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editWholesalePrice, setEditWholesalePrice] = useState("");
  const [editMinPurchase, setEditMinPurchase] = useState("");
  const [isSavingPrice, setIsSavingPrice] = useState(false);

  // Customer detail dialog
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchItems();
    fetchCustomers();
  }, []);

  const fetchItems = async () => {
    try {
      setIsLoadingItems(true);
      const response = await itemService.getItems();
      if (response.success && response.items) {
        setItems(response.items);
      } else {
        throw new Error(response.message || "Failed to fetch items");
      }
    } catch (error) {
      console.error("Failed to load inventory items:", error);
      toast({
        title: "Error",
        description: "Failed to fetch items for wholesale management",
        variant: "destructive",
      });
    } finally {
      setIsLoadingItems(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setIsLoadingCustomers(true);
      const response = await customerService.getCustomers();
      if (response.success && response.customers) {
        // Filter to wholesalers only
        const wholesalers = response.customers.filter(
          (c: any) => c.type === "WHOLESALER"
        );
        setCustomers(wholesalers);
      } else {
        throw new Error(response.message || "Failed to fetch customers");
      }
    } catch (error) {
      console.error("Failed to load customers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch customer directory",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const handleStartEdit = (item: Item) => {
    setEditingItemId(item.id);
    setEditWholesalePrice(item.wholesaleprice || "");
    setEditMinPurchase(String(item.minimumpurchase || "1"));
  };

  const handleSavePrice = async (item: Item) => {
    const wPrice = parseFloat(editWholesalePrice);
    const rPrice = parseFloat(item.retailprice);
    const minQty = parseInt(editMinPurchase, 10);

    if (isNaN(wPrice) || wPrice <= 0) {
      toast({
        title: "Invalid Price",
        description: "Wholesale price must be a valid number greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (wPrice > rPrice) {
      toast({
        title: "Price Warning",
        description: "Wholesale price is usually lower than or equal to retail price (₹" + rPrice + ")",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(minQty) || minQty < 1) {
      toast({
        title: "Invalid Quantity",
        description: "Minimum purchase quantity must be at least 1",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSavingPrice(true);
      // We pass the full required structure to updateItem
      const response = await itemService.updateItem(item.id, {
        title: item.title,
        wholesaleprice: String(wPrice),
        retailprice: item.retailprice,
        unit: item.unit,
        description: item.description,
        currentQty: item.currentQty,
        minimumpurchase: String(minQty),
        discount: item.discount,
        categoryId: item.categoryId,
      });

      if (response.success) {
        toast({
          title: "Pricing Updated",
          description: `Wholesale price for "${item.title}" saved successfully.`,
        });
        
        // Update local items state
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, wholesaleprice: String(wPrice), minimumpurchase: minQty }
              : i
          )
        );
        setEditingItemId(null);
      } else {
        throw new Error(response.message || "Failed to update item pricing");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save wholesale pricing",
        variant: "destructive",
      });
    } finally {
      setIsSavingPrice(false);
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(itemSearch.toLowerCase());
    const isWholesale = parseFloat(item.wholesaleprice) > 0;
    
    if (filterWholesaleOnly) {
      return matchesSearch && isWholesale;
    }
    return matchesSearch;
  });

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    const term = customerSearch.toLowerCase();
    return (
      customer.user.name.toLowerCase().includes(term) ||
      customer.shopname.toLowerCase().includes(term) ||
      customer.gstnumber?.toLowerCase().includes(term) ||
      customer.user.phone.includes(term)
    );
  });

  // Analytical stats
  const wholesaleActiveCount = items.filter((item) => parseFloat(item.wholesaleprice) > 0).length;
  const avgWholesaleDiscount = Math.round(
    items
      .filter((item) => parseFloat(item.wholesaleprice) > 0 && parseFloat(item.retailprice) > 0)
      .reduce((acc, item) => {
        const r = parseFloat(item.retailprice);
        const w = parseFloat(item.wholesaleprice);
        const discount = ((r - w) / r) * 100;
        return acc + discount;
      }, 0) / (wholesaleActiveCount || 1)
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-[#1e3a5f] bg-clip-text text-transparent">
          Wholesale Business Manager
        </h1>
        <p className="text-slate-500 mt-1 font-medium">
          Manage special B2B pricing, wholesale margins, minimum order quantities, and wholesaling client list.
        </p>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-white border border-slate-200 shadow-sm relative group overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-700" />
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Wholesale Customers</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{customers.length} Verified</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-blue-600 to-indigo-700 shadow shadow-blue-300">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-sm relative group overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">B2B Priced Catalog</p>
              <p className="text-2xl font-black text-slate-800 mt-1">
                {wholesaleActiveCount} / {items.length} Products
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-amber-500 to-orange-600 shadow shadow-orange-300">
              <Warehouse className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-sm relative group overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg. Wholesale Discount</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{avgWholesaleDiscount}% Off Retail</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-emerald-500 to-teal-600 shadow shadow-emerald-300">
              <Percent className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pricing" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
          <TabsList className="bg-slate-100 p-1 rounded-xl">
            <TabsTrigger
              value="pricing"
              className="rounded-lg font-bold text-sm px-5 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-900 data-[state=active]:shadow-sm"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Wholesale Pricing
            </TabsTrigger>
            <TabsTrigger
              value="customers"
              className="rounded-lg font-bold text-sm px-5 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-900 data-[state=active]:shadow-sm"
            >
              <Users className="w-4 h-4 mr-2" />
              Wholesale Clients ({customers.length})
            </TabsTrigger>
          </TabsList>

          {activeTab === "pricing" && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant={filterWholesaleOnly ? "default" : "outline"}
                onClick={() => setFilterWholesaleOnly(!filterWholesaleOnly)}
                className="font-bold text-xs h-10 px-4 rounded-xl"
              >
                {filterWholesaleOnly ? "Showing Wholesale Only" : "Show All Products"}
              </Button>
            </div>
          )}
        </div>

        {/* Tab 1: Pricing Panel */}
        <TabsContent value="pricing" className="pt-6">
          <Card className="border border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-slate-800">Wholesale Pricelist Editor</CardTitle>
                <CardDescription className="text-xs font-semibold text-slate-400">
                  Update wholesale prices and minimum order quantities directly. Wholesale prices display automatically to wholesalers.
                </CardDescription>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search products by title..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  className="pl-10 h-10 border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <CardContent className="p-0">
              {isLoadingItems ? (
                <div className="p-12 text-center text-slate-400 font-bold animate-pulse">
                  Loading catalog and prices...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="p-16 text-center">
                  <Warehouse className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-bold text-lg">No matching products found</p>
                  <p className="text-xs text-slate-400 mt-1">Try clearing your filters or search criteria.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/75">
                    <TableRow>
                      <TableHead className="font-extrabold text-slate-700 pl-6 py-4">Item Details</TableHead>
                      <TableHead className="font-extrabold text-slate-700 py-4">Retail Price</TableHead>
                      <TableHead className="font-extrabold text-slate-700 py-4">Wholesale Price</TableHead>
                      <TableHead className="font-extrabold text-slate-700 py-4">Min. Purchase</TableHead>
                      <TableHead className="font-extrabold text-slate-700 py-4">Est. Margin</TableHead>
                      <TableHead className="font-extrabold text-slate-700 py-4">Stock Status</TableHead>
                      <TableHead className="font-extrabold text-slate-700 pr-6 py-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => {
                      const rPrice = parseFloat(item.retailprice) || 0;
                      const wPrice = parseFloat(item.wholesaleprice) || 0;
                      const isEditing = editingItemId === item.id;
                      
                      // Margin calculation
                      const marginPercent = rPrice > 0 && wPrice > 0
                        ? Math.round(((rPrice - wPrice) / rPrice) * 100)
                        : 0;

                      return (
                        <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* Item Details */}
                          <TableCell className="pl-6 py-4">
                            <div className="flex items-center gap-3">
                              {item.images && item.images[0] ? (
                                <img
                                  src={item.images[0]}
                                  alt={item.title}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-400">
                                  <ShoppingBag className="w-5 h-5" />
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-800 text-sm max-w-[240px] truncate">{item.title}</p>
                                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{item.unit}</p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Retail Price */}
                          <TableCell className="py-4 font-bold text-slate-500">
                            ₹{rPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </TableCell>

                          {/* Wholesale Price */}
                          <TableCell className="py-4">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400 font-bold text-sm">₹</span>
                                <Input
                                  type="number"
                                  value={editWholesalePrice}
                                  onChange={(e) => setEditWholesalePrice(e.target.value)}
                                  className="h-9 w-24 border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                                  placeholder="W-Price"
                                />
                              </div>
                            ) : wPrice > 0 ? (
                              <span className="font-black text-blue-900 text-sm">
                                ₹{wPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            ) : (
                              <Badge className="bg-slate-50 text-slate-400 border border-slate-200 text-[10px] font-bold">
                                Not Configured
                              </Badge>
                            )}
                          </TableCell>

                          {/* Min Purchase Qty */}
                          <TableCell className="py-4">
                            {isEditing ? (
                              <Input
                                type="number"
                                value={editMinPurchase}
                                onChange={(e) => setEditMinPurchase(e.target.value)}
                                className="h-9 w-20 border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                                min={1}
                              />
                            ) : (
                              <span className="font-semibold text-slate-700 text-sm">
                                {item.minimumpurchase || 1} units
                              </span>
                            )}
                          </TableCell>

                          {/* Est. Margin */}
                          <TableCell className="py-4">
                            {wPrice > 0 ? (
                              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1 w-fit">
                                <TrendingDown className="w-3 h-3" />
                                {marginPercent}% B2B Discount
                              </Badge>
                            ) : (
                              <span className="text-xs text-slate-400 font-semibold">-</span>
                            )}
                          </TableCell>

                          {/* Stock Status */}
                          <TableCell className="py-4">
                            {item.currentQty <= 0 ? (
                              <Badge variant="destructive" className="text-[10px] font-bold">Out of stock</Badge>
                            ) : item.currentQty <= 15 ? (
                              <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                                Low Stock ({item.currentQty})
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold">
                                In Stock ({item.currentQty})
                              </Badge>
                            )}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="pr-6 py-4 text-right">
                            {isEditing ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSavePrice(item)}
                                  disabled={isSavingPrice}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-3 rounded-lg"
                                >
                                  <Save className="w-4.5 h-4.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingItemId(null)}
                                  className="h-9 px-3 rounded-lg text-slate-500"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStartEdit(item)}
                                className="h-9 px-3 border-slate-200 hover:border-blue-400 hover:text-blue-600 rounded-lg font-bold text-xs gap-1.5"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                Configure
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Wholesalers Panel */}
        <TabsContent value="customers" className="pt-6">
          <Card className="border border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-slate-800">Wholesale Client Directory</CardTitle>
                <CardDescription className="text-xs font-semibold text-slate-400">
                  Manage registered B2B clients, shops, GST credentials and trading activity.
                </CardDescription>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search shop, name, phone, GST..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-10 h-10 border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <CardContent className="p-0">
              {isLoadingCustomers ? (
                <div className="p-12 text-center text-slate-400 font-bold animate-pulse">
                  Loading verified B2B customer records...
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="p-16 text-center">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-bold text-lg">No wholesale clients found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Clients automatically show up here when they register with a wholesale account.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/75">
                    <TableRow>
                      <TableHead className="font-extrabold text-slate-700 pl-6 py-4">Shop & Contact Details</TableHead>
                      <TableHead className="font-extrabold text-slate-700 py-4">B2B Owner</TableHead>
                      <TableHead className="font-extrabold text-slate-700 py-4">GST Number</TableHead>
                      <TableHead className="font-extrabold text-slate-700 py-4">Total Spent</TableHead>
                      <TableHead className="font-extrabold text-slate-700 py-4">Joined Date</TableHead>
                      <TableHead className="font-extrabold text-slate-700 pr-6 py-4 text-right">View</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Shop details */}
                        <TableCell className="pl-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm font-bold">
                              <Building className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-800 text-sm">{customer.shopname || "N/A"}</p>
                              <p className="text-xs text-slate-500 font-medium">Shop #{customer.shopnumber || "N/A"}</p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Owner details */}
                        <TableCell className="py-4">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{customer.user.name}</p>
                            <p className="text-xs text-slate-400 font-medium">{customer.user.phone}</p>
                          </div>
                        </TableCell>

                        {/* GST */}
                        <TableCell className="py-4">
                          <code className="text-xs bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded font-mono font-semibold">
                            {customer.gstnumber || "Not Provided"}
                          </code>
                        </TableCell>

                        {/* Total spent */}
                        <TableCell className="py-4">
                          <div className="font-bold text-slate-800 text-sm">
                            ₹{(customer.totalSpent || 0).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {customer.totalOrdersCount || 0} orders
                          </div>
                        </TableCell>

                        {/* Joined Date */}
                        <TableCell className="py-4 font-semibold text-slate-500 text-xs">
                          {new Date(customer.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>

                        {/* View action */}
                        <TableCell className="pr-6 py-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedCustomer(customer)}
                            className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-blue-600"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Customer Detail Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        {selectedCustomer && (
          <DialogContent className="sm:max-w-[480px] rounded-2xl">
            <DialogHeader className="pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-black text-slate-800">
                    {selectedCustomer.shopname}
                  </DialogTitle>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    Verified Wholesale Partner
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="py-5 space-y-4 font-sans">
              {/* Contact Info */}
              <div className="bg-slate-50/75 border border-slate-100 rounded-xl p-4 space-y-3">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Client Information
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Name</label>
                    <p className="text-sm font-extrabold text-slate-700 mt-0.5">{selectedCustomer.user.name}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                    <p className="text-sm font-extrabold text-slate-700 mt-0.5">{selectedCustomer.user.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                    <p className="text-sm font-extrabold text-slate-700 mt-0.5">{selectedCustomer.user.email}</p>
                  </div>
                </div>
              </div>

              {/* B2B Verification Credentials */}
              <div className="bg-slate-50/75 border border-slate-100 rounded-xl p-4 space-y-3">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Verification Credentials
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">GSTIN / Tax ID</label>
                    <p className="text-xs font-mono font-black text-blue-900 mt-0.5 bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100/50 w-fit">
                      {selectedCustomer.gstnumber || "Not Provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Aadhaar Card No.</label>
                    <p className="text-xs font-mono font-black text-slate-700 mt-0.5 bg-slate-100/50 px-2 py-0.5 rounded border border-slate-200/50 w-fit">
                      {selectedCustomer.adhaarnumber || "Not Provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trading & Addresses */}
              <div className="space-y-2">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  Registered B2B Address
                </p>
                {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                  selectedCustomer.addresses.map((addr) => (
                    <div key={addr.id} className="border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 leading-relaxed font-semibold">
                      Shop #{selectedCustomer.shopnumber}, Flat {addr.flatnumber}, {addr.city}, {addr.state} - {addr.pincode}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic pl-1">No address registered</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setSelectedCustomer(null)}
                className="bg-gradient-primary font-bold text-sm px-6 h-10 rounded-xl"
              >
                Close Profile
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default WholesaleSettings;
