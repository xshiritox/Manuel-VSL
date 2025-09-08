/*
  # Add foreign key relationship between appointments and profiles

  1. Database Changes
    - Add foreign key constraint linking appointments.user_id to profiles.id
    - This enables Supabase to resolve the relationship for joined queries

  2. Security
    - No RLS changes needed as tables already have proper policies
*/

-- Add foreign key constraint between appointments and profiles
ALTER TABLE appointments 
ADD CONSTRAINT fk_appointments_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;