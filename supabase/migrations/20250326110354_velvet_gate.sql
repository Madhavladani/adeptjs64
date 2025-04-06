/*
  # Fix admin user authentication
  
  1. Changes
    - Delete existing admin user
    - Create new admin user with proper password hashing
    - Add admin user to admin_users table
  
  2. Security
    - Uses proper Supabase auth password hashing
    - Maintains existing RLS policies
*/

-- First, clean up any existing admin user
DELETE FROM admin_users WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'admin@example.com'
);

DELETE FROM auth.users WHERE email = 'admin@example.com';

-- Create admin user with proper password hashing
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('admin123', gen_salt('bf', 10)),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING
RETURNING id;

-- Add the user to admin_users table
INSERT INTO admin_users (user_id)
SELECT id FROM auth.users WHERE email = 'admin@example.com'
ON CONFLICT (user_id) DO NOTHING;