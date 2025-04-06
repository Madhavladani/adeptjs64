/*
  # Enhanced Components Table with Updated Sample Data
  
  1. New Tables
    - `components`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text, required)
      - `image_url` (text, required)
      - `is_public` (boolean, default true)
      - `is_pro` (boolean, default false)
      - `figma_code` (text)
      - `framer_code` (text)
      - `webflow_code` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Junction Tables
    - `component_categories`
      - Links components to categories
    - `component_subcategories`
      - Links components to subcategories
  
  3. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create components table with enhanced fields
CREATE TABLE IF NOT EXISTS components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  is_public boolean DEFAULT true,
  is_pro boolean DEFAULT false,
  figma_code text,
  framer_code text,
  webflow_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create junction table for categories
CREATE TABLE IF NOT EXISTS component_categories (
  component_id uuid REFERENCES components(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (component_id, category_id)
);

-- Create junction table for subcategories
CREATE TABLE IF NOT EXISTS component_subcategories (
  component_id uuid REFERENCES components(id) ON DELETE CASCADE,
  subcategory_id uuid REFERENCES subcategories(id) ON DELETE CASCADE,
  PRIMARY KEY (component_id, subcategory_id)
);

-- Enable RLS
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_subcategories ENABLE ROW LEVEL SECURITY;

-- Create policies for components
CREATE POLICY "Enable read access for all users" ON components
  FOR SELECT USING (is_public OR auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users only" ON components
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON components
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for authenticated users only" ON components
  FOR DELETE TO authenticated USING (true);

-- Create policies for junction tables
CREATE POLICY "Enable all access for authenticated users" ON component_categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users" ON component_subcategories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_components_updated_at
  BEFORE UPDATE ON components
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data with reliable image URLs
INSERT INTO components (name, description, image_url) VALUES
  ('Modern Button', 'A sleek and customizable button component', 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800'),
  ('Card Layout', 'Versatile card component with multiple variants', 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=800'),
  ('Modal Dialog', 'Accessible modal component with animations', 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800');