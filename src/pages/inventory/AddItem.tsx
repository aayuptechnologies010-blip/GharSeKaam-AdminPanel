import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Package, Upload, X, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { itemService, categoryService } from "@/lib/api";

// Variants: Size → Price Mapping
interface Variant {
  id: string;
  size: string;
  price: string;                 // Retail Price (per piece)
  wholesaleprice: string;        // Wholesale Price (per piece)
  bundleQty: string;             // How many pieces in 1 packet/bundle
  bundlePrice: string;           // Retail price for full bundle
  bundleWholesalePrice: string;  // Wholesale price for full bundle
}

const AddItem = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [itemData, setItemData] = useState({
    title: "",
    description: "",
    categoryId: "",
    wholesaleprice: "",
    retailprice: "",
    unit: "PIECE",
    availability: "BOTH",
    currentQty: "",
    warranty: "",
    addons: "",
    discount: "0",
    minimumPurchase: "1"
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [variants, setVariants] = useState<Variant[]>([]);

  // Unit options as per API enum
  const unitOptions = [
    { value: "PIECE", label: "Piece" },
    { value: "KG", label: "Kilogram" },
    { value: "LITRE", label: "Litre" },
    { value: "GRAM", label: "Gram" },
    { value: "PACK", label: "Pack" },
    { value: "OTHER", label: "Other" }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      if (response.success && response.categories) {
        setCategories(response.categories);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
    }
  };

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

  const addVariant = () => {
    setVariants(prev => [...prev, { id: Date.now().toString(), size: "", price: "", wholesaleprice: "", bundleQty: "", bundlePrice: "", bundleWholesalePrice: "" }]);
  };

  const removeVariant = (id: string) => {
    setVariants(prev => prev.filter(v => v.id !== id));
  };

  const updateVariant = (id: string, field: "size" | "price" | "wholesaleprice" | "bundleQty" | "bundlePrice" | "bundleWholesalePrice", value: string) => {
    setVariants(prev =>
      prev.map(v => v.id === id ? { ...v, [field]: value } : v)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedImages.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one image for the item.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Prepare item data for API
      // Filter out URL-only entries; pass real files + url strings separately
      const realFiles = selectedImages.filter(f => f.name !== "__url__");
      const urlImages = imagePreviews.filter((_, i) => selectedImages[i]?.name === "__url__");
      const apiItemData = {
        title: itemData.title,
        description: itemData.description,
        categoryId: itemData.categoryId,
        wholesaleprice: parseFloat(itemData.wholesaleprice),
        retailprice: parseFloat(itemData.retailprice),
        unit: itemData.unit,
        availability: itemData.availability,
        currentQty: parseInt(itemData.currentQty),
        warranty: itemData.warranty,
        addons: itemData.addons,
        discount: parseFloat(itemData.discount),
        minimumPurchase: parseInt(itemData.minimumPurchase),
        variants: variants.length > 0 ? JSON.stringify(variants.map(v => {
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
        })) : null,
        images: realFiles,
        imageUrls: urlImages
      };
      console.log("Submitting new item:", apiItemData);

      // Call API (TypeScript may show error but this is the correct structure for our JS API)
      const response = await (itemService as any).addItem(apiItemData);

      if (response.success) {
        toast({
          title: "Item Created!",
          description: `${itemData.title} has been added to your inventory.`,
        });

        navigate("/inventory/items");
      } else {
        throw new Error(response.message || "Failed to create item");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create item. Please try again.",
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
                <CardTitle className="text-2xl">Add New Item</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Add a new product to your inventory
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label htmlFor="images">Product Images *</Label>

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
                  <Label htmlFor="title">Product Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter product title"
                    value={itemData.title}
                    onChange={(e) => setItemData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="shadow-admin-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select
                    value={itemData.categoryId}
                    onValueChange={(value) => setItemData(prev => ({ ...prev, categoryId: value }))}
                    required
                  >
                    <SelectTrigger className="shadow-admin-sm">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
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
                    required
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
                    placeholder="0.00"
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
                    placeholder="0.00"
                    value={itemData.wholesaleprice}
                    onChange={(e) => setItemData(prev => ({ ...prev, wholesaleprice: e.target.value }))}
                    required
                    className="shadow-admin-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentQty">Current Quantity *</Label>
                  <Input
                    id="currentQty"
                    type="number"
                    placeholder="0"
                    value={itemData.currentQty}
                    onChange={(e) => setItemData(prev => ({ ...prev, currentQty: e.target.value }))}
                    required
                    className="shadow-admin-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select
                    value={itemData.unit}
                    onValueChange={(value) => setItemData(prev => ({ ...prev, unit: value }))}
                    required
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
                    placeholder="0"
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
                    placeholder="e.g., cup, spoon"
                    value={itemData.addons}
                    onChange={(e) => setItemData(prev => ({ ...prev, addons: e.target.value }))}
                    className="shadow-admin-sm"
                  />
                </div>
              </div>

              {/* Variants Section */}
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-muted">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <Label className="text-base">Product Variants (Optional)</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add size-to-price mappings for this product
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addVariant}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Variant
                  </Button>
                </div>

                 {variants.length > 0 && (
                  <div className="space-y-3">
                    {variants.map((variant) => (
                      <div key={variant.id} className="flex flex-col gap-3 bg-background p-3 rounded-lg border">
                        {/* Row 1: Size + Piece Prices */}
                        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                          <div className="flex-1">
                            <Label htmlFor={`size-${variant.id}`} className="text-xs">Size *</Label>
                            <Input
                              id={`size-${variant.id}`}
                              placeholder="e.g., 1/2 inch, 1 inch, 3 inch"
                              value={variant.size}
                              onChange={(e) => updateVariant(variant.id, "size", e.target.value)}
                              className="shadow-admin-sm mt-1"
                              required
                            />
                          </div>
                          {(itemData.availability === "BOTH" || itemData.availability === "RETAILER") && (
                            <div className="flex-1">
                              <Label htmlFor={`price-${variant.id}`} className="text-xs">Retail Price / Piece (₹) *</Label>
                              <Input
                                id={`price-${variant.id}`}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={variant.price}
                                onChange={(e) => updateVariant(variant.id, "price", e.target.value)}
                                className="shadow-admin-sm mt-1"
                                required
                              />
                            </div>
                          )}
                          {(itemData.availability === "BOTH" || itemData.availability === "WHOLESALE") && (
                            <div className="flex-1">
                              <Label htmlFor={`wholesaleprice-${variant.id}`} className="text-xs">Wholesale Price / Piece (₹)</Label>
                              <Input
                                id={`wholesaleprice-${variant.id}`}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={variant.wholesaleprice}
                                onChange={(e) => updateVariant(variant.id, "wholesaleprice", e.target.value)}
                                className="shadow-admin-sm mt-1"
                              />
                            </div>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeVariant(variant.id)}
                            className="px-2 h-10 sm:h-9 self-end mt-2 sm:mt-0 flex items-center justify-center shrink-0 border-red-200 hover:bg-red-50 hover:text-red-600"
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
                              <Label htmlFor={`bundleQty-${variant.id}`} className="text-xs text-slate-500">Pieces per Packet</Label>
                              <Input
                                id={`bundleQty-${variant.id}`}
                                type="number"
                                placeholder="e.g., 20"
                                value={variant.bundleQty}
                                onChange={(e) => updateVariant(variant.id, "bundleQty", e.target.value)}
                                className="shadow-admin-sm mt-1"
                              />
                            </div>
                            {(itemData.availability === "BOTH" || itemData.availability === "RETAILER") && (
                              <div className="flex-1">
                                <Label htmlFor={`bundlePrice-${variant.id}`} className="text-xs text-slate-500">Bundle Retail Price (₹)</Label>
                                <Input
                                  id={`bundlePrice-${variant.id}`}
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={variant.bundlePrice}
                                  onChange={(e) => updateVariant(variant.id, "bundlePrice", e.target.value)}
                                  className="shadow-admin-sm mt-1"
                                />
                              </div>
                            )}
                            {(itemData.availability === "BOTH" || itemData.availability === "WHOLESALE") && (
                              <div className="flex-1">
                                <Label htmlFor={`bundleWholesalePrice-${variant.id}`} className="text-xs text-slate-500">Bundle Wholesale Price (₹)</Label>
                                <Input
                                  id={`bundleWholesalePrice-${variant.id}`}
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={variant.bundleWholesalePrice}
                                  onChange={(e) => updateVariant(variant.id, "bundleWholesalePrice", e.target.value)}
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

                {variants.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No variants added yet. Click "Add Variant" to add size-to-price mappings.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter product description"
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
                  {isLoading ? "Creating..." : "Create Item"}
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

export default AddItem;