import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { categoryService } from "@/lib/api";

const EditCategory = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [categoryData, setCategoryData] = useState({
    title: "",
    description: "",
    image: "",
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) return;
    fetchCategory();
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      setIsFetching(true);
      const res = await categoryService.getCategories();
      if (res && res.categories) {
        const cat = res.categories.find((c: any) => c.id === categoryId || c._id === categoryId);
        if (cat) {
          setCategoryData({
            title: cat.title || cat.name || "",
            description: cat.description || "",
            image: cat.image || "",
          });
          setImagePreview(cat.image || null);
        } else {
          toast({ title: "Not found", description: "Category not found.", variant: "destructive" });
          navigate("/inventory/categories");
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load category.", variant: "destructive" });
    } finally {
      setIsFetching(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setCategoryData(prev => ({ ...prev, image: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return;

    setIsLoading(true);
    try {
      const response = await categoryService.updateCategory(categoryId, categoryData.title, selectedImage || undefined, categoryData.description);
      if (response && response.success) {
        toast({ title: "Updated", description: "Category updated successfully." });
        navigate("/inventory/categories");
      } else {
        throw new Error(response.message || "Failed to update category");
      }
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Update failed.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/inventory/categories")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        </div>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/inventory/categories")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="shadow-admin-lg border-0">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div>
                <CardTitle className="text-2xl">Edit Category</CardTitle>
                <p className="text-muted-foreground mt-1">Update category details</p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Category Title *</Label>
                <Input id="title" placeholder="Enter category title" value={categoryData.title}
                  onChange={(e) => setCategoryData(prev => ({ ...prev, title: e.target.value }))}
                  required className="shadow-admin-sm" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Enter category description (optional)" value={categoryData.description}
                  onChange={(e) => setCategoryData(prev => ({ ...prev, description: e.target.value }))}
                  className="shadow-admin-sm" rows={4} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Category Image</Label>
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">Click to upload category image</p>
                    <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <Button type="button" variant="outline" onClick={() => document.getElementById('image')?.click()}>
                      <Upload className="h-4 w-4 mr-2" /> Choose Image
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <img src={imagePreview} alt="Category preview" className="w-full h-full object-cover" />
                    </div>
                    <Button type="button" variant="outline" size="sm" className="absolute top-2 right-2" onClick={removeImage}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="bg-gradient-primary hover:opacity-90" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />{isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/inventory/categories')} disabled={isLoading}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditCategory;
