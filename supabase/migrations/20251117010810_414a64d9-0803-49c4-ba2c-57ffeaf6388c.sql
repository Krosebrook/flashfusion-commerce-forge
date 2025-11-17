-- Clean up duplicate RLS policies on kv_store_e259a3bb
-- Remove duplicate kv_store_* prefixed policies (keeping simpler named versions)

DROP POLICY IF EXISTS kv_store_delete_own ON public.kv_store_e259a3bb;
DROP POLICY IF EXISTS kv_store_insert_own ON public.kv_store_e259a3bb;
DROP POLICY IF EXISTS kv_store_read_own ON public.kv_store_e259a3bb;
DROP POLICY IF EXISTS kv_store_update_own ON public.kv_store_e259a3bb;

-- Remove the insecure public_read policy that allows anyone to read all data
DROP POLICY IF EXISTS public_read ON public.kv_store_e259a3bb;

-- Remaining policies provide proper access control:
-- 1. User-scoped: delete_own, insert_own, read_own, update_own (user_id based)
-- 2. Tenant-scoped: tenant_delete, tenant_read, tenant_update, tenant_write (tenant_id based)