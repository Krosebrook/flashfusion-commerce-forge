import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

interface ProcessAlertRequest {
  error_log_id: string;
  error_type: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error_log_id, error_type }: ProcessAlertRequest = await req.json();

    console.log(`Processing alerts for error_type: ${error_type}, log_id: ${error_log_id}`);

    // Get active alert configs that match this error type
    const { data: configs, error: configError } = await supabaseAdmin
      .from('error_alert_configs')
      .select('*')
      .contains('error_types', [error_type])
      .eq('is_enabled', true);

    if (configError) {
      console.error('Failed to fetch alert configs:', configError);
      throw configError;
    }

    console.log(`Found ${configs?.length || 0} matching alert configurations`);

    for (const config of configs || []) {
      // Check if threshold is met within the time window
      const timeWindowStart = new Date(Date.now() - config.threshold_minutes * 60000).toISOString();
      
      const { count, error: countError } = await supabaseAdmin
        .from('error_logs')
        .select('*', { count: 'exact', head: true })
        .eq('error_type', error_type)
        .gte('created_at', timeWindowStart);

      if (countError) {
        console.error('Failed to count errors:', countError);
        continue;
      }

      console.log(`Config "${config.alert_name}": ${count} errors in last ${config.threshold_minutes} minutes (threshold: ${config.threshold_count})`);

      if (count && count >= config.threshold_count) {
        // Check if alert was recently triggered (avoid spam)
        if (config.last_triggered_at) {
          const lastTriggered = new Date(config.last_triggered_at);
          const cooldownMinutes = config.threshold_minutes;
          const cooldownEnd = new Date(lastTriggered.getTime() + cooldownMinutes * 60000);
          
          if (new Date() < cooldownEnd) {
            console.log(`Config "${config.alert_name}" is in cooldown period`);
            continue;
          }
        }

        // Create in-app notification if enabled
        if (config.in_app_enabled) {
          const { error: notifError } = await supabaseAdmin
            .from('error_notifications')
            .insert({
              user_id: config.user_id,
              alert_config_id: config.id,
              error_log_id,
              title: `⚠️ ${config.alert_name}`,
              message: `${count} ${error_type} errors detected in the last ${config.threshold_minutes} minutes`,
              severity: config.severity_level,
            });

          if (notifError) {
            console.error('Failed to create notification:', notifError);
          } else {
            console.log(`Created notification for config "${config.alert_name}"`);
          }
        }

        // Send email notification if enabled
        if (config.email_enabled) {
          try {
            // Get user email
            const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
              config.user_id
            );

            if (userError || !userData?.user?.email) {
              console.error('Failed to get user email:', userError);
            } else {
              const { error: emailError } = await resend.emails.send({
                from: 'FlashFusion Alerts <alerts@resend.dev>',
                to: [userData.user.email],
                subject: `⚠️ ${config.alert_name} - Error Alert Triggered`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">Error Alert Triggered</h2>
                    <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0;">
                      <h3 style="margin-top: 0;">${config.alert_name}</h3>
                      <p style="font-size: 16px; margin: 8px 0;">
                        <strong>${count}</strong> <code>${error_type}</code> errors detected in the last 
                        <strong>${config.threshold_minutes}</strong> minutes
                      </p>
                    </div>
                    <div style="margin: 20px 0;">
                      <p><strong>Alert Configuration:</strong></p>
                      <ul>
                        <li>Threshold: ${config.threshold_count} errors in ${config.threshold_minutes} minutes</li>
                        <li>Error Types Monitored: ${config.error_types.join(', ')}</li>
                        <li>Severity: ${config.severity_level}</li>
                      </ul>
                    </div>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                      <p style="color: #6b7280; font-size: 14px;">
                        View the full error dashboard to see details and take action.
                      </p>
                      <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                        This is an automated alert from your FlashFusion error monitoring system.
                      </p>
                    </div>
                  </div>
                `,
              });

              if (emailError) {
                console.error('Failed to send email:', emailError);
              } else {
                console.log(`Email sent to ${userData.user.email} for config "${config.alert_name}"`);
              }
            }
          } catch (emailErr) {
            console.error('Error sending email notification:', emailErr);
          }
        }

        // Update last triggered timestamp
        const { error: updateError } = await supabaseAdmin
          .from('error_alert_configs')
          .update({ 
            last_triggered_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', config.id);

        if (updateError) {
          console.error('Failed to update last_triggered_at:', updateError);
        } else {
          console.log(`Updated last_triggered_at for config "${config.alert_name}"`);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed_configs: configs?.length || 0 }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in process-error-alerts function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
