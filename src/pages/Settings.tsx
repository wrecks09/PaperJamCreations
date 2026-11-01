import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { User, LogOut, Mail, Building2, Key, MapPin, Phone, Globe } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function Settings() {
  const { user, signOut } = useAuth();
  const [businessName, setBusinessName] = useState("Paper Jam Creations");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessWebsite, setBusinessWebsite] = useState("");
  const [defaultMarkup, setDefaultMarkup] = useState(50);
  const [loading, setLoading] = useState(true);

  // Load saved settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("companySettings");
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        setBusinessName(settings.name || "Paper Jam Creations");
        setBusinessAddress(settings.address || "");
        setBusinessPhone(settings.phone || "");
        setBusinessEmail(settings.email || "");
        setBusinessWebsite(settings.website || "");
        setDefaultMarkup(settings.defaultMarkup || 50);
      } catch (e) {
        console.error("Failed to parse company settings", e);
      }
    }
    setLoading(false);
  }, []);

  const handleSaveSettings = () => {
    const settings = {
      name: businessName,
      address: businessAddress,
      phone: businessPhone,
      email: businessEmail,
      website: businessWebsite,
      defaultMarkup: defaultMarkup,
    };
    localStorage.setItem("companySettings", JSON.stringify(settings));
    toast.success("Business information saved successfully");
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* User Profile */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{user?.email || "Unknown"}</p>
                <p className="text-sm text-muted-foreground">Signed in</p>
              </div>
            </div>
            <Button variant="destructive" onClick={handleSignOut} className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                placeholder="Your printing business"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessAddress">Business Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="businessAddress"
                  placeholder="123 Print Street, Manila"
                  className="pl-10"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessPhone">Business Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="businessPhone"
                    placeholder="+63 9XX XXX XXXX"
                    className="pl-10"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessEmail">Business Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="businessEmail"
                    type="email"
                    placeholder="info@yourbusiness.com"
                    className="pl-10"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessWebsite">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="businessWebsite"
                    placeholder="www.yourbusiness.com"
                    className="pl-10"
                    value={businessWebsite}
                    onChange={(e) => setBusinessWebsite(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultMarkup">Default Markup (%)</Label>
                <Input
                  id="defaultMarkup"
                  type="number"
                  min="0"
                  max="100"
                  value={defaultMarkup}
                  onChange={(e) => setDefaultMarkup(parseInt(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                />
              </div>
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Password changes are managed through Supabase Auth. You can reset your password via the login page.
            </p>
            <Button variant="outline" onClick={() => window.open(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`, "_blank")}>
              Manage in Supabase Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Backup & Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your data is stored securely in Supabase (PostgreSQL). Automatic backups are handled by Supabase.
            </p>
            <div className="flex gap-2">
              <Button variant="outline">Export Data (CSV)</Button>
              <Button variant="outline">Import Data</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}