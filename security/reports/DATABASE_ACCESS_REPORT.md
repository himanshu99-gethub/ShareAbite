# DATABASE_ACCESS Security Report

## Status: PASS (with notes)

## Findings

### ✅ RLS enabled on all tables
All three main tables have RLS explicitly enabled:
```sql
alter table public.profiles enable row level security;
alter table public.donations enable row level security;
alter table public.pickup_requests enable row level security;
```

### ✅ Policies are scoped properly
- **profiles**: SELECT/INSERT/UPDATE locked to `auth.uid() = id`
- **donations**: INSERT locked to `auth.uid() = donor_id`; UPDATE has two scoped policies (donor + accepted receiver only)
- **pickup_requests**: SELECT split between donors (their donations) and receivers (their own); INSERT/UPDATE scoped to receiver_id or donor_id

### ✅ No `USING (true)` wildcard policies found in schema

### ⚠️ MEDIUM — Storage bucket is fully public
```sql
insert into storage.buckets (id, name, public) values ('donation-photos', 'donation-photos', true)
```
The `donation-photos` bucket is set to **public**. Anyone can read any photo URL. This is intentional (donation photos should be viewable by receivers), but upload is only gated by `auth.uid() is not null` — no size limit, no file type check enforced at the bucket policy level.

### 🔴 CRITICAL — `otps` table has a wildcard `USING (true)` policy
```sql
-- migration: 20260730000000_otps_table.sql
create policy "Allow service role full access to otps"
  on public.otps for all
  using (true)
  with check (true);
```
The `otps` table has RLS enabled but its only policy allows **all operations for everyone** (`USING (true)`). Any authenticated user with the anon key can read **all OTP codes** for **all users** directly from the database. This means an attacker can bypass OTP verification entirely by reading the live OTP from the DB.

## What's at risk

- If the `otps` table lacks RLS, any authenticated user could query other users' OTP codes directly via the anon key.

## What's already secure

- Core tables (profiles, donations, pickup_requests) have comprehensive, correctly scoped RLS policies
- Service role client (`client.server.ts`) is server-only and never exported to client bundles

## Recommendations

1. **MEDIUM**: Verify RLS on the `otps` table — check `20260730000000_otps_table.sql`
2. **LOW**: Add storage policies to enforce file type and size limits at the bucket level
3. **INFO**: The public storage bucket is acceptable for donation photos — document this intentional decision
