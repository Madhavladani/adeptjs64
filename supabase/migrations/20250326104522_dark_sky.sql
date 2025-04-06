/*
  # Add initial admin user
  
  1. Changes
    - Create initial admin user in auth.users
    - Add admin user to admin_users table
  
  2. Security
    - Use secure password hashing
    - Maintain existing RLS policies
*/

-- Create admin user in auth.users
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Insert admin user into auth.users if not exists
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    is_sso_user,
    role
  )
  VALUES (
    'admin@example.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    FALSE,
    'authenticated'
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO admin_user_id;

  -- Add user to admin_users table
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO admin_users (user_id)
    VALUES (admin_user_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;