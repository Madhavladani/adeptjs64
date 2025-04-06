/*
  # Fix categories and subcategories tables
  
  1. Tables
    - Drop existing tables if they exist
    - Recreate tables with proper relationships
    - Add RLS policies
  
  2. Security
    - Enable RLS
    - Add policies for public read access
    - Add policies for authenticated users to modify data
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS subcategories;
DROP TABLE IF EXISTS categories;

-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create subcategories table with proper foreign key
CREATE TABLE subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Enable read access for all users" ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" ON categories
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for subcategories
CREATE POLICY "Enable read access for all users" ON subcategories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON subcategories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON subcategories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" ON subcategories
  FOR DELETE
  TO authenticated
  USING (true);

-- Add some sample data
INSERT INTO categories (name) VALUES
  ('UI Components'),
  ('Layouts'),
  ('Forms');

INSERT INTO subcategories (name, category_id) 
SELECT 'Buttons', id FROM categories WHERE name = 'UI Components'
UNION ALL
SELECT 'Cards', id FROM categories WHERE name = 'UI Components'
UNION ALL
SELECT 'Responsive', id FROM categories WHERE name = 'Layouts';