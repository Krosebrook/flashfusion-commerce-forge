-- Create error_logs table for server-side error tracking
CREATE TABLE public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type TEXT NOT NULL,
  error_code TEXT,
  path TEXT NOT NULL,
  message TEXT,
  stack_trace TEXT,
  user_agent TEXT,
  ip_address INET,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX idx_error_logs_error_type ON public.error_logs(error_type);

-- Enable Row Level Security
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Service role can insert errors (from Edge Function)
CREATE POLICY "Service role can insert errors"
ON public.error_logs
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Users can view only their own errors
CREATE POLICY "Users can view own errors"
ON public.error_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all errors
CREATE POLICY "Admins can view all errors"
ON public.error_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));