/*
  # Fix admin user creation
  
  1. Changes
    - Drop and recreate admin_users table with proper constraints
    - Create new admin user with proper error handling
    - Add proper indexes and foreign key constraints
  
  2. Security
    - Maintain existing RLS policies
    - Ensure proper password hashing
*/

-- First, drop existing admin_users table and recreate it with proper constraints
DROP TABLE IF EXISTS admin_users;

CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_user
    FOREIGN KEY(user_id) 
    REFERENCES auth.users(id)
    ON DELETE CASCADE,
  CONSTRAINT unique_user_id UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
CREATE POLICY "Users can read own admin data"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own admin data"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own admin data"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own admin data"
  ON admin_users
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create admin user with proper error handling
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert into auth.users
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
  )
  ON CONFLICT (email) DO UPDATE
  SET encrypted_password = crypt('Madhav1040@', gen_salt('bf', 10))
  RETURNING id INTO new_user_id;

  -- Insert into admin_users
  INSERT INTO admin_users (user_id)
  VALUES (new_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END $$;