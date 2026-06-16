import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Package, Plus, X, Upload } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { itemService, categoryService } from "@/lib/api";

// Variants interface matches AddItem.tsx
interface Variant {
  id: string;
  size: string;
  price: string;                 // Retail price (per piece)
  wholesaleprice: string;        // Wholesale price (per piece)
  bundleQty: string;             // How many pieces in 1 packet/bundle
  bundlePrice: string;           // Retail price for full bundle
  bundleWholesalePrice: string;  // Wholesale price for full bundle
}

const unitOptions = [
  { value: "PIECE", label: "Piece" },
  { value: "KG", label: "Kilogram (KG)" },
  { value: "LITRE", label: "Litre" },
  { value: "GRAM", label: "Gram" },
  { value: "PACK", label: "Pack" },
  { value: "BAG", label: "Bag (Bori / बैग)" },
  { value: "CFT", label: "Cubic Feet (CFT / घन फुट)" },
  { value: "TON", label: "Ton (टन)" },
  { value: "TROLLEY", label: "Trolley (ट्रॉली)" },
  { value: "BRASS", label: "Brass (ब्रास)" },
  { value: "BUNDLE", label: "Bundle (बंडल)" },
  { value: "TRUCK", label: "Truck (ट्रक)" },
  { value: "OTHER", label: "Other" }
];

const EditItem = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { itemId } = useParams();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [itemData, setItemData] = useState({
    title: "",
    description: "",
    wholesaleprice: "",
    retailprice: "",
    unit: "PIECE",
    availability: "BOTH",
    currentQty: "",
    warranty: "",
    addons: "",
    discount: "",
    categoryId: "",
    minimumPurchase: ""
  });

  // Manage variant rows separately (similar to AddItem)
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedImages(prevImages => [...prevImages, ...files]);

      // Create previews
      files.forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addImageFromUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setImagePreviews(prev => [...prev, url]);
    // Push a dummy marker so selectedImages count stays in sync
    setSelectedImages(prev => [...prev, new File([], "__url__") as File]);
    setImageUrlInput("");
  };

  useEffect(() => {
    // Load item data from location state if available
    if (location.state?.item) {
      const item = location.state.item;
      setItemData({
        title: item.title || "",
        description: item.description || "",
        wholesaleprice: item.wholesaleprice || "",
        retailprice: item.retailprice || "",
        unit: item.unit || "PIECE",
        availability: item.availability || "BOTH",
        currentQty: item.currentQty?.toString() || "",
        warranty: item.warranty || "",
        addons: Array.isArray(item.addons) ? item.addons.join(", ") : (item.addons || ""),
        discount: item.discount?.toString() || "",
        categoryId: item.categoryId || "",
        minimumPurchase: item.minimumPurchase?.toString() || ""
      });

      // initialize variants array if present
      if (item.variants) {
        try {
          const parsed = typeof item.variants === "string" ? JSON.parse(item.variants) : item.variants;
          if (Array.isArray(parsed)) {
            setVariants(parsed.map((v: any) => ({
              id: Date.now().toString() + Math.random(),
              size: v.size || "",
              price: v.price?.toString() || "",
              wholesaleprice: v.wholesaleprice?.toString() || "",
              bundleQty: v.bundleQty?.toString() || "",
              bundlePrice: v.bundlePrice?.toString() || "",
              bundleWholesalePrice: v.bundleWholesalePrice?.toString() || ""
            })));
          }
        } catch (e) {
          console.warn("Unable to parse item variants", e);
        }
      }

      // initialize images if present
      if (item.images && Array.isArray(item.images)) {
        setImagePreviews(item.images);
        setSelectedImages(item.images.map(() => new File([], "__url__") as File));
      }
    }

    // Load categories
    fetchCategories();
  }, [location.state]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      if (response.success && response.categories) {
        setCategories(response.categories);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemId) {
      toast({
        title: "Error",
        description: "Item ID is missing",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // prepare payload with variants string if present
      const realFiles = selectedImages.filter(f => f.name !== "__url__");
      const urlImages = imagePreviews.filter((_, i) => selectedImages[i]?.name === "__url__");

      const payload = {
        ...itemData,
        images: realFiles,
        imageUrls: urlImages
      } as any;
      if (variants.length > 0) {
        payload.variants = JSON.stringify(
          variants.map(v => {
            const resObj: any = { size: v.size };
            if (itemData.availability === "BOTH" || itemData.availability === "RETAILER") {
              resObj.price = parseFloat(v.price) || 0;
            }
            if (itemData.availability === "BOTH" || itemData.availability === "WHOLESALE") {
              resObj.wholesaleprice = parseFloat(v.wholesaleprice) || 0;
            }
            // Bundle / Packet fields (optional)
            if (v.bundleQty && parseFloat(v.bundleQty) > 0) {
              resObj.bundleQty = parseInt(v.bundleQty);
            }
            if (v.bundlePrice && parseFloat(v.bundlePrice) > 0) {
              resObj.bundlePrice = parseFloat(v.bundlePrice);
            }
            if (v.bundleWholesalePrice && parseFloat(v.bundleWholesalePrice) > 0) {
              resObj.bundleWholesalePrice = parseFloat(v.bundleWholesalePrice);
            }
            return resObj;
          })
        );
      }

      const response = await (itemService as any).updateItem(itemId, payload);
      console.log("Update item response:", response);

      if (response.success) {
        toast({
          title: "Item Updated!",
          description: `${itemData.title} has been updated successfully.`,
        });

        navigate("/inventory/items");
      } else {
        throw new Error(response.message || "Failed to update item");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/inventory/items")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Items
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="shadow-admin-lg border-0">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">Edit Item</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Update item details and inventory information
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label htmlFor="images">Product Images</Label>

                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to upload product images (multiple allowed)
                  </p>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('images')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Images
                  </Button>
                </div>

                {/* Online Image URL Input */}
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Ya online image URL paste karo (https://...)"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageFromUrl())}
                    className="shadow-admin-sm"
                  />
                  <Button type="button" variant="outline" onClick={addImageFromUrl}>
                    <Plus className="h-4 w-4 mr-1" /> Add URL
                  </Button>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Item Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter item title"
                    value={itemData.title}
                    onChange={(e) => setItemData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="shadow-admin-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={itemData.categoryId}
                    onValueChange={(value) => setItemData(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger className="shadow-admin-sm">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Availability *</Label>
                  <Select
                    value={itemData.availability}
                    onValueChange={(value) => setItemData(prev => ({ ...prev, availability: value }))}
                  >
                    <SelectTrigger className="shadow-admin-sm">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RETAILER">Retailer</SelectItem>
                      <SelectItem value="WHOLESALE">Wholesale</SelectItem>
                      <SelectItem value="BOTH">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retailprice">Retail Price *</Label>
                  <Input
                    id="retailprice"
                    type="number"
                    step="0.01"
                    placeholder="Enter retail price"
                    value={itemData.retailprice}
                    onChange={(e) => setItemData(prev => ({ ...prev, retailprice: e.target.value }))}
                    required
                    className="shadow-admin-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wholesaleprice">Wholesale Price *</Label>
                  <Input
                    id="wholesaleprice"
                    type="number"
                    step="0.01"
                    placeholder="Enter wholesale price"
                    value={itemData.wholesaleprice}
                    onChange={(e) => setItemData(prev => ({ ...prev, wholesaleprice: e.target.value }))}
                    required
                    className="shadow-admin-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select
                    value={itemData.unit}
                    onValueChange={(value) => setItemData(prev => ({ ...prev, unit: value }))}
                  >
                    <SelectTrigger className="shadow-admin-sm">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentQty">Current Quantity *</Label>
                  <Input
                    id="currentQty"
                    type="number"
                    placeholder="Enter current quantity"
                    value={itemData.currentQty}
                    onChange={(e) => setItemData(prev => ({ ...prev, currentQty: e.target.value }))}
                    required
                    className="shadow-admin-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warranty">Warranty</Label>
                  <Input
                    id="warranty"
                    placeholder="e.g., 6 months"
                    value={itemData.warranty}
                    onChange={(e) => setItemData(prev => ({ ...prev, warranty: e.target.value }))}
                    className="shadow-admin-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.1"
                    placeholder="Enter discount percentage"
                    value={itemData.discount}
                    onChange={(e) => setItemData(prev => ({ ...prev, discount: e.target.value }))}
                    className="shadow-admin-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimumPurchase">Minimum Purchase</Label>
                  <Input
                    id="minimumPurchase"
                    type="number"
                    placeholder="1"
                    value={itemData.minimumPurchase}
                    onChange={(e) => setItemData(prev => ({ ...prev, minimumPurchase: e.target.value }))}
                    className="shadow-admin-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addons">Add-ons</Label>
                  <Input
                    id="addons"
                    placeholder="e.g., cup, spoon (comma separated)"
                    value={itemData.addons}
                    onChange={(e) => setItemData(prev => ({ ...prev, addons: e.target.value }))}
                    className="shadow-admin-sm"
                  />
                </div>

              {/* Variants section added */}
              <div className="space-y-4 p-4 bg-muted/40 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Variants (Optional)</Label>
                    {variants.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {variants.length} variant{variants.length !== 1 ? 's' : ''} loaded
                      </p>
                    )}
                  </div>
                </div>

                {variants.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No variants added yet</p>
                ) : (
                  <div className="space-y-3">
                    {variants.map((v) => (
                      <div key={v.id} className="flex flex-col gap-3 bg-background p-3 rounded-md border">
                        {/* Row 1: Size + Piece Prices */}
                        <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                          <div className="flex-1 min-w-[120px]">
                            <Label className="text-xs text-muted-foreground">Size *</Label>
                            <Input
                              placeholder="e.g., 1/2 inch, 1 inch"
                              value={v.size}
                              onChange={(e) =>
                                setVariants(prev =>
                                  prev.map(x => x.id === v.id ? { ...x, size: e.target.value } : x)
                                )
                              }
                              className="shadow-admin-sm mt-1"
                              required
                            />
                          </div>
                          {(itemData.availability === "BOTH" || itemData.availability === "RETAILER") && (
                            <div className="flex-1 min-w-[100px]">
                              <Label className="text-xs text-muted-foreground">Retail / Piece (₹) *</Label>
                              <Input
                                placeholder="0.00"
                                type="number"
                                step="0.01"
                                value={v.price}
                                onChange={(e) =>
                                  setVariants(prev =>
                                    prev.map(x => x.id === v.id ? { ...x, price: e.target.value } : x)
                                  )
                                }
                                className="shadow-admin-sm mt-1"
                                required
                              />
                            </div>
                          )}
                          {(itemData.availability === "BOTH" || itemData.availability === "WHOLESALE") && (
                            <div className="flex-1 min-w-[100px]">
                              <Label className="text-xs text-muted-foreground">Wholesale / Piece (₹)</Label>
                              <Input
                                placeholder="0.00"
                                type="number"
                                step="0.01"
                                value={v.wholesaleprice}
                                onChange={(e) =>
                                  setVariants(prev =>
                                    prev.map(x => x.id === v.id ? { ...x, wholesaleprice: e.target.value } : x)
                                  )
                                }
                                className="shadow-admin-sm mt-1"
                              />
                            </div>
                          )}
                          <Button
                            variant="destructive"
                            className="p-2 h-10 mt-5 self-end shrink-0"
                            onClick={() => setVariants(prev => prev.filter(x => x.id !== v.id))}
                            type="button"
                            title="Remove variant"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Row 2: Bundle / Packet Options */}
                        <div className="pt-2 border-t border-dashed border-slate-200">
                          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <Package className="h-3 w-3" /> Bundle / Packet Option (Optional)
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1">
                              <Label className="text-xs text-slate-500">Pieces per Packet</Label>
                              <Input
                                type="number"
                                placeholder="e.g., 20"
                                value={v.bundleQty}
                                onChange={(e) =>
                                  setVariants(prev =>
                                    prev.map(x => x.id === v.id ? { ...x, bundleQty: e.target.value } : x)
                                  )
                                }
                                className="shadow-admin-sm mt-1"
                              />
                            </div>
                            {(itemData.availability === "BOTH" || itemData.availability === "RETAILER") && (
                              <div className="flex-1">
                                <Label className="text-xs text-slate-500">Bundle Retail Price (₹)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={v.bundlePrice}
                                  onChange={(e) =>
                                    setVariants(prev =>
                                      prev.map(x => x.id === v.id ? { ...x, bundlePrice: e.target.value } : x)
                                    )
                                  }
                                  className="shadow-admin-sm mt-1"
                                />
                              </div>
                            )}
                            {(itemData.availability === "BOTH" || itemData.availability === "WHOLESALE") && (
                              <div className="flex-1">
                                <Label className="text-xs text-slate-500">Bundle Wholesale Price (₹)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={v.bundleWholesalePrice}
                                  onChange={(e) =>
                                    setVariants(prev =>
                                      prev.map(x => x.id === v.id ? { ...x, bundleWholesalePrice: e.target.value } : x)
                                    )
                                  }
                                  className="shadow-admin-sm mt-1"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant="outline"
                  className="flex items-center gap-2 w-full"
                  onClick={() => setVariants(prev => [...prev, { id: (Date.now() + Math.random()).toString(), size: "", price: "", wholesaleprice: "", bundleQty: "", bundlePrice: "", bundleWholesalePrice: "" }])}
                  type="button"
                >
                  <Plus className="h-4 w-4" /> Add New Variant
                </Button>
              </div>

              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter item description"
                  value={itemData.description}
                  onChange={(e) => setItemData(prev => ({ ...prev, description: e.target.value }))}
                  className="shadow-admin-sm"
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="bg-gradient-primary hover:opacity-90"
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Updating..." : "Update Item"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/inventory/items")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditItem;
