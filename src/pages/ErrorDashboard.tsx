import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, Download, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { ErrorDetailsDialog } from "@/components/ErrorDetailsDialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Pie, PieChart, Cell } from "recharts";

interface ErrorLog {
  id: string;
  error_type: string;
  error_code?: string | null;
  path: string;
  message?: string | null;
  stack_trace?: string | null;
  user_agent?: string | null;
  ip_address?: unknown;
  metadata?: any;
  created_at: string;
  user_id?: string | null;
}

const ERROR_TYPES = ['all', '404', 'auth_error', 'api_error', 'unhandled_error', 'network_error'];
const CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const ErrorDashboard = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Filters
  const [errorTypeFilter, setErrorTypeFilter] = useState('all');
  const [pathFilter, setPathFilter] = useState('');
  const [dateRange, setDateRange] = useState('7d');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    critical: 0,
    warnings: 0,
  });

  useEffect(() => {
    fetchErrors();
  }, [errorTypeFilter, dateRange]);

  const fetchErrors = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply filters
      if (errorTypeFilter !== 'all') {
        query = query.eq('error_type', errorTypeFilter);
      }

      // Date range filter
      const now = new Date();
      let startDate = new Date();
      if (dateRange === '24h') {
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      } else if (dateRange === '7d') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (dateRange === '30d') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      query = query.gte('created_at', startDate.toISOString());

      const { data, error } = await query;

      if (error) throw error;

      setErrors(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Failed to fetch errors:', error);
      toast.error('Failed to load error logs');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (errorData: ErrorLog[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    setStats({
      total: errorData.length,
      today: errorData.filter(e => new Date(e.created_at) >= today).length,
      critical: errorData.filter(e => ['unhandled_error', 'api_error'].includes(e.error_type)).length,
      warnings: errorData.filter(e => ['404', 'network_error'].includes(e.error_type)).length,
    });
  };

  const getErrorTypeDistribution = () => {
    const distribution: Record<string, number> = {};
    errors.forEach(error => {
      distribution[error.error_type] = (distribution[error.error_type] || 0) + 1;
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  const getTrendData = () => {
    const days: Record<string, number> = {};
    errors.forEach(error => {
      const day = format(new Date(error.created_at), 'MMM dd');
      days[day] = (days[day] || 0) + 1;
    });
    return Object.entries(days).map(([date, count]) => ({ date, count }));
  };

  const filteredErrors = errors.filter(error => 
    !pathFilter || error.path.toLowerCase().includes(pathFilter.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['Time', 'Type', 'Code', 'Path', 'Message', 'User ID'];
    const rows = filteredErrors.map(error => [
      format(new Date(error.created_at), 'yyyy-MM-dd HH:mm:ss'),
      error.error_type,
      error.error_code || '',
      error.path,
      error.message || '',
      error.user_id || '',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Error logs exported');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Error Dashboard</h1>
          </div>
          <div className="flex gap-2">
            {import.meta.env.DEV && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/admin/test-errors")}
                className="hover:bg-muted"
              >
                Test Errors
              </Button>
            )}
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={fetchErrors} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.today}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Warnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.warnings}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: { label: "Errors", color: "hsl(var(--chart-1))" },
                }}
                className="h-64"
              >
                <LineChart data={getTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{}}
                className="h-64"
              >
                <PieChart>
                  <Pie
                    data={getErrorTypeDistribution()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {getErrorTypeDistribution().map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Error Type</label>
                <Select value={errorTypeFilter} onValueChange={setErrorTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ERROR_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {type === 'all' ? 'All Types' : type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Last 24 hours</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Path</label>
                <Input
                  placeholder="Filter by path..."
                  value={pathFilter}
                  onChange={(e) => setPathFilter(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Error Logs ({filteredErrors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>User</TableHead>
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
                ) : filteredErrors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No errors found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredErrors.map((error) => (
                    <TableRow key={error.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(error.created_at), 'MMM dd, HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={error.error_type === '404' ? 'secondary' : 'destructive'}>
                          {error.error_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-foreground max-w-xs truncate">
                        {error.path}
                      </TableCell>
                      <TableCell className="text-sm text-foreground max-w-xs truncate">
                        {error.message || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {error.user_id ? error.user_id.substring(0, 8) + '...' : 'Anonymous'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedError(error);
                            setDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <ErrorDetailsDialog
        error={selectedError}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default ErrorDashboard;
