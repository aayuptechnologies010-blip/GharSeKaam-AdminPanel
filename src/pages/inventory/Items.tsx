import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, PlusCircle } from "lucide-react";
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
  availability: string;
  warranty: string;
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

  // Dialog states
  const [addQuantityDialog, setAddQuantityDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [quantityToAdd, setQuantityToAdd] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [categoryFilter]);

  const fetchItems = async () => {
    try {
      setIsLoading(true);

      let response;
      if (categoryFilter) {
        response = await itemService.getItems(categoryFilter);
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

  const handleAddQuantity = async () => {
    if (!selectedItem || !quantityToAdd) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      const response = await itemService.addQuantity(selectedItem.id, quantityToAdd);

      if (response.success) {
        toast({
          title: "Quantity Added!",
          description: `Added ${quantityToAdd} units to ${selectedItem.title}`,
        });

        // Update the item in the local state
        setItems(prev => prev.map(item =>
          item.id === selectedItem.id
            ? { ...item, currentQty: item.currentQty + parseInt(quantityToAdd) }
            : item
        ));

        // Close dialog and reset
        setAddQuantityDialog(false);
        setSelectedItem(null);
        setQuantityToAdd("");
      } else {
        throw new Error(response.message || "Failed to add quantity");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add quantity",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const openAddQuantityDialog = (item: Item) => {
    setSelectedItem(item);
    setAddQuantityDialog(true);
  };

  const handleEditItem = (item: Item) => {
    // Navigate to edit page or open edit dialog
    navigate(`/inventory/edit-item/${item.id}`, { state: { item } });
  };

  const handleDeleteItem = async (item: Item) => {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      try {
        const response = await itemService.deleteItem(item.id);

        if (response.success) {
          toast({
            title: "Item Deleted",
            description: `${item.title} has been removed from inventory`,
          });

          // Remove item from local state
          setItems(prev => prev.filter(i => i.id !== item.id));
        } else {
          throw new Error(response.message || "Failed to delete item");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete item",
          variant: "destructive"
        });
      }
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openAddQuantityDialog(item)}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item)}
                          >
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

      {/* Add Quantity Dialog */}
      <Dialog open={addQuantityDialog} onOpenChange={setAddQuantityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Quantity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Item</Label>
              <p className="text-sm text-muted-foreground">{selectedItem?.title}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Current Quantity</Label>
              <p className="text-sm text-muted-foreground">{selectedItem?.currentQty} {selectedItem?.unit}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity to Add</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity to add"
                value={quantityToAdd}
                onChange={(e) => setQuantityToAdd(e.target.value)}
                min="1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddQuantity}
                disabled={isUpdating || !quantityToAdd}
                className="bg-gradient-primary hover:opacity-90"
              >
                {isUpdating ? "Adding..." : "Add Quantity"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setAddQuantityDialog(false);
                  setSelectedItem(null);
                  setQuantityToAdd("");
                }}
                disabled={isUpdating}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Items;
