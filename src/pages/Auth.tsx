import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Package, ShoppingCart, BarChart3, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import adminHero from "@/assets/admin-hero.jpg";

// Demo admin credentials - change these as needed
const ADMIN_CREDENTIALS = [
  { email: "admin@gharsekro.com", password: "admin123", name: "Admin User" },
  { email: "owner@gharsekro.com", password: "owner123", name: "Store Owner" },
];

import { API_BASE_URL } from "@/lib/constants";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existingToken = localStorage.getItem("authToken");
    if (existingToken) navigate("/dashboard");
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/owner/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed. Please check your credentials.");
      }

      const { token, isSetupComplete, user } = data;

      if (isSetupComplete) {
        localStorage.setItem("authToken", token);
        if (user?.name) localStorage.setItem("userName", user.name);
        if (user?.email) localStorage.setItem("userEmail", user.email);
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user?.name || "Admin"}!`,
        });
        navigate("/dashboard");
      } else {
        localStorage.setItem("authToken", token);
        localStorage.setItem("tempAuthToken", token);
        if (user?.name) localStorage.setItem("tempUserName", user.name);
        if (user?.email) localStorage.setItem("tempUserEmail", user.email);
        toast({
          title: "Authentication Successful",
          description: "Please complete your shop setup details.",
        });
        navigate("/setup");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1017] via-[#131921] to-[#1f2937] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">

        {/* Hero Section */}
        <div className="hidden lg:block">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl group">
            <img
              src={adminHero}
              alt="GharSeKro.in Admin Dashboard"
              className="w-full h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1017]/95 via-[#131921]/80 to-[#1f2937]/50 flex items-center justify-center p-6">
              <div className="w-full max-w-md bg-slate-950/65 backdrop-blur-lg border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative space-y-6">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-[#febd69] to-transparent shadow-[0_0_8px_#febd69]" />

                <div className="flex items-center justify-center">
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center p-3.5 shadow-2xl border border-white/20">
                    <img src="/logo.png" alt="GharSeKro Logo" className="w-full h-full object-contain" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-4xl font-extrabold tracking-tight text-white">GharSeKro.in</h1>
                  <div className="inline-flex items-center justify-center bg-amber-500/10 text-[#febd69] border border-amber-500/20 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest">
                    Admin Portal
                  </div>
                </div>

                <p className="text-slate-300 text-sm max-w-xs mx-auto font-medium leading-relaxed">
                  Manage your store inventory, orders, and categories with absolute ease.
                </p>

                <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/5">
                  {[
                    { label: "Inventory", icon: Package, color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
                    { label: "Orders", icon: ShoppingCart, color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
                    { label: "Analytics", icon: BarChart3, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
                  ].map(({ label, icon: Icon, color }) => (
                    <div key={label} className="flex flex-col items-center gap-2">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${color} shadow-sm`}>
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

        {/* Login Card */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md shadow-2xl border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#febd69] via-[#f59e0b] to-[#febd69]" />

            <CardHeader className="text-center space-y-4 pt-8 pb-4">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2 shadow-xl border border-slate-100">
                  <img src="/logo.png" alt="GharSeKro Logo" className="w-full h-full object-contain" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-white tracking-tight">Admin Login</CardTitle>
                <CardDescription className="text-slate-400 font-medium mt-1">
                  Sign in to GharSeKro Admin Panel
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              <form onSubmit={handleLogin} className="space-y-5">

                {error && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                    <p className="text-sm text-red-400 font-medium">{error}</p>
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@gharsekro.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(null); }}
                      className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(null); }}
                      className="pl-10 pr-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-200 hover:-translate-y-0.5 text-sm mt-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Sign In to Admin Panel"
                  )}
                </Button>

              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Auth;
