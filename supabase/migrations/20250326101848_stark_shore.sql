/*
  # Enhance categories and subcategories tables
  
  1. Changes
    - Add new columns to categories table:
      - description (text)
      - svg_logo (text)
      - image_url (text)
    
    - Add new columns to subcategories table:
      - description (text)
      - svg_logo (text)
      - image_url (text)
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS svg_logo text,
ADD COLUMN IF NOT EXISTS image_url text;

-- Add new columns to subcategories table
ALTER TABLE subcategories 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS svg_logo text,
ADD COLUMN IF NOT EXISTS image_url text;