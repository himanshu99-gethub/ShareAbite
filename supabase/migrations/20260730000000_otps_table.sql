-- Migration to create otps table for Gmail SMTP Email OTP Authentication
create table if not exists public.otps (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  otp varchar(6) not null,
  expires_at timestamptz not null,
  is_used boolean not null default false,
  attempts_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Index for fast lookup by email and creation order
create index if not exists idx_otps_email_created on public.otps(email, created_at desc);

-- Enable RLS
alter table public.otps enable row level security;

-- Policy allowing system operations (service role bypasses RLS)
create policy "Allow service role full access to otps"
  on public.otps for all
  using (true)
  with check (true);
