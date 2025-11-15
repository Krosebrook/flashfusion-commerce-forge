import { supabase } from "@/integrations/supabase/client";

interface LogErrorParams {
  errorType: '404' | 'auth_error' | 'api_error' | 'unhandled_error' | 'network_error';
  errorCode?: string;
  path: string;
  message?: string;
  metadata?: Record<string, any>;
}

/**
 * Logs errors to the server-side error tracking system
 * Only sends minimal information, never exposes sensitive data
 */
export const logError = async ({
  errorType,
  errorCode,
  path,
  message,
  metadata = {}
}: LogErrorParams): Promise<void> => {
  try {
    // Don't await - fire and forget to avoid blocking UX
    supabase.functions.invoke('log-error', {
      body: {
        error_type: errorType,
        error_code: errorCode,
        path,
        message,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          screen_resolution: `${window.screen.width}x${window.screen.height}`,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
        }
      }
    }).catch(err => {
      // Silently fail - we don't want error logging to break the app
      if (import.meta.env.DEV) {
        console.error('Failed to log error:', err);
      }
    });
  } catch (error) {
    // Silently fail in production, log in development
    if (import.meta.env.DEV) {
      console.error('Error logger failed:', error);
    }
  }
};
