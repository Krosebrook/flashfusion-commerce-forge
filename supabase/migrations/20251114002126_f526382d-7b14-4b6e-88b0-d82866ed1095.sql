-- Fix critical security issue: ai_usage_logs table publicly readable
-- Drop the dangerous policy that allows public access
DROP POLICY IF EXISTS "Enable read for service role" ON public.ai_usage_logs;

-- Add user-scoped policy so users can only read their own AI usage logs
CREATE POLICY "Users see own AI usage"
ON public.ai_usage_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Note: Service role can still bypass RLS when needed using service role key
-- Admin access should be implemented via has_role function if needed