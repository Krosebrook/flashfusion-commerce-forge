-- Enable Row-Level Security on kv_store_e259a3bb
-- This table has 13 policies defined but RLS was not enabled, causing complete access control bypass

ALTER TABLE public.kv_store_e259a3bb ENABLE ROW LEVEL SECURITY;