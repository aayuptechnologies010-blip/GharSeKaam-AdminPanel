import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import ShopSetup from "./pages/ShopSetup";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/inventory/Categories";
import Items from "./pages/inventory/Items";
import AddCategory from "./pages/inventory/AddCategory";
import AddItem from "./pages/inventory/AddItem";
import EditItem from "./pages/inventory/EditItem";
import EditCategory from "./pages/inventory/EditCategory";
import Orders from "./pages/Orders";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ErrorPage from "./pages/ErrorPage";
import ShopImageManager from "./pages/inventory/UploadShopImg";
import Customers from "./pages/Customers";
import Profile from "./pages/Profile";
import LabourServices from "./pages/LabourServices";
import WholesaleSettings from "./pages/WholesaleSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/oauth/callback" element={<Auth />} />
          <Route path="/setup" element={<ShopSetup />} />
          <Route path="/error" element={<ErrorPage/>} />

          {/* Admin Routes with Layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="inventory/categories" element={<Categories />} />
            <Route path="inventory/items" element={<Items />} />
            <Route path="inventory/add-category" element={<AddCategory />} />
            <Route path="inventory/add-item" element={<AddItem />} />
            <Route path="inventory/edit-item/:itemId" element={<EditItem />} />
            <Route path="inventory/edit-category/:categoryId" element={<EditCategory />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="inventory/upload-shop-image" element={<ShopImageManager/>} />
            <Route path="profile" element={<Profile />} />
            <Route path="labour-services" element={<LabourServices />} />
            <Route path="wholesale-settings" element={<WholesaleSettings />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
