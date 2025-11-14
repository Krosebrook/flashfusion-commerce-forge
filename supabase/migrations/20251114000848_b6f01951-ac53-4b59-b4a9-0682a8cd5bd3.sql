-- Fix critical security issue: profiles table publicly readable
-- Drop the dangerous policy that allows public access
DROP POLICY IF EXISTS "Enable read for service role" ON public.profiles;

-- Add user-scoped policy so users can only read their own profile
CREATE POLICY "Users can read own profile" 
ON public.profiles
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles
FOR UPDATE 
USING (auth.uid() = user_id);

-- Note: System/service role can still bypass RLS when needed using service role key