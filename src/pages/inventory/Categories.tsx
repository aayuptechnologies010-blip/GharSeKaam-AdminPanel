import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, FolderOpen, List, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { categoryService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Category {
  id: string;
  title: string;
  image: string;
  createdAt: string;
  // Adding computed property for backwards compatibility
  name?: string;
  itemCount?: number;
}

const Categories = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteCategory = async (category: Category) => {
    if (window.confirm(`Are you sure you want to delete the category "${category.title || category.name}"? This will fail if there are active items linked.`)) {
      try {
        const response = await categoryService.deleteCategory(category.id);
        if (response.success) {
          toast({
            title: "Category Deleted",
            description: `Successfully deleted "${category.title || category.name}"`,
          });
          setCategories(prev => prev.filter(c => c.id !== category.id));
        } else {
          throw new Error(response.message || "Failed to delete category");
        }
      } catch (error) {
        console.error("Failed to delete category:", error);
        toast({
          title: "Error Deleting Category",
          description: error instanceof Error ? error.message : "Internal Server Error",
          variant: "destructive"
        });
      }
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);

      // Call real API using the service
      const response = await categoryService.getCategories();

      if (response.success && response.categories) {
        // Transform API data to match our interface
        const transformedCategories = response.categories.map((cat: any) => ({
          ...cat,
          name: cat.title, // Map title to name for backwards compatibility
          itemCount: 0 // API doesn't provide item count yet
        }));

        setCategories(transformedCategories);

        toast({
          title: "Categories loaded",
          description: `Found ${transformedCategories.length} categories`,
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);

      toast({
        title: "Error loading categories",
        description: error instanceof Error ? error.message : "Failed to fetch categories",
        variant: "destructive"
      });

      // Set empty array on error
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    (category.title || category.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">Manage your product categories</p>
        </div>
        <Button onClick={() => navigate("/inventory/add-category")} className="bg-gradient-primary hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Search and Layout Toggle */}
      <Card className="shadow-admin-sm border-0">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-1 shrink-0 bg-slate-50">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className={cn(
                "h-8 px-3 rounded-lg flex items-center gap-1.5 transition-all text-xs font-semibold",
                viewMode === "table" ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800"
              )}
            >
              <List className="h-4 w-4" />
              Table View
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={cn(
                "h-8 px-3 rounded-lg flex items-center gap-1.5 transition-all text-xs font-semibold",
                viewMode === "grid" ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Card View
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories View */}
      {isLoading ? (
        viewMode === "table" ? (
          <Card className="shadow-admin-md border-0">
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="shadow-admin-md border-0">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : filteredCategories.length === 0 ? (
        <Card className="shadow-admin-md border-0">
          <CardContent className="p-12 text-center">
            <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No categories found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No categories match your search." : "You haven't created any categories yet."}
            </p>
            <Button onClick={() => navigate("/inventory/add-category")}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first category
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        <div className="bg-white rounded-xl shadow-admin-md border border-slate-200/60 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[100px] font-semibold text-slate-700">Image</TableHead>
                <TableHead className="font-semibold text-slate-700">Category Name</TableHead>
                <TableHead className="font-semibold text-slate-700">Items Count</TableHead>
                <TableHead className="font-semibold text-slate-700">Created Date</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell>
                    {category.image ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-200/60 flex items-center justify-center shadow-sm">
                        <img
                          src={category.image}
                          alt={category.title || category.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-200/60 flex items-center justify-center shadow-sm">
                        <img
                          src="https://images.unsplash.com/photo-1581094751156-df591244e8ecc?q=80&w=300&auto=format&fit=crop"
                          alt={category.title || category.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">
                    {category.title || category.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none px-2.5 py-1">
                      {category.itemCount || 0} items
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {new Date(category.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 font-semibold"
                        onClick={() => navigate(`/inventory/items?category=${category.id}`)}
                      >
                        View Items
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-slate-100 text-slate-600"
                        onClick={() => navigate(`/inventory/edit-category/${category.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-50 text-red-600"
                        onClick={() => handleDeleteCategory(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="shadow-admin-md border-0 hover:shadow-admin-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{category.title || category.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/inventory/edit-category/${category.id}`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Category Image */}
                  {category.image && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <img
                        src={category.image}
                        alt={category.title || category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Items</span>
                    <Badge variant="secondary">{category.itemCount || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm">{new Date(category.createdAt).toLocaleDateString()}</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full font-semibold"
                    onClick={() => navigate(`/inventory/items?category=${category.id}`)}
                  >
                    View Items
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;