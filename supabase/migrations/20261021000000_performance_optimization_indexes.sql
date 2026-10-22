-- ==============================================================================
-- Performance Optimization Indexes Migration
-- Target Tables: donations, pickup_requests, profiles
-- Purpose: Accelerate status filtering, foreign key joins, sorting, and user lookups
-- Safety: Non-destructive, uses IF NOT EXISTS, preserves all RLS policies
-- ==============================================================================

-- 1. Index for active donation feed sorted by creation time
-- Used by: LiveMapSection, ReceiverDashboard, useDonations
CREATE INDEX IF NOT EXISTS idx_donations_status_created_at 
  ON public.donations (status, created_at DESC);

-- 2. Index for donor's own donations
-- Used by: DonorDashboard (filtering by donor_id)
CREATE INDEX IF NOT EXISTS idx_donations_donor_id_created_at 
  ON public.donations (donor_id, created_at DESC);

-- 3. Index for pickup requests by receiver
-- Used by: ReceiverDashboard (filtering by receiver_id)
-- Note: The existing unique constraint has donation_id as the leading column,
-- so a standalone receiver_id index is required for efficient lookups.
CREATE INDEX IF NOT EXISTS idx_pickup_requests_receiver_id_created_at 
  ON public.pickup_requests (receiver_id, created_at DESC);

-- 4. Index for pickup requests on a donation by status
-- Used by: DonorDashboard when accepting or rejecting pending requests
CREATE INDEX IF NOT EXISTS idx_pickup_requests_donation_status 
  ON public.pickup_requests (donation_id, status);

-- 5. Index for profiles by role (donor / receiver)
-- Used by: StatsBar, ImpactDashboard, LiveMapSection, Login count queries
CREATE INDEX IF NOT EXISTS idx_profiles_role 
  ON public.profiles (role);

-- 6. Index for profiles by email
-- Used by: useProfile, app.tsx account merge, auth verification
CREATE INDEX IF NOT EXISTS idx_profiles_email 
  ON public.profiles (email);
