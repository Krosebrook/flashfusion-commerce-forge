import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logError } from "@/lib/errorLogger";
import { toast } from "sonner";

const AdminTestErrors = () => {
  const navigate = useNavigate();
  const [bulkCount, setBulkCount] = useState(5);
  const [generating, setGenerating] = useState(false);

  const generate404Error = () => {
    logError({
      errorType: '404',
      errorCode: 'TEST_NOT_FOUND',
      path: '/test/fake-path',
      message: 'Test 404 error generated from admin panel',
      metadata: {
        test: true,
        timestamp: new Date().toISOString(),
      }
    });
    toast.success('404 error logged');
  };

  const generateAuthError = () => {
    logError({
      errorType: 'auth_error',
      errorCode: 'TEST_AUTH_FAILED',
      path: '/auth',
      message: 'Test authentication error - invalid credentials',
      metadata: {
        test: true,
        reason: 'Invalid password attempt',
      }
    });
    toast.success('Auth error logged');
  };

  const generateApiError = () => {
    logError({
      errorType: 'api_error',
      errorCode: 'TEST_API_TIMEOUT',
      path: '/api/test-endpoint',
      message: 'Test API error - request timeout',
      metadata: {
        test: true,
        endpoint: '/api/test-endpoint',
        timeout_ms: 30000,
      }
    });
    toast.success('API error logged');
  };

  const generateUnhandledError = () => {
    logError({
      errorType: 'unhandled_error',
      errorCode: 'TEST_UNHANDLED',
      path: window.location.pathname,
      message: 'Test unhandled exception',
      metadata: {
        test: true,
        stack: 'Test stack trace\n  at TestComponent\n  at ErrorBoundary',
      }
    });
    toast.success('Unhandled error logged');
  };

  const generateNetworkError = () => {
    logError({
      errorType: 'network_error',
      errorCode: 'TEST_NETWORK_FAILED',
      path: '/api/external',
      message: 'Test network error - connection refused',
      metadata: {
        test: true,
        reason: 'ERR_CONNECTION_REFUSED',
      }
    });
    toast.success('Network error logged');
  };

  const generateBulkErrors = async () => {
    setGenerating(true);
    const errorTypes: Array<'404' | 'auth_error' | 'api_error' | 'unhandled_error' | 'network_error'> = 
      ['404', 'auth_error', 'api_error', 'unhandled_error', 'network_error'];
    
    for (let i = 0; i < bulkCount; i++) {
      const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
      
      logError({
        errorType,
        errorCode: `TEST_BULK_${i}`,
        path: `/test/bulk/${i}`,
        message: `Bulk test error #${i + 1}`,
        metadata: {
          test: true,
          bulk: true,
          index: i,
        }
      });
      
      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setGenerating(false);
    toast.success(`${bulkCount} test errors generated`);
  };

  const triggerRealError = () => {
    // Actually throw an error to test the error boundary
    throw new Error('Test error thrown from error test page');
  };

  if (!import.meta.env.DEV) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Production Environment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This page is only available in development mode.
            </p>
            <Button onClick={() => navigate('/admin/errors')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/errors')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Error Test Generator</h1>
              <p className="text-muted-foreground">Development only - Generate test errors for monitoring</p>
            </div>
          </div>
          <Badge variant="outline" className="text-warning border-warning">
            <AlertTriangle className="h-3 w-3 mr-1" />
            DEV ONLY
          </Badge>
        </div>

        {/* Individual Error Types */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Individual Errors</CardTitle>
            <CardDescription>
              Create single test errors of different types to verify logging and alert systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-auto flex flex-col items-start p-4"
                onClick={generate404Error}
              >
                <Badge variant="secondary" className="mb-2">404</Badge>
                <span className="font-medium text-foreground">404 Error</span>
                <span className="text-xs text-muted-foreground">Page not found error</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex flex-col items-start p-4"
                onClick={generateAuthError}
              >
                <Badge variant="destructive" className="mb-2">auth_error</Badge>
                <span className="font-medium text-foreground">Auth Error</span>
                <span className="text-xs text-muted-foreground">Authentication failure</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex flex-col items-start p-4"
                onClick={generateApiError}
              >
                <Badge variant="destructive" className="mb-2">api_error</Badge>
                <span className="font-medium text-foreground">API Error</span>
                <span className="text-xs text-muted-foreground">API request failure</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex flex-col items-start p-4"
                onClick={generateUnhandledError}
              >
                <Badge variant="destructive" className="mb-2">unhandled_error</Badge>
                <span className="font-medium text-foreground">Unhandled Error</span>
                <span className="text-xs text-muted-foreground">React error boundary trigger</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex flex-col items-start p-4"
                onClick={generateNetworkError}
              >
                <Badge variant="destructive" className="mb-2">network_error</Badge>
                <span className="font-medium text-foreground">Network Error</span>
                <span className="text-xs text-muted-foreground">Connection failure</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Error Generation */}
        <Card>
          <CardHeader>
            <CardTitle>Bulk Error Generation</CardTitle>
            <CardDescription>
              Generate multiple errors to test alert thresholds and notification systems
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Number of Errors
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)}
                  placeholder="Enter count"
                />
              </div>
              <Button
                onClick={generateBulkErrors}
                disabled={generating}
                className="min-w-[150px]"
              >
                {generating ? 'Generating...' : 'Generate Bulk Errors'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This will generate random error types to simulate high error volumes. 
              Use this to test alert threshold triggers.
            </p>
          </CardContent>
        </Card>

        {/* Critical Test */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">⚠️ Critical Error Test</CardTitle>
            <CardDescription>
              This will throw a real error to test the Error Boundary component
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={triggerRealError}
            >
              Throw Real Error (Tests Error Boundary)
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Warning: This will crash the component and trigger the error boundary. 
              You'll need to refresh the page to continue.
            </p>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• All test errors are marked with <code className="bg-muted px-1 py-0.5 rounded text-foreground">test: true</code> in metadata</p>
            <p>• Use bulk generation to test alert thresholds (default: 10 errors in 60 minutes)</p>
            <p>• Check the Error Dashboard to verify all errors are being logged correctly</p>
            <p>• Test notification bell functionality by generating errors that trigger alerts</p>
            <p>• This page is only accessible in development mode</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTestErrors;
