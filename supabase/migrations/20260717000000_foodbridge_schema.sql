-- FoodBridge Schema Migration
-- Tables: profiles, donations, pickup_requests
-- With Row Level Security (RLS) enabled on all tables

-- ───────────────────────────────────────────
-- 1. Drop old tables if they exist (habit tracker)
-- ───────────────────────────────────────────
drop table if exists public.habit_logs cascade;
drop table if exists public.habits cascade;

-- ───────────────────────────────────────────
-- 2. Profiles table (replaces old slim profiles)
-- ───────────────────────────────────────────
drop table if exists public.profiles cascade;

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        text check (role in ('donor', 'receiver')),
  phone       text,
  org_name    text,
  created_at  timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ───────────────────────────────────────────
-- 3. Donations table
-- ───────────────────────────────────────────
create table public.donations (
  id                   uuid primary key default gen_random_uuid(),
  donor_id             uuid not null references public.profiles(id) on delete cascade,
  food_type            text not null,
  quantity             text not null,
  description          text,
  photo_url            text,
  pickup_address       text not null,
  latitude             float8,
  longitude            float8,
  pickup_window_start  timestamptz not null,
  pickup_window_end    timestamptz not null,
  status               text not null default 'available'
                         check (status in ('available','requested','confirmed','picked_up','expired')),
  created_at           timestamptz default now() not null
);

alter table public.donations enable row level security;

-- Anyone authenticated can view available/confirmed donations
create policy "Authenticated users can view donations"
  on public.donations for select
  using (auth.uid() is not null);

-- Only the donor can insert their own donation
create policy "Donors can create donations"
  on public.donations for insert
  with check (auth.uid() = donor_id);

-- Donor can update their own donations; receivers can update status via request flow
create policy "Donors can update own donations"
  on public.donations for update
  using (auth.uid() = donor_id);

-- Allow receivers to update donation status (for marking picked_up)
create policy "Receivers can update donation status"
  on public.donations for update
  using (
    auth.uid() in (
      select receiver_id from public.pickup_requests
      where donation_id = donations.id and status = 'accepted'
    )
  );

-- ───────────────────────────────────────────
-- 4. Pickup Requests table
-- ───────────────────────────────────────────
create table public.pickup_requests (
  id           uuid primary key default gen_random_uuid(),
  donation_id  uuid not null references public.donations(id) on delete cascade,
  receiver_id  uuid not null references public.profiles(id) on delete cascade,
  status       text not null default 'pending'
                 check (status in ('pending', 'accepted', 'rejected')),
  created_at   timestamptz default now() not null,
  unique (donation_id, receiver_id)
);

alter table public.pickup_requests enable row level security;

-- Donors can see requests on their donations
create policy "Donors can view requests on their donations"
  on public.pickup_requests for select
  using (
    auth.uid() in (
      select donor_id from public.donations where id = donation_id
    )
  );

-- Receivers can see their own requests
create policy "Receivers can view own requests"
  on public.pickup_requests for select
  using (auth.uid() = receiver_id);

-- Receivers can create requests
create policy "Receivers can create pickup requests"
  on public.pickup_requests for insert
  with check (auth.uid() = receiver_id);

-- Donors can update request status (accept/reject)
create policy "Donors can update request status"
  on public.pickup_requests for update
  using (
    auth.uid() in (
      select donor_id from public.donations where id = donation_id
    )
  );

-- ───────────────────────────────────────────
-- 5. Realtime subscriptions — enable for all three tables
-- ───────────────────────────────────────────
alter publication supabase_realtime add table public.donations;
alter publication supabase_realtime add table public.pickup_requests;
alter publication supabase_realtime add table public.profiles;

-- ───────────────────────────────────────────
-- 6. Storage bucket for donation photos
-- ───────────────────────────────────────────
insert into storage.buckets (id, name, public)
  values ('donation-photos', 'donation-photos', true)
  on conflict (id) do nothing;

create policy "Anyone can view donation photos"
  on storage.objects for select
  using (bucket_id = 'donation-photos');

create policy "Authenticated users can upload donation photos"
  on storage.objects for insert
  with check (bucket_id = 'donation-photos' and auth.uid() is not null);

create policy "Users can delete own donation photos"
  on storage.objects for delete
  using (bucket_id = 'donation-photos' and auth.uid()::text = (storage.foldername(name))[1]);
