import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ErrorLogRequest {
  error_type: string;
  error_code?: string;
  path: string;
  message?: string;
  stack_trace?: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request data
    const { error_type, error_code, path, message, stack_trace, metadata }: ErrorLogRequest = await req.json();

    // Get user info from auth header (if available)
    const authHeader = req.headers.get('Authorization');
    let user_id = null;
    
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );
      
      const { data: { user } } = await supabaseClient.auth.getUser();
      user_id = user?.id;
    }

    // Extract client information
    const user_agent = req.headers.get('user-agent');
    const ip_address = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                       req.headers.get('x-real-ip') ||
                       'unknown';

    // Insert error log using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('error_logs')
      .insert({
        user_id,
        error_type,
        error_code,
        path,
        message,
        stack_trace: Deno.env.get('DENO_ENV') === 'production' ? null : stack_trace,
        user_agent,
        ip_address,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to log error:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Logged ${error_type} error from ${user_id || 'anonymous'} at ${path}`);

    return new Response(
      JSON.stringify({ success: true, log_id: data.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in log-error function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
