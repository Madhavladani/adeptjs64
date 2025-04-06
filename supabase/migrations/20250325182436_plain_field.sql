/*
  # Create components table with sample data
  
  1. New Tables
    - `components`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `image_url` (text, not null)
      - `created_at` (timestamp with timezone)
  
  2. Security
    - Enable RLS on `components` table
    - Add policy for public read access
    
  3. Sample Data
    - Adds initial sample components
*/

-- Create the components table
CREATE TABLE IF NOT EXISTS components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE components ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access"
  ON components
  FOR SELECT
  TO public
  USING (true);

-- Insert sample data
INSERT INTO components (name, image_url) VALUES
  ('Button Component', 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&auto=format&fit=crop'),
  ('Card Component', 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&auto=format&fit=crop'),
  ('Modal Component', 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=800&auto=format&fit=crop');