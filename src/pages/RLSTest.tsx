import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle, XCircle, Key, User, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface KVItem {
  key: string;
  value: any;
  user_id?: string;
  tenant_id?: string;
}

const RLSTest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myData, setMyData] = useState<KVItem[]>([]);
  const [testKey, setTestKey] = useState("");
  const [testValue, setTestValue] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchMyData = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('kv_store_e259a3bb')
      .select('*');
    
    if (error) {
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setMyData(data || []);
    }
  };

  const insertTestData = async (withTenant = false) => {
    if (!user || !testKey || !testValue) {
      toast({
        title: "Missing data",
        description: "Please enter both key and value",
        variant: "destructive"
      });
      return;
    }

    if (withTenant && !tenantId) {
      toast({
        title: "Missing tenant ID",
        description: "Please enter a tenant ID for tenant-scoped data",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const insertData: any = {
      key: testKey,
      value: { data: testValue },
      user_id: user.id
    };

    if (withTenant) {
      insertData.tenant_id = tenantId;
    }

    const { error } = await supabase
      .from('kv_store_e259a3bb')
      .insert(insertData);

    if (error) {
      toast({
        title: "Error inserting data",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: withTenant 
          ? `Tenant-scoped data inserted (tenant: ${tenantId})` 
          : "User-scoped data inserted successfully"
      });
      setTestKey("");
      setTestValue("");
      if (withTenant) setTenantId("");
      fetchMyData();
    }
    setLoading(false);
  };

  const deleteTestData = async (key: string) => {
    const { error } = await supabase
      .from('kv_store_e259a3bb')
      .delete()
      .eq('key', key);

    if (error) {
      toast({
        title: "Error deleting data",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Data deleted successfully"
      });
      fetchMyData();
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyData();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              RLS Policy Test
            </CardTitle>
            <CardDescription>
              Please log in to test Row-Level Security policies
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">RLS Policy Test</h1>
            <p className="text-muted-foreground">Testing kv_store_e259a3bb table access control</p>
          </div>
        </div>

        {/* Current User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Current User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-mono">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID:</span>
                <span className="font-mono text-xs">{user.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RLS Policy Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              RLS Policy Status
            </CardTitle>
            <CardDescription>
              Active policies on kv_store_e259a3bb table
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">User-scoped policies</p>
                  <p className="text-sm text-muted-foreground">
                    read_own, insert_own, update_own, delete_own
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Tenant-scoped policies</p>
                  <p className="text-sm text-muted-foreground">
                    tenant_read, tenant_write, tenant_update, tenant_delete
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium">Removed insecure policy</p>
                  <p className="text-sm text-muted-foreground">
                    public_read (allowed unrestricted access to all data)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insert Test Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Insert Test Data
            </CardTitle>
            <CardDescription>
              Test user-scoped and tenant-scoped data isolation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="user" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="user" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  User-Scoped
                </TabsTrigger>
                <TabsTrigger value="tenant" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Tenant-Scoped
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="user" className="space-y-4 mt-4">
                <div className="bg-muted/50 p-3 rounded-lg text-sm">
                  <p className="font-medium mb-1">User-Scoped Testing</p>
                  <p className="text-muted-foreground">
                    Data will be associated with your user ID. Only you can access it.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Key</label>
                    <Input
                      placeholder="e.g., user-config-1"
                      value={testKey}
                      onChange={(e) => setTestKey(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Value</label>
                    <Input
                      placeholder="e.g., my-data"
                      value={testValue}
                      onChange={(e) => setTestValue(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={() => insertTestData(false)} disabled={loading} className="w-full">
                  Insert User-Scoped Record
                </Button>
              </TabsContent>

              <TabsContent value="tenant" className="space-y-4 mt-4">
                <div className="bg-muted/50 p-3 rounded-lg text-sm">
                  <p className="font-medium mb-1">Tenant-Scoped Testing</p>
                  <p className="text-muted-foreground">
                    Simulate multi-tenant data. Records with the same tenant_id are isolated together.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tenant ID (UUID)</label>
                    <Input
                      placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
                      value={tenantId}
                      onChange={(e) => setTenantId(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use the same tenant ID for related records
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Key</label>
                      <Input
                        placeholder="e.g., tenant-config-1"
                        value={testKey}
                        onChange={(e) => setTestKey(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Value</label>
                      <Input
                        placeholder="e.g., tenant-data"
                        value={testValue}
                        onChange={(e) => setTestValue(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={() => insertTestData(true)} disabled={loading} className="w-full">
                  Insert Tenant-Scoped Record
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* My Data */}
        <Card>
          <CardHeader>
            <CardTitle>Your Accessible Data</CardTitle>
            <CardDescription>
              Records you can see (should only be your own)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {myData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No data yet. Insert some test records above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myData.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.key}</span>
                        {item.user_id === user.id && (
                          <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded">
                            Your record
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Value: {JSON.stringify(item.value)}
                      </p>
                      <div className="flex gap-4 text-xs text-muted-foreground font-mono">
                        <span>User: {item.user_id?.substring(0, 8)}...</span>
                        {item.tenant_id && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            Tenant: {item.tenant_id.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteTestData(item.key)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Instructions */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>How to Test RLS Isolation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                User-Scoped Testing
              </h4>
              <div className="space-y-2 text-sm pl-6">
                <div className="flex gap-2">
                  <span className="font-bold">1.</span>
                  <span>Insert user-scoped data (no tenant ID)</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold">2.</span>
                  <span>Open incognito and create a second user</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold">3.</span>
                  <span>Verify the second user can't see the first user's data ✓</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Tenant-Scoped Testing
              </h4>
              <div className="space-y-2 text-sm pl-6">
                <div className="flex gap-2">
                  <span className="font-bold">1.</span>
                  <span>Insert records with tenant ID: <code className="bg-muted px-1 rounded">tenant-A-uuid</code></span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold">2.</span>
                  <span>Insert more records with tenant ID: <code className="bg-muted px-1 rounded">tenant-B-uuid</code></span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold">3.</span>
                  <span>Notice: Both tenants' data is visible (tenant policies require JWT tenant_id)</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold">4.</span>
                  <span className="text-muted-foreground italic">
                    In production, tenant_id comes from JWT and enforces isolation automatically
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
              <p className="text-sm">
                <span className="font-semibold">💡 Note:</span> Tenant policies use{" "}
                <code className="bg-muted px-1 rounded">current_tenant()</code> which reads from the JWT.
                Without a tenant_id in your JWT, tenant policies won't filter data in this test environment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RLSTest;
