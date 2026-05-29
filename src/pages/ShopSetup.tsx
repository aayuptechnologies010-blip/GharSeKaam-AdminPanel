import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingBag, Store, MapPin, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const ShopSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [shopData, setShopData] = useState({
    shopname: "",
    city: "",
    state: "",
    pincode: "",
    flatnumber: "",
    phone: ""
  });

  const API_URL = API_BASE_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      console.log('ShopSetup: Starting shop setup with token:', token ? 'Present' : 'Missing');

      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('ShopSetup: Request details:', {
        url: `${API_URL}/owner/auth/signup`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}...` // Log only first 20 chars for security
        },
        body: shopData
      });

      // Try with the token directly (most likely format based on your API)
      let response = await fetch(`${API_URL}/owner/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token  // Direct token, no Bearer prefix
        },
        body: JSON.stringify(shopData)
      });

      console.log('ShopSetup: API response status:', response.status);
      console.log('ShopSetup: API response headers:', Object.fromEntries(response.headers.entries()));

      // If 401/403, try with Bearer prefix
      if (response.status === 401 || response.status === 403) {
        console.log('ShopSetup: Direct token failed, trying with Bearer prefix');
        response = await fetch(`${API_URL}/owner/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(shopData)
        });
      }

      // If still failing, try custom header
      if (response.status === 401 || response.status === 403 || response.status === 501) {
        console.log('ShopSetup: Standard auth failed, trying with x-auth-token header');
        response = await fetch(`${API_URL}/owner/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(shopData)
        });
      }

      // If still 501, try different endpoint paths
      if (response.status === 501) {
        console.log('ShopSetup: Trying alternative endpoint: /owner/signup');
        response = await fetch(`${API_URL}/owner/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`
          },
          body: JSON.stringify(shopData)
        });
      }

      if (response.status === 501) {
        console.log('ShopSetup: Trying alternative endpoint: /auth/signup');
        response = await fetch(`${API_URL}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`
          },
          body: JSON.stringify(shopData)
        });
      }

      console.log('ShopSetup: API response status:', response.status);
      console.log('ShopSetup: API response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        console.log('ShopSetup: Shop setup successful');

        let permanentToken = "";
        try {
          const resData = await response.json();
          permanentToken = resData.token;
          console.log('ShopSetup: Parsed permanent token from signup response:', permanentToken ? "Present" : "Missing");
        } catch (err) {
          console.error('ShopSetup: Failed to parse signup response JSON:', err);
        }

        // Move temp data to permanent storage
        const tempToken = localStorage.getItem('tempAuthToken');
        const tempName = localStorage.getItem('tempUserName');
        const tempEmail = localStorage.getItem('tempUserEmail');
        const tempProfile = localStorage.getItem('tempUserProfile');

        console.log('ShopSetup: Moving temp data to permanent storage:', {
          hasToken: !!tempToken,
          hasName: !!tempName,
          hasEmail: !!tempEmail,
          hasProfile: !!tempProfile
        });

        const tokenToStore = permanentToken || tempToken;
        if (tokenToStore) localStorage.setItem('authToken', tokenToStore);
        if (tempName) localStorage.setItem('userName', tempName);
        if (tempEmail) localStorage.setItem('userEmail', tempEmail);
        if (tempProfile) localStorage.setItem('userProfile', tempProfile);

        // Clear temp data
        localStorage.removeItem('tempAuthToken');
        localStorage.removeItem('tempUserName');
        localStorage.removeItem('tempUserEmail');
        localStorage.removeItem('tempUserProfile');

        console.log('ShopSetup: Cleared temp data, redirecting to /dashboard');

        toast({
          title: "Shop Setup Complete!",
          description: "Your shop has been successfully registered.",
        });

        // Use setTimeout to ensure localStorage is updated before navigation
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
      } else {
        const errorData = await response.text();
        console.error('ShopSetup: Setup failed with response status:', response.status, 'Error:', errorData);
        console.error('ShopSetup: Response URL:', response.url);

        // Try to parse error as JSON if possible
        try {
          const jsonError = JSON.parse(errorData);
          console.error('ShopSetup: Parsed error response:', jsonError);
        } catch (e) {
          console.error('ShopSetup: Raw error response:', errorData);
        }

        throw new Error(`Setup failed: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setShopData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-admin-lg border-0">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <Store className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Setup Your Shop</CardTitle>
          <p className="text-muted-foreground">
            Complete your shop information to get started with GharSeKro.com Admin
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="shopname" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Shop Name *
                </Label>
                <Input
                  id="shopname"
                  placeholder="Enter your shop name"
                  value={shopData.shopname}
                  onChange={(e) => handleInputChange('shopname', e.target.value)}
                  required
                  className="shadow-admin-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  value={shopData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  className="shadow-admin-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="flatnumber" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Flat/House Number *
                </Label>
                <Input
                  id="flatnumber"
                  placeholder="Flat/House number"
                  value={shopData.flatnumber}
                  onChange={(e) => handleInputChange('flatnumber', e.target.value)}
                  required
                  className="shadow-admin-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={shopData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                  className="shadow-admin-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="Enter state"
                  value={shopData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  required
                  className="shadow-admin-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  placeholder="Enter pincode"
                  value={shopData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  required
                  className="shadow-admin-sm"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-6 bg-gradient-primary hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? "Setting up your shop..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopSetup;