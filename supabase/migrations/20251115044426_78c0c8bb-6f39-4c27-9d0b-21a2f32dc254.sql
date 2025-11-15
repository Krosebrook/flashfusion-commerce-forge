-- Create error alert configurations table
CREATE TABLE public.error_alert_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Trigger conditions
  error_types TEXT[] NOT NULL,
  threshold_count INTEGER NOT NULL DEFAULT 10,
  threshold_minutes INTEGER NOT NULL DEFAULT 60,
  severity_level TEXT NOT NULL DEFAULT 'error',
  
  -- Notification channels
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadata
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, alert_name)
);

-- Create in-app notifications table
CREATE TABLE public.error_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_config_id UUID REFERENCES error_alert_configs(id) ON DELETE CASCADE,
  error_log_id UUID REFERENCES error_logs(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'error',
  is_read BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_error_alert_configs_user_id ON public.error_alert_configs(user_id);
CREATE INDEX idx_error_alert_configs_enabled ON public.error_alert_configs(is_enabled) WHERE is_enabled = true;
CREATE INDEX idx_error_notifications_user_id_read ON public.error_notifications(user_id, is_read, created_at DESC);

-- Enable RLS
ALTER TABLE public.error_alert_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for error_alert_configs
CREATE POLICY "Admins can manage alert configs"
ON public.error_alert_configs
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for error_notifications
CREATE POLICY "Admins can view all notifications"
ON public.error_notifications
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own notifications"
ON public.error_notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications"
ON public.error_notifications
FOR INSERT
WITH CHECK (auth.role() = 'service_role');