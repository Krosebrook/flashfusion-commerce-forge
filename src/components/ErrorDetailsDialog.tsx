import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

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

interface ErrorDetailsDialogProps {
  error: ErrorLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ErrorDetailsDialog = ({ error, open, onOpenChange }: ErrorDetailsDialogProps) => {
  if (!error) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const metadata = error.metadata || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Error Details
            <Badge variant={error.error_type === '404' ? 'secondary' : 'destructive'}>
              {error.error_type}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Error Code:</span>
                <span className="ml-2 text-foreground">{error.error_code || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Time:</span>
                <span className="ml-2 text-foreground">
                  {format(new Date(error.created_at), 'PPpp')}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Path:</span>
                <span className="ml-2 text-foreground font-mono text-xs">{error.path}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-2 h-6 px-2"
                  onClick={() => copyToClipboard(error.path, 'Path')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Message */}
          {error.message && (
            <>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Error Message</h3>
                <div className="bg-muted p-3 rounded-md text-sm font-mono text-foreground">
                  {error.message}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Stack Trace */}
          {error.stack_trace && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Stack Trace</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(error.stack_trace!, 'Stack trace')}
                  >
                    <Copy className="h-3 w-3 mr-2" />
                    Copy
                  </Button>
                </div>
                <pre className="bg-muted p-3 rounded-md text-xs font-mono overflow-x-auto text-foreground">
                  {error.stack_trace}
                </pre>
              </div>
              <Separator />
            </>
          )}

          {/* Client Information */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Client Information</h3>
            <div className="space-y-1 text-sm">
              {error.user_agent && (
                <div>
                  <span className="text-muted-foreground">User Agent:</span>
                  <p className="text-xs font-mono text-foreground mt-1">{error.user_agent}</p>
                </div>
              )}
              {error.ip_address && (
                <div>
                  <span className="text-muted-foreground">IP Address:</span>
                  <span className="ml-2 text-foreground">{String(error.ip_address)}</span>
                </div>
              )}
              {metadata.screen_resolution && (
                <div>
                  <span className="text-muted-foreground">Screen Resolution:</span>
                  <span className="ml-2 text-foreground">{metadata.screen_resolution}</span>
                </div>
              )}
              {metadata.viewport && (
                <div>
                  <span className="text-muted-foreground">Viewport:</span>
                  <span className="ml-2 text-foreground">{metadata.viewport}</span>
                </div>
              )}
            </div>
          </div>

          {/* User Link */}
          {error.user_id && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">User Information</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">User ID:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded text-foreground">
                    {error.user_id}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(error.user_id!, 'User ID')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Additional Metadata */}
          {metadata.referrer && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Additional Context</h3>
                <div>
                  <span className="text-sm text-muted-foreground">Referrer:</span>
                  <p className="text-xs font-mono text-foreground mt-1">{metadata.referrer}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
