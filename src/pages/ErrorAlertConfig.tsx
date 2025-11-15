import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface AlertConfig {
  id: string;
  alert_name: string;
  is_enabled: boolean;
  error_types: string[];
  threshold_count: number;
  threshold_minutes: number;
  severity_level: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
  last_triggered_at?: string;
}

const ERROR_TYPE_OPTIONS = ['404', 'auth_error', 'api_error', 'unhandled_error', 'network_error'];

const ErrorAlertConfig = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [configs, setConfigs] = useState<AlertConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AlertConfig | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    alert_name: '',
    error_types: [] as string[],
    threshold_count: 10,
    threshold_minutes: 60,
    severity_level: 'error',
    email_enabled: true,
    in_app_enabled: true,
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('error_alert_configs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Failed to fetch alert configs:', error);
      toast.error('Failed to load alert configurations');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      alert_name: '',
      error_types: [],
      threshold_count: 10,
      threshold_minutes: 60,
      severity_level: 'error',
      email_enabled: true,
      in_app_enabled: true,
    });
    setEditingConfig(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    if (formData.error_types.length === 0) {
      toast.error('Please select at least one error type');
      return;
    }

    try {
      if (editingConfig) {
        // Update existing config
        const { error } = await supabase
          .from('error_alert_configs')
          .update({
            alert_name: formData.alert_name,
            error_types: formData.error_types,
            threshold_count: formData.threshold_count,
            threshold_minutes: formData.threshold_minutes,
            severity_level: formData.severity_level,
            email_enabled: formData.email_enabled,
            in_app_enabled: formData.in_app_enabled,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingConfig.id);

        if (error) throw error;
        toast.success('Alert configuration updated');
      } else {
        // Create new config
        const { error } = await supabase
          .from('error_alert_configs')
          .insert({
            user_id: user.id,
            ...formData,
          });

        if (error) throw error;
        toast.success('Alert configuration created');
      }

      fetchConfigs();
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Failed to save alert config:', error);
      toast.error(error.message || 'Failed to save alert configuration');
    }
  };

  const handleDelete = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this alert configuration?')) return;

    try {
      const { error } = await supabase
        .from('error_alert_configs')
        .delete()
        .eq('id', configId);

      if (error) throw error;
      toast.success('Alert configuration deleted');
      fetchConfigs();
    } catch (error) {
      console.error('Failed to delete alert config:', error);
      toast.error('Failed to delete alert configuration');
    }
  };

  const toggleEnabled = async (configId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('error_alert_configs')
        .update({ is_enabled: !currentState })
        .eq('id', configId);

      if (error) throw error;
      toast.success(`Alert ${!currentState ? 'enabled' : 'disabled'}`);
      fetchConfigs();
    } catch (error) {
      console.error('Failed to toggle alert:', error);
      toast.error('Failed to update alert configuration');
    }
  };

  const handleEdit = (config: AlertConfig) => {
    setEditingConfig(config);
    setFormData({
      alert_name: config.alert_name,
      error_types: config.error_types,
      threshold_count: config.threshold_count,
      threshold_minutes: config.threshold_minutes,
      severity_level: config.severity_level,
      email_enabled: config.email_enabled,
      in_app_enabled: config.in_app_enabled,
    });
    setDialogOpen(true);
  };

  const toggleErrorType = (errorType: string) => {
    setFormData(prev => ({
      ...prev,
      error_types: prev.error_types.includes(errorType)
        ? prev.error_types.filter(t => t !== errorType)
        : [...prev.error_types, errorType],
    }));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/errors')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Error Alert Configuration</h1>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingConfig ? 'Edit Alert Configuration' : 'Create Alert Configuration'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="alert_name">Alert Name</Label>
                  <Input
                    id="alert_name"
                    value={formData.alert_name}
                    onChange={(e) => setFormData({ ...formData, alert_name: e.target.value })}
                    placeholder="e.g., Critical API Errors"
                    required
                  />
                </div>

                <div>
                  <Label>Error Types to Monitor</Label>
                  <div className="space-y-2 mt-2">
                    {ERROR_TYPE_OPTIONS.map(errorType => (
                      <div key={errorType} className="flex items-center space-x-2">
                        <Checkbox
                          id={errorType}
                          checked={formData.error_types.includes(errorType)}
                          onCheckedChange={() => toggleErrorType(errorType)}
                        />
                        <Label htmlFor={errorType} className="font-normal cursor-pointer">
                          {errorType}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="threshold_count">Threshold Count</Label>
                    <Input
                      id="threshold_count"
                      type="number"
                      min="1"
                      value={formData.threshold_count}
                      onChange={(e) => setFormData({ ...formData, threshold_count: parseInt(e.target.value) })}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">Number of errors to trigger alert</p>
                  </div>
                  <div>
                    <Label htmlFor="threshold_minutes">Time Window (minutes)</Label>
                    <Input
                      id="threshold_minutes"
                      type="number"
                      min="1"
                      value={formData.threshold_minutes}
                      onChange={(e) => setFormData({ ...formData, threshold_minutes: parseInt(e.target.value) })}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">Within this time period</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="email_enabled">Email Notifications</Label>
                  <Switch
                    id="email_enabled"
                    checked={formData.email_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, email_enabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="in_app_enabled">In-App Notifications</Label>
                  <Switch
                    id="in_app_enabled"
                    checked={formData.in_app_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, in_app_enabled: checked })}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingConfig ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Alert Configurations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Active Alert Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Error Types</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Notifications</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : configs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No alert configurations found. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  configs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium text-foreground">{config.alert_name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {config.error_types.map(type => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {config.threshold_count} in {config.threshold_minutes}m
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {config.email_enabled && <Badge variant="secondary">Email</Badge>}
                          {config.in_app_enabled && <Badge variant="secondary">In-App</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={config.is_enabled}
                          onCheckedChange={() => toggleEnabled(config.id, config.is_enabled)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(config)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(config.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ErrorAlertConfig;
