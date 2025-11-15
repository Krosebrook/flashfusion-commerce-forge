import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, Shield, Database, Users, ArrowLeft, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const settingsSchema = z.object({
  apiTimeout: z.number().min(1, "Timeout must be at least 1 second").max(300, "Timeout cannot exceed 300 seconds"),
  dataRetention: z.number().min(1, "Retention must be at least 1 month").max(120, "Retention cannot exceed 120 months"),
});

const SettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const [settings, setSettings] = useState({
    notifications: true,
    autoSync: true,
    riskAlerts: true,
    dataRetention: "12",
    apiTimeout: "30"
  });
  const [errors, setErrors] = useState<{ apiTimeout?: string; dataRetention?: string }>({});
  const [bootstrapping, setBootstrapping] = useState(false);
  const [hasAdminRole, setHasAdminRole] = useState(false);

  useEffect(() => {
    checkAdminRole();
  }, [user]);

  const checkAdminRole = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();
    
    setHasAdminRole(!!data);
  };

  const handleBootstrapAdmin = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to bootstrap admin access.",
        variant: "destructive",
      });
      return;
    }

    setBootstrapping(true);
    try {
      const { error } = await supabase.rpc('bootstrap_admin', {
        target_user: user.id
      });

      if (error) throw error;

      toast({
        title: "Admin access granted",
        description: "You now have administrator privileges. Refresh the page to see admin features.",
      });
      
      // Refresh to update admin status
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error('Bootstrap admin error:', error);
      toast({
        title: "Failed to grant admin access",
        description: error.message || "An error occurred while granting admin access.",
        variant: "destructive",
      });
    } finally {
      setBootstrapping(false);
    }
  };

  const handleSave = () => {
    try {
      settingsSchema.parse({
        apiTimeout: parseInt(settings.apiTimeout) || 0,
        dataRetention: parseInt(settings.dataRetention) || 0,
      });
      setErrors({});
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { apiTimeout?: string; dataRetention?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof typeof fieldErrors] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast({
          title: "Validation error",
          description: "Please check the form for errors.",
          variant: "destructive",
        });
      }
    }
  };

  const handleReset = () => {
    setSettings({
      notifications: true,
      autoSync: true,
      riskAlerts: true,
      dataRetention: "12",
      apiTimeout: "30"
    });
    setErrors({});
    toast({
      title: "Settings reset",
      description: "All settings have been restored to defaults.",
    });
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/")}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground">Configure your FlashFusion preferences</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleSave} className="bg-fusion-primary hover:bg-fusion-primary/90">
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset to Defaults
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Notification Settings */}
        <Card className="bg-gradient-card border-border/40 shadow-card">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-fusion-primary" />
              <CardTitle className="text-foreground">Notifications</CardTitle>
            </div>
            <CardDescription>Manage how you receive alerts and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive real-time alerts on your device</p>
              </div>
              <Switch 
                checked={settings.notifications}
                onCheckedChange={(checked) => setSettings({...settings, notifications: checked})}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Auto-sync Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified when sync operations complete</p>
              </div>
              <Switch 
                checked={settings.autoSync}
                onCheckedChange={(checked) => setSettings({...settings, autoSync: checked})}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Risk Alerts</Label>
                <p className="text-sm text-muted-foreground">Critical security and risk notifications</p>
              </div>
              <Switch 
                checked={settings.riskAlerts}
                onCheckedChange={(checked) => setSettings({...settings, riskAlerts: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-gradient-card border-border/40 shadow-card">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-fusion-warning" />
              <CardTitle className="text-foreground">Security</CardTitle>
            </div>
            <CardDescription>Protect your account and data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeout" className="text-foreground">API Timeout (seconds)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min={1}
                  max={300}
                  value={settings.apiTimeout}
                  onChange={(e) => {
                    setSettings({...settings, apiTimeout: e.target.value});
                    if (errors.apiTimeout) {
                      setErrors({ ...errors, apiTimeout: undefined });
                    }
                  }}
                  className={`bg-background ${errors.apiTimeout ? 'border-red-500' : ''}`}
                />
                {errors.apiTimeout && (
                  <p className="text-sm text-red-500">{errors.apiTimeout}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="retention" className="text-foreground">Data Retention (months)</Label>
                <Input
                  id="retention"
                  type="number"
                  min={1}
                  max={120}
                  value={settings.dataRetention}
                  onChange={(e) => {
                    setSettings({...settings, dataRetention: e.target.value});
                    if (errors.dataRetention) {
                      setErrors({ ...errors, dataRetention: undefined });
                    }
                  }}
                  className={`bg-background ${errors.dataRetention ? 'border-red-500' : ''}`}
                />
                {errors.dataRetention && (
                  <p className="text-sm text-red-500">{errors.dataRetention}</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-fusion-warning/30 bg-fusion-warning/5">
              <div className="space-y-0.5">
                <Label className="text-foreground">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
              <Badge className="bg-fusion-warning/20 text-fusion-warning border-fusion-warning/30">
                Recommended
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Integration Settings */}
        <Card className="bg-gradient-card border-border/40 shadow-card">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-fusion-accent" />
              <CardTitle className="text-foreground">Data & Integrations</CardTitle>
            </div>
            <CardDescription>Manage platform connections and data handling</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <p className="font-medium text-foreground">Export Data</p>
                  <p className="text-xs text-muted-foreground">Download your data in CSV format</p>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <p className="font-medium text-foreground">Reset Integrations</p>
                  <p className="text-xs text-muted-foreground">Reconnect all platform APIs</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin Bootstrap Card - Only shown if user is NOT admin */}
        {!hasAdminRole && (
          <Card className="bg-gradient-card border-border/40 shadow-card border-primary/30">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-primary" />
                <CardTitle className="text-foreground">Administrator Access</CardTitle>
              </div>
              <CardDescription>Grant yourself admin privileges for this application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                <p className="text-sm text-foreground mb-4">
                  As an administrator, you'll have access to:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Error Dashboard with comprehensive monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Error Alert Configuration system
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Real-time error notifications
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Advanced system analytics and insights
                  </li>
                </ul>
              </div>
              <Button
                onClick={handleBootstrapAdmin}
                disabled={bootstrapping}
                className="w-full"
              >
                {bootstrapping ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Granting Access...
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Grant Admin Access
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                This uses the <code className="bg-muted px-1 py-0.5 rounded text-foreground">bootstrap_admin</code> function to securely grant admin privileges
              </p>
            </CardContent>
          </Card>
        )}

        {/* Admin Status Card - Only shown if user IS admin */}
        {hasAdminRole && (
          <Card className="bg-gradient-card border-border/40 shadow-card border-primary/30">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-primary" />
                <CardTitle className="text-foreground">Administrator Status</CardTitle>
              </div>
              <CardDescription>You have administrator privileges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-primary/30 bg-primary/5">
                <div className="space-y-0.5">
                  <Label className="text-foreground">Admin Role Active</Label>
                  <p className="text-sm text-muted-foreground">You have access to all admin features</p>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Crown className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/admin/errors')}
                  className="justify-start"
                >
                  View Error Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/admin/error-alerts')}
                  className="justify-start"
                >
                  Configure Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;