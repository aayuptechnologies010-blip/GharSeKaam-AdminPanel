import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Package, AlertTriangle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { itemService } from "@/lib/api";
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
  warranty: string;
  availability: string;
  addons: string[];
  discount: number;
  categoryId: string;
  createdAt: string;
}

const Items = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category");

  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, [categoryFilter]);

  const fetchItems = async () => {
    try {
      setIsLoading(true);

      let response;
      if (categoryFilter) {
        response = await itemService.getItemsByCategory(categoryFilter);
      } else {
        response = await itemService.getItems();
      }

      if (response.success && response.items) {
        setItems(response.items);

        toast({
          title: "Items loaded",
          description: `Found ${response.items.length} items`,
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);

      toast({
        title: "Error loading items",
        description: error instanceof Error ? error.message : "Failed to fetch items",
        variant: "destructive"
      });

      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return "Out of Stock";
    if (quantity <= 10) return "Low Stock";
    return "In Stock";
  };

  const getStockBadgeVariant = (status: string) => {
    switch (status) {
      case "Out of Stock": return "destructive";
      case "Low Stock": return "secondary";
      default: return "default";
    }
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Items</h1>
          <p className="text-muted-foreground">
            {categoryFilter ? "Items in selected category" : "Manage your product inventory"}
          </p>
        </div>
        <Button onClick={() => navigate("/inventory/add-item")} className="bg-gradient-primary hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Search */}
      <Card className="shadow-admin-sm border-0">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card className="shadow-admin-md border-0">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No items match your search." : "You haven't added any items yet."}
              </p>
              <Button onClick={() => navigate("/inventory/add-item")}>
                <Plus className="h-4 w-4 mr-2" />
                Add your first item
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const stockStatus = getStockStatus(item.currentQty);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.images && item.images[0] && (
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-10 h-10 rounded-md object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">₹{parseFloat(item.retailprice).toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            W: ₹{parseFloat(item.wholesaleprice).toFixed(2)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{item.currentQty}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStockBadgeVariant(stockStatus)}>
                          {stockStatus === "Low Stock" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {stockStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.unit}</Badge>
                      </TableCell>
                      <TableCell>
                        {item.discount > 0 ? `${item.discount}%` : "-"}
                      </TableCell>
                      <TableCell>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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
    </div>
  );
};

export default Items;
