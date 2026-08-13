-- Add contact_phone column to donations table
-- This number is shown to receivers so they can contact the donor directly

ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS contact_phone TEXT;
