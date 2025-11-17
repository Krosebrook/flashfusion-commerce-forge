import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Mail, PlayCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const SecurityAuditScheduler = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const runManualAudit = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('scheduled-security-audit', {
        body: { manual_trigger: true }
      });

      if (error) throw error;

      toast({
        title: "Audit completed",
        description: `Security audit report sent to ${data.admins_notified} admin(s)`,
      });
    } catch (error: any) {
      console.error("Error running manual audit:", error);
      toast({
        title: "Audit failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Scheduled Security Audits
        </CardTitle>
        <CardDescription>
          Automated RLS policy audits with email reports to admins
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Schedule Status */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Schedule:</span>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
              Weekly
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Frequency:</span>
              <p className="font-medium">Every Sunday at 9:00 AM UTC</p>
            </div>
            <div>
              <span className="text-muted-foreground">Recipients:</span>
              <p className="font-medium">All admin users</p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <span className="text-xs text-muted-foreground">Next scheduled run:</span>
            <p className="text-sm font-medium mt-1">
              {(() => {
                const now = new Date();
                const nextSunday = new Date(now);
                nextSunday.setDate(now.getDate() + (7 - now.getDay()));
                nextSunday.setHours(9, 0, 0, 0);
                return nextSunday.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'UTC',
                  timeZoneName: 'short'
                });
              })()}
            </p>
          </div>
        </div>

        {/* Report Contents */}
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Report Contents
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1.5 pl-6">
            <li className="list-disc">Active RLS policies status (user & tenant scoped)</li>
            <li className="list-disc">Data access summary and record counts</li>
            <li className="list-disc">Security compliance checklist</li>
            <li className="list-disc">Recommendations for improvements</li>
            <li className="list-disc">Removed insecure policies verification</li>
          </ul>
        </div>

        {/* Setup Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs space-y-2">
            <p className="font-semibold">Setup Required:</p>
            <p>
              To enable scheduled audits, you need to set up a cron job in your Supabase database.
              Run the following SQL in the Supabase SQL Editor:
            </p>
            <div className="bg-muted p-3 rounded mt-2 font-mono text-xs overflow-x-auto">
              <pre>{`-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule weekly security audit (Sundays at 9 AM UTC)
SELECT cron.schedule(
  'weekly-security-audit',
  '0 9 * * 0',
  $$
  SELECT net.http_post(
    url:='https://gcqfqzhgludrzkfajljp.supabase.co/functions/v1/scheduled-security-audit',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjcWZxemhnbHVkcnprZmFqbGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MjQ1OTAsImV4cCI6MjA2OTAwMDU5MH0.N2F1BZq7ZJig-GSdr2Kv_WkHtWHI5bVS4JaKkc1u-Sk"}'::jsonb,
    body:='{"scheduled": true}'::jsonb
  ) as request_id;
  $$
);`}</pre>
            </div>
          </AlertDescription>
        </Alert>

        {/* Manual Trigger */}
        <div className="pt-4 border-t">
          <Button 
            onClick={runManualAudit} 
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            {loading ? "Running Audit..." : "Run Manual Audit Now"}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Manually trigger a security audit and send reports to all admins
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
