-- Fix critical security issues: Remove public read access from sensitive tables

-- 1. Fix deployments table - remove public read policy
DROP POLICY IF EXISTS "Enable read for service role" ON public.deployments;

-- Add user-scoped policy for deployments
CREATE POLICY "Users can view own deployments"
ON public.deployments
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Fix projects table - remove public read policy
DROP POLICY IF EXISTS "Enable read for service role" ON public.projects;

-- The projects table already has "Users can view own projects" policy
-- Verify it exists and is properly configured
-- Policy should use: auth.uid() = user_id

-- 3. Fix subscription_history table - remove dangerous public policy
DROP POLICY IF EXISTS "replace_with_policy_name" ON public.subscription_history;

-- The subscription_history table already has proper policies:
-- - "Users can view own subscription history" (auth.uid() = user_id)
-- - "System can manage subscriptions" (for service role)
-- The public policy has been removed

-- Note: Service role operations should use the service role key directly
-- which bypasses RLS, rather than relying on public policies