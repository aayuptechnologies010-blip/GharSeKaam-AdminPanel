import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome, Loader2, AlertCircle, Package, ShoppingCart, BarChart3 } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-[#0c1017] via-[#131921] to-[#1f2937] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="hidden lg:block">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl animate-fade-in group">
            <img
              src={adminHero}
              alt="GharSeKro.in Admin Dashboard"
              className="w-full h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Darker premium radial overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1017]/95 via-[#131921]/80 to-[#1f2937]/50 flex items-center justify-center p-6">
              {/* Floating Glassmorphic Card */}
              <div className="w-full max-w-md bg-slate-950/65 backdrop-blur-lg border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative space-y-6">
                {/* Glowing top element */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-[#febd69] to-transparent shadow-[0_0_8px_#febd69]" />
                
                {/* Logo with clean soft-shadow wrapper */}
                <div className="flex items-center justify-center">
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center p-3.5 shadow-2xl border border-white/20 relative group-hover:scale-105 transition-transform">
                    <img src="/logo.png" alt="GharSeKro Logo" className="w-full h-full object-contain" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-4xl font-extrabold tracking-tight text-white bg-gradient-to-b from-white to-slate-200 bg-clip-text">
                    GharSeKro.in
                  </h1>
                  <div className="inline-flex items-center justify-center bg-amber-500/10 text-[#febd69] border border-amber-500/20 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-sm">
                    Admin Portal
                  </div>
                </div>

                <p className="text-slate-300 text-sm max-w-xs mx-auto font-medium leading-relaxed">
                  Manage your store inventory, orders, and categories with absolute ease.
                </p>

                {/* Upgraded beautiful Lucide feature badges instead of emojis */}
                <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/5">
                  {[
                    { label: "Inventory", icon: Package, color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
                    { label: "Orders", icon: ShoppingCart, color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
                    { label: "Analytics", icon: BarChart3, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" }
                  ].map(({ label, icon: Icon, color }) => (
                    <div key={label} className="flex flex-col items-center gap-2">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${color} shadow-sm transition-all duration-300 hover:scale-110`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
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
