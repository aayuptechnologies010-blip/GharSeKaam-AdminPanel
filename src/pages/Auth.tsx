import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Chrome } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import adminHero from "@/assets/admin-hero.jpg";
import { API_BASE_URL } from "@/lib/constants";
import { profileService } from "@/lib/api";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Backend URL
  const API_URL = API_BASE_URL;

  useEffect(() => {
    // If already logged in
    const token = localStorage.getItem("authToken");
    if (token) { navigate("/dashboard"); return; }

    // Read backend redirect query params sent after Google OAuth
    const params = new URLSearchParams(window.location.search);

    const token_param = params.get("token");
    const name = params.get("name");
    const email = params.get("email");
    const profile = params.get("profile");
    const isExistingUser = params.get("success");

    // ❗ NEVER handle `code=` here → Google OAuth code is for BACKEND, not React

    if (!token_param) return;

    console.log("Auth: Received final token from backend:", token_param);

    if (isExistingUser === "yes") {
      // Store token + OAuth data immediately so subsequent API call is authenticated
      localStorage.setItem("authToken", token_param);
      if (name) localStorage.setItem("userName", decodeURIComponent(name));
      if (email) localStorage.setItem("userEmail", decodeURIComponent(email));
      if (profile) localStorage.setItem("userProfile", profile);

      // ✅ Inner async to sync real DB name after login
      const syncFromDB = async () => {
        try {
          const profileRes = await profileService.getProfile();
          if (profileRes?.success && profileRes?.profile?.user) {
            const dbUser = profileRes.profile.user;
            if (dbUser.name) localStorage.setItem("userName", dbUser.name);
            if (dbUser.email) localStorage.setItem("userEmail", dbUser.email);
            if (dbUser.profileimage) localStorage.setItem("userProfile", dbUser.profileimage);
          }
        } catch (e) {
          console.warn("Auth: Could not sync profile from DB, using OAuth data", e);
        }
        // Clean URL and navigate after sync
        window.history.replaceState({}, "", window.location.pathname);
        navigate("/dashboard");
      };

      syncFromDB();
    } else if (isExistingUser === "no") {
      // New Shopkeeper (needs setup)
      localStorage.setItem("tempAuthToken", token_param);
      if (name) localStorage.setItem("tempUserName", decodeURIComponent(name));
      if (email) localStorage.setItem("tempUserEmail", decodeURIComponent(email));
      if (profile) localStorage.setItem("tempUserProfile", profile);

      window.history.replaceState({}, "", window.location.pathname);
      navigate("/setup");
    }
  }, [navigate]);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Redirect to backend OAuth endpoint
    window.location.href = `${API_URL}/owner/auth/google`;
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
