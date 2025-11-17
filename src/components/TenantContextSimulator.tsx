import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Building2, RefreshCw, Key, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const TenantContextSimulator = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [newTenantId, setNewTenantId] = useState("");
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);
  const [jwtClaims, setJwtClaims] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.access_token) {
      // Decode JWT to show claims
      try {
        const base64Url = session.access_token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const claims = JSON.parse(jsonPayload);
        setJwtClaims(claims);
        setCurrentTenantId(claims.tenant_id || null);
      } catch (error) {
        console.error("Failed to decode JWT:", error);
      }
    }
  }, [session]);

  const setTenantContext = async () => {
    if (!user || !newTenantId) {
      toast({
        title: "Missing tenant ID",
        description: "Please enter a valid tenant ID",
        variant: "destructive"
      });
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(newTenantId)) {
      toast({
        title: "Invalid format",
        description: "Please enter a valid UUID for tenant ID",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Update user metadata with tenant_id
      const { error } = await supabase.auth.updateUser({
        data: { tenant_id: newTenantId }
      });

      if (error) throw error;

      toast({
        title: "Tenant context updated",
        description: "Refreshing session to apply new tenant context...",
      });

      // Refresh the session to get new JWT with updated claims
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) throw refreshError;

      toast({
        title: "Success!",
        description: `Tenant context set to: ${newTenantId.substring(0, 8)}...`,
      });

      setNewTenantId("");
    } catch (error: any) {
      toast({
        title: "Error setting tenant context",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearTenantContext = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { tenant_id: null }
      });

      if (error) throw error;

      await supabase.auth.refreshSession();

      toast({
        title: "Tenant context cleared",
        description: "You are now in user-only scope",
      });
    } catch (error: any) {
      toast({
        title: "Error clearing tenant context",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSampleTenantId = () => {
    // Generate a deterministic sample UUID for testing
    const samples = [
      "11111111-1111-1111-1111-111111111111", // Tenant A
      "22222222-2222-2222-2222-222222222222", // Tenant B
      "33333333-3333-3333-3333-333333333333", // Tenant C
    ];
    const randomSample = samples[Math.floor(Math.random() * samples.length)];
    setNewTenantId(randomSample);
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Tenant Context Simulator
        </CardTitle>
        <CardDescription>
          Simulate different tenant contexts by updating your JWT claims
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Context */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Context:</span>
            {currentTenantId ? (
              <Badge variant="default" className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                Tenant Mode
              </Badge>
            ) : (
              <Badge variant="outline">User-Only Mode</Badge>
            )}
          </div>
          {currentTenantId ? (
            <div className="font-mono text-xs bg-background p-2 rounded border">
              {currentTenantId}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No tenant context set - only user-scoped policies will apply
            </p>
          )}
        </div>

        {/* Set Tenant Context */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Set Tenant Context</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter tenant UUID (e.g., 11111111-1111-1111-1111-111111111111)"
              value={newTenantId}
              onChange={(e) => setNewTenantId(e.target.value)}
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={generateSampleTenantId}
              title="Generate sample tenant ID"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={setTenantContext} 
              disabled={loading || !newTenantId}
              className="flex-1"
            >
              <Key className="h-4 w-4 mr-2" />
              Apply Tenant Context
            </Button>
            {currentTenantId && (
              <Button 
                variant="outline"
                onClick={clearTenantContext} 
                disabled={loading}
              >
                Clear Context
              </Button>
            )}
          </div>
        </div>

        {/* Sample Tenant IDs */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs space-y-2">
            <p className="font-semibold">Sample Tenant IDs for Testing:</p>
            <div className="space-y-1 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-blue-500">Tenant A:</span>
                <code className="bg-muted px-2 py-0.5 rounded">11111111-1111-1111-1111-111111111111</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">Tenant B:</span>
                <code className="bg-muted px-2 py-0.5 rounded">22222222-2222-2222-2222-222222222222</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-500">Tenant C:</span>
                <code className="bg-muted px-2 py-0.5 rounded">33333333-3333-3333-3333-333333333333</code>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* JWT Claims Display */}
        {jwtClaims && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">JWT Claims</label>
              <Badge variant="secondary" className="text-xs">
                Decoded from access_token
              </Badge>
            </div>
            <div className="bg-background border rounded-lg p-3 max-h-40 overflow-auto">
              <pre className="text-xs font-mono">
                {JSON.stringify({
                  sub: jwtClaims.sub,
                  email: jwtClaims.email,
                  tenant_id: jwtClaims.tenant_id || null,
                  role: jwtClaims.role,
                  iat: jwtClaims.iat,
                  exp: jwtClaims.exp
                }, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* How It Works */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs space-y-2">
            <p className="font-semibold">How Tenant Isolation Works:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Your tenant_id is stored in user metadata</li>
              <li>When you sign in, it's included in your JWT token</li>
              <li>The <code className="bg-muted px-1 rounded">current_tenant()</code> function reads it from JWT</li>
              <li>RLS policies use this to filter data by tenant</li>
            </ol>
            <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
              <p className="flex items-start gap-2">
                <AlertCircle className="h-3 w-3 mt-0.5 text-yellow-500" />
                <span>
                  After changing tenant context, test by inserting/querying tenant-scoped data. 
                  Only records matching your current tenant_id will be accessible.
                </span>
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Testing Steps */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm font-semibold mb-2">Testing Steps:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
            <li>Set tenant context to "Tenant A" UUID</li>
            <li>Insert tenant-scoped records (they'll use this tenant_id)</li>
            <li>Switch to "Tenant B" UUID</li>
            <li>Insert more tenant-scoped records</li>
            <li>Switch back to "Tenant A" - you should only see Tenant A's data</li>
            <li>Clear context to return to user-only mode</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
