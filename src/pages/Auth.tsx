import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Chrome } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import adminHero from "@/assets/admin-hero.jpg";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) { navigate("/dashboard"); return; }
  }, [navigate]);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem("authToken", "demo-admin-token");
      localStorage.setItem("userName", "Admin User");
      localStorage.setItem("userEmail", "admin@gharsekro.com");
      toast({ title: "Login Successful", description: "Welcome to GharSeKro Admin Panel!" });
      navigate("/dashboard");
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="hidden lg:block">
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={adminHero}
              alt="GharSeKro.com Admin Dashboard"
              className="w-full h-[600px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary-hover/80 flex items-center justify-center">
              <div className="text-center text-white p-8">
                <div className="flex items-center justify-center mb-6">
                  <ShoppingBag className="h-16 w-16 mb-4" />
                </div>
                <h1 className="text-4xl font-bold mb-4">GharSeKro.com Admin</h1>
                <p className="text-xl opacity-90">
                  Manage your store inventory, orders, and categories with ease
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md shadow-admin-lg border-0">
            <CardHeader className="text-center space-y-2">
              <div className="flex items-center justify-center lg:hidden">
                <ShoppingBag className="h-12 w-12 text-primary mb-4" />
              </div>
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to your GharSeKro.com Admin Dashboard
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-border shadow-admin-sm hover:shadow-admin-md text-foreground font-semibold py-6 transition-all duration-200 hover:bg-muted"
              >
                <Chrome className="h-5 w-5" />
                {isLoading ? "Connecting..." : "Continue with Google"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Secure authentication powered by Google OAuth
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
