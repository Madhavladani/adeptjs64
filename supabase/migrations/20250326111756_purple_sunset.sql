/*
  # Fix admin user creation
  
  1. Changes
    - Create admin user using auth.admin functions
    - Add user to admin_users table
  
  2. Security
    - Maintain existing RLS policies
*/

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- First clean up existing user if exists
  DELETE FROM admin_users WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'madhav_1040@yahoo.com'
  );

  -- Create new admin user using auth functions
  SELECT id INTO new_user_id FROM auth.users WHERE email = 'madhav_1040@yahoo.com';
  
  IF new_user_id IS NULL THEN
    -- Create new user if doesn't exist
    WITH new_user AS (
      SELECT id FROM auth.users 
      WHERE email = 'madhav_1040@yahoo.com'
      FOR UPDATE
    )
    INSERT INTO auth.users (
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_sent_at,
      is_sso_user,
      role
    )
    VALUES (
      'madhav_1040@yahoo.com',
      crypt('Madhav1040@', gen_salt('bf')),
      now(),
      now(),
      FALSE,
      'authenticated'
    )
    RETURNING id INTO new_user_id;
  ELSE
    -- Update password if user exists
    UPDATE auth.users 
    SET encrypted_password = crypt('Madhav1040@', gen_salt('bf'))
    WHERE id = new_user_id;
  END IF;

  -- Add to admin_users table
  INSERT INTO admin_users (user_id)
  VALUES (new_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END $$;