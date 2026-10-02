-- Migration to secure otps table RLS
-- Drops the old overly permissive policy that was applied to public/anon
drop policy if exists "Allow service role full access to otps" on public.otps;

-- Ensure RLS is enabled
alter table public.otps enable row level security;

-- Restrict access strictly to service_role (service role key bypasses or satisfies this policy)
-- Anonymous and authenticated frontend users have NO access to read or tamper with OTPs
create policy "Allow service role full access to otps"
  on public.otps for all
  to service_role
  using (true)
  with check (true);
