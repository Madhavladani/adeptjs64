/*
  # Create new admin user
  
  1. Changes
    - Create new admin user with specified credentials
    - Add user to admin_users table
  
  2. Security
    - Uses proper password hashing
    - Maintains existing RLS policies
*/

-- First, clean up if the user already exists
DELETE FROM admin_users WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'madhav_1040@yahoo.com'
);

DELETE FROM auth.users WHERE email = 'madhav_1040@yahoo.com';

-- Create new admin user with proper password hashing
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
  'madhav_1040@yahoo.com',
  crypt('Madhav1040@', gen_salt('bf', 10)),
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
SELECT id FROM auth.users WHERE email = 'madhav_1040@yahoo.com'
ON CONFLICT (user_id) DO NOTHING;