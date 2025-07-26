import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, Shield, Database, Users, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    notifications: true,
    autoSync: true,
    riskAlerts: true,
    dataRetention: "12",
    apiTimeout: "30"
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleReset = () => {
    setSettings({
      notifications: true,
      autoSync: true,
      riskAlerts: true,
      dataRetention: "12",
      apiTimeout: "30"
    });
    toast({
      title: "Settings reset",
      description: "All settings have been restored to defaults.",
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
                  value={settings.apiTimeout}
                  onChange={(e) => setSettings({...settings, apiTimeout: e.target.value})}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retention" className="text-foreground">Data Retention (months)</Label>
                <Input
                  id="retention"
                  type="number"
                  value={settings.dataRetention}
                  onChange={(e) => setSettings({...settings, dataRetention: e.target.value})}
                  className="bg-background"
                />
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
      </div>
    </div>
  );
};

export default SettingsPage;