import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, Shield, ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
}

const AlertsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Etsy Fee Increase Detected',
      description: 'Transaction fees will increase by 0.5% starting next month. Adjust pricing strategies accordingly.',
      timestamp: '2 hours ago',
      resolved: false
    },
    {
      id: '2',
      type: 'critical',
      title: 'Shopify API Rate Limit',
      description: 'Approaching API rate limit. Consider optimizing sync frequency.',
      timestamp: '4 hours ago',
      resolved: false
    },
    {
      id: '3',
      type: 'info',
      title: 'TikTok Shop Integration Ready',
      description: 'Your TikTok Shop integration is now ready for activation.',
      timestamp: '1 day ago',
      resolved: true
    },
    {
      id: '4',
      type: 'warning',
      title: 'Inventory Sync Delay',
      description: 'Shopify inventory sync is delayed by 15 minutes due to high volume.',
      timestamp: '2 days ago',
      resolved: true
    }
  ]);

  const markAsResolved = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
    toast({
      title: "Alert resolved",
      description: "The alert has been marked as resolved.",
    });
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
    toast({
      title: "Alert dismissed",
      description: "The alert has been removed from your list.",
    });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-fusion-danger" />;
      case 'warning':
        return <Clock className="w-5 h-5 text-fusion-warning" />;
      case 'info':
        return <CheckCircle className="w-5 h-5 text-fusion-success" />;
      default:
        return <Shield className="w-5 h-5 text-fusion-primary" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'critical':
        return <Badge className="bg-fusion-danger/20 text-fusion-danger border-fusion-danger/30">Critical</Badge>;
      case 'warning':
        return <Badge className="bg-fusion-warning/20 text-fusion-warning border-fusion-warning/30">Warning</Badge>;
      case 'info':
        return <Badge className="bg-fusion-success/20 text-fusion-success border-fusion-success/30">Info</Badge>;
      default:
        return <Badge className="bg-fusion-primary/20 text-fusion-primary border-fusion-primary/30">System</Badge>;
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const resolvedAlerts = alerts.filter(alert => alert.resolved);

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
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">System Alerts</h1>
                <p className="text-sm text-muted-foreground">Monitor and manage system notifications</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-fusion-warning text-fusion-warning">
                {activeAlerts.length} Active
              </Badge>
              <Badge variant="outline" className="border-fusion-success text-fusion-success">
                {resolvedAlerts.length} Resolved
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <Card className="bg-gradient-card border-border/40 shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-fusion-warning" />
                <span>Active Alerts</span>
              </CardTitle>
              <CardDescription>Issues requiring attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeAlerts.map((alert) => (
                <div key={alert.id} className="p-4 rounded-lg border border-border/40 bg-background/20">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-foreground">{alert.title}</h4>
                          {getAlertBadge(alert.type)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                        <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => markAsResolved(alert.id)}
                        className="text-fusion-success border-fusion-success/30 hover:bg-fusion-success/10"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => dismissAlert(alert.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Resolved Alerts */}
        {resolvedAlerts.length > 0 && (
          <Card className="bg-gradient-card border-border/40 shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-fusion-success" />
                <span>Resolved Alerts</span>
              </CardTitle>
              <CardDescription>Previously addressed issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resolvedAlerts.map((alert) => (
                <div key={alert.id} className="p-4 rounded-lg border border-border/40 bg-background/20 opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-foreground">{alert.title}</h4>
                          {getAlertBadge(alert.type)}
                          <Badge className="bg-fusion-success/20 text-fusion-success border-fusion-success/30">
                            Resolved
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                        <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => dismissAlert(alert.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* No Alerts */}
        {alerts.length === 0 && (
          <Card className="bg-gradient-card border-border/40 shadow-card">
            <CardContent className="py-16 text-center">
              <CheckCircle className="w-16 h-16 text-fusion-success mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">All Clear!</h3>
              <p className="text-muted-foreground">No active alerts at this time.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;