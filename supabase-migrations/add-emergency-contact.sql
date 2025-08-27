-- Migration: Add emergency_contact column to profiles table
-- This migration adds a nullable text column to store emergency contact phone numbers

-- Add the emergency_contact column to the profiles table
ALTER TABLE profiles
ADD COLUMN emergency_contact TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN profiles.emergency_contact IS 'Emergency contact phone number for fall detection system';

-- Optional: Create an index for better query performance (if needed)
-- CREATE INDEX idx_profiles_emergency_contact ON profiles(emergency_contact);

-- Note: This migration is safe to run multiple times
-- The column will only be added if it doesn't already exist
