import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, FolderPlus, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { categoryService } from "@/lib/api";

const PREDEFINED_CATEGORIES = [
  { title: "Hardware & Locks", desc: "Premium architectural locks, brass padlocks, door handles, and safety cabinet hardware fittings." },
  { title: "Electrical", desc: "Industrial and residential wiring, modular switches, copper conductors, LED panels, and distribution boards." },
  { title: "Paint", desc: "Exterior emulsions, primers, surface coatings, interior paints, wall distempers, and brush accessories." },
  { title: "Plumbing Fitting", desc: "Leak-proof PVC joint fittings, designer taps, high-pressure uPVC pipes, column pipes, and bath mixers." },
  { title: "Service", desc: "Background verified professional contractor manpower, Rajmistries, plumbers, and safety supervisors." },
  { title: "Tools & Safety Equipments", desc: "High-torque power drills, professional grinders, safety helmets, caution tape, gloves, and site protective gear." },
  { title: "Building Material (Cement, Sand, Iron)", desc: "Premium grade portland Pozzolana cement bags, river aggregate sand, high-tensile TMT steel rebars, and site construction aggregates." }
];

const AddCategory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [categoryData, setCategoryData] = useState({
    title: "",
    description: ""
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const addImageFromUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setImagePreview(url);
    setSelectedImage(new File([], "__url__"));
    setImageUrlInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Please select an image for the category.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call the API using the service
      // If image is a URL-only marker, pass the URL string directly
      const isUrlImage = selectedImage?.name === "__url__";
      const response = isUrlImage
        ? await (categoryService as any).addCategory(categoryData.title, null, imagePreview)
        : await categoryService.addCategory(categoryData.title, selectedImage, null);

      if (response.success) {
        toast({
          title: "Category Created!",
          description: `${categoryData.title} has been added to your categories.`,
        });

        navigate("/inventory/categories");
      } else {
        throw new Error(response.message || "Failed to create category");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create category. Please try again.",
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
          onClick={() => navigate("/inventory/categories")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="shadow-admin-lg border-0">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <FolderPlus className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">Add New Category</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Create a new product category for your inventory
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Prefill Section */}
              <div className="space-y-2 text-left">
                <Label className="text-slate-500 font-bold">Quick Prefill Predefined Categories</Label>
                <div className="flex flex-wrap gap-2 pt-1 pb-3">
                  {PREDEFINED_CATEGORIES.map((cat) => (
                    <button
                      key={cat.title}
                      type="button"
                      onClick={() => setCategoryData({ title: cat.title, description: cat.desc })}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-400 hover:text-amber-700 transition-all text-slate-650"
                    >
                      {cat.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="title">Category Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter category title"
                  value={categoryData.title}
                  onChange={(e) => setCategoryData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="shadow-admin-sm text-left"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter category description (optional)"
                  value={categoryData.description}
                  onChange={(e) => setCategoryData(prev => ({ ...prev, description: e.target.value }))}
                  className="shadow-admin-sm"
                  rows={4}
                />
              </div>

              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label htmlFor="image">Category Image *</Label>

                {!selectedImage ? (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Click to upload category image
                    </p>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Image
                    </Button>

                    {/* Online Image URL Input */}
                    <div className="flex gap-2 mt-4">
                      <Input
                        placeholder="Ya online image URL paste karo (https://...)"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageFromUrl())}
                        className="shadow-admin-sm text-left"
                      />
                      <Button type="button" variant="outline" onClick={addImageFromUrl}>
                        Add URL
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <img
                        src={imagePreview!}
                        alt="Category preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="bg-gradient-primary hover:opacity-90"
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Creating..." : "Create Category"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/inventory/categories")}
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

export default AddCategory;