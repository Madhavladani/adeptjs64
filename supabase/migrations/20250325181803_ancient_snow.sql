/*
  # Create components table
  
  1. New Tables
    - `components`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `image_url` (text, not null)
      - `created_at` (timestamp with timezone)
  
  2. Security
    - Enable RLS on `components` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON components
  FOR SELECT
  TO public
  USING (true);