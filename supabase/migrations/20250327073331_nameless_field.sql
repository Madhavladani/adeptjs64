/*
  # Create menu order table
  
  1. New Tables
    - `menu_order`
      - `id` (uuid, primary key)
      - `item_id` (uuid, not null)
      - `item_type` (text, not null) - 'category' or 'subcategory'
      - `position` (integer, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE menu_order (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('category', 'subcategory')),
  position integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE menu_order ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON menu_order
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON menu_order
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON menu_order
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" ON menu_order
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_menu_order_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_menu_order_updated_at
  BEFORE UPDATE ON menu_order
  FOR EACH ROW
  EXECUTE FUNCTION update_menu_order_updated_at();