import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import adminHero from "@/assets/admin-hero.jpg";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Already logged in? Go to dashboard
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/dashboard");
      return;
    }

    // Handle OAuth callback: ?token=xxx&success=yes&name=xxx&email=xxx
    const token_param = searchParams.get("token");
    const success = searchParams.get("success");
    const name = searchParams.get("name");
    const email = searchParams.get("email");

    if (token_param) {
      if (success === "yes") {
        localStorage.setItem("authToken", token_param);
        if (name) localStorage.setItem("userName", decodeURIComponent(name));
        if (email) localStorage.setItem("userEmail", decodeURIComponent(email));
        toast({ title: "Login Successful", description: `Welcome back, ${name || "Admin"}!` });
        navigate("/dashboard");
      } else if (success === "no") {
        // New user, needs shop setup
        localStorage.setItem("authToken", token_param);
        if (name) localStorage.setItem("userName", decodeURIComponent(name));
        if (email) localStorage.setItem("userEmail", decodeURIComponent(email));
        toast({ title: "Setup Required", description: "Please complete your shop setup." });
        navigate("/setup");
      } else {
        setError("Authentication failed. Please try again.");
      }
    }
  }, [navigate, searchParams]);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError(null);
    // Redirect to backend Google OAuth
    window.location.href = `${API_BASE}/owner/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#131921] via-[#1a2535] to-[#232f3e] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="hidden lg:block">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl animate-fade-in">
            <img
              src={adminHero}
              alt="GharSeKro.in Admin Dashboard"
              className="w-full h-[600px] object-cover"
            />
            <div className="absolute inset-0 bg-[#232f3e]/88 backdrop-blur-[3px] flex items-center justify-center">
              <div className="text-center text-white p-8 space-y-5">
                <div className="flex items-center justify-center">
                  <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center p-3 shadow-2xl border border-white/20">
                    <img src="/logo.png" alt="GharSeKro Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
                <h1 className="text-4xl font-black tracking-tight">GharSeKro.in</h1>
                <p className="text-[#febd69] font-black text-sm uppercase tracking-widest">Admin Portal</p>
                <p className="text-slate-300 text-base max-w-sm mx-auto font-medium leading-relaxed">
                  Manage your store inventory, orders, and categories with ease
                </p>
                <div className="flex items-center justify-center gap-6 pt-4">
                  {[["Inventory", "📦"], ["Orders", "🛒"], ["Analytics", "📊"]].map(([label, icon]) => (
                    <div key={label} className="flex flex-col items-center gap-1">
                      <span className="text-2xl">{icon}</span>
                      <span className="text-xs text-slate-400 font-semibold">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md shadow-2xl border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden">
            {/* Top gradient accent */}
            <div className="h-1 bg-gradient-to-r from-[#febd69] via-[#f59e0b] to-[#febd69]" />

            <CardHeader className="text-center space-y-4 pt-8">
              <div className="flex items-center justify-center">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center p-2 shadow-xl border border-slate-100">
                  <img src="/logo.png" alt="GharSeKro Logo" className="w-full h-full object-contain" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-white tracking-tight">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-slate-400 font-medium mt-1">
                  Sign in to your GharSeKro.in Admin Dashboard
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 px-8 pb-8">
              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                  <p className="text-sm text-red-400 font-medium">{error}</p>
                </div>
              )}

              <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 font-bold py-6 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 text-sm"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
                ) : (
                  <Chrome className="h-5 w-5 text-blue-500" />
                )}
                {isLoading ? "Redirecting..." : "Continue with Google"}
              </Button>

              <div className="text-center">
                <p className="text-xs text-slate-500 font-medium">
                  Secure authentication powered by Google OAuth 2.0
                </p>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-center text-xs text-slate-600">
                  Only authorized GharSeKro admin accounts can access this panel
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
