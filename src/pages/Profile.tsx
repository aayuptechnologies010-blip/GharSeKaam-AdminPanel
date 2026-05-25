import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Store,
  MapPin,
  Edit3,
  Save,
  X,
  Loader2,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

interface ProfileData {
  shopname: string;
  shopaddress: {
    city: string;
    state: string;
    pincode: string;
    flatnumber: number;
  }[];
  user: {
    name: string;
    email: string;
    phone: string;
    profileimage: string;
  };
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    shopname: "",
  });

  // Fetch profile from database
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await profileService.getProfile();
        if (res?.success && res?.profile) {
          setProfile(res.profile);
          setFormData({
            name: res.profile.user?.name || "",
            phone: res.profile.user?.phone || "",
            shopname: res.profile.shopname || "",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to load profile data.",
            variant: "destructive",
          });
        }
      } catch (err) {
        toast({
          title: "Network Error",
          description: "Could not connect to server.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Validation", description: "Name cannot be empty.", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      const res = await profileService.updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        shopname: formData.shopname.trim(),
      });

      if (res?.success) {
        // ✅ Sync localStorage so the header shows the new name immediately
        localStorage.setItem("userName", formData.name.trim());

        // Update local profile state
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                shopname: formData.shopname.trim(),
                user: {
                  ...prev.user,
                  name: formData.name.trim(),
                  phone: formData.phone.trim(),
                },
              }
            : prev
        );

        setIsEditing(false);
        toast({
          title: "Profile Updated ✓",
          description: "Your changes have been saved successfully.",
        });

        // Reload layout by dispatching a custom event so AdminLayout refreshes
        window.dispatchEvent(new CustomEvent("userProfileUpdated", {
          detail: { name: formData.name.trim() }
        }));
      } else {
        toast({
          title: "Update Failed",
          description: res?.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Network Error",
        description: "Could not reach the server.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.user?.name || "",
        phone: profile.user?.phone || "",
        shopname: profile.shopname || "",
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-slate-500 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Profile not found.</p>
      </div>
    );
  }

  const address = profile.shopaddress?.[0];
  const initials = (profile.user?.name || "A").charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Hero Profile Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-white/20 shadow-xl">
                <AvatarImage src={profile.user?.profileimage} alt={profile.user?.name} />
                <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-5 h-5 border-2 border-white" />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white">{profile.user?.name}</h2>
              <p className="text-blue-300 mt-0.5">{profile.user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30">
                  <Store className="h-3 w-3 mr-1" />
                  {profile.shopname || "Shop Owner"}
                </Badge>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Verified Admin
                </Badge>
              </div>
            </div>

            <div className="flex-shrink-0">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-500 hover:bg-blue-600 text-white gap-2"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={saving}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Details */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-slate-800 text-base">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              Personal Information
            </CardTitle>
            <CardDescription>Your personal account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-slate-600 text-xs font-semibold uppercase tracking-wide">
                Full Name
              </Label>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="border-slate-200 focus:border-blue-400"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-800 font-medium">{profile.user?.name || "—"}</span>
                </div>
              )}
            </div>

            {/* Email (read-only) */}
            <div className="space-y-1.5">
              <Label className="text-slate-600 text-xs font-semibold uppercase tracking-wide">
                Email Address
              </Label>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-slate-800 font-medium">{profile.user?.email || "—"}</span>
                <Badge variant="secondary" className="ml-auto text-[10px] py-0">
                  Google
                </Badge>
              </div>
              {isEditing && (
                <p className="text-xs text-slate-400">Email is managed by Google and cannot be changed here.</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label className="text-slate-600 text-xs font-semibold uppercase tracking-wide">
                Phone Number
              </Label>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="border-slate-200 focus:border-blue-400"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-800 font-medium">{profile.user?.phone || "Not set"}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shop Details */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-slate-800 text-base">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                <Store className="h-4 w-4 text-amber-600" />
              </div>
              Shop Information
            </CardTitle>
            <CardDescription>Your store details and location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Shop Name */}
            <div className="space-y-1.5">
              <Label className="text-slate-600 text-xs font-semibold uppercase tracking-wide">
                Shop Name
              </Label>
              {isEditing ? (
                <Input
                  value={formData.shopname}
                  onChange={(e) => setFormData({ ...formData, shopname: e.target.value })}
                  placeholder="Your shop name"
                  className="border-slate-200 focus:border-blue-400"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                  <Store className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-800 font-medium">{profile.shopname || "—"}</span>
                </div>
              )}
            </div>

            {/* Address */}
            {address && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-slate-600 text-xs font-semibold uppercase tracking-wide">
                    Shop Address
                  </Label>
                  <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="text-slate-800">
                      <p className="font-medium">
                        {address.flatnumber ? `Flat ${address.flatnumber}, ` : ""}
                        {address.city}
                      </p>
                      <p className="text-sm text-slate-500">
                        {address.state} — {address.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!address && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-700">
                No address on record. Complete your shop setup to add address details.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account Info Strip */}
      <Card className="border-0 shadow-sm bg-slate-50">
        <CardContent className="py-4 flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <span>Account is secured via Google OAuth</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Session active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
