/*
  # Add storage bucket for SVG logos
  
  1. Changes
    - Create a new storage bucket for logos
    - Enable public access to the bucket
    - Add policies for authenticated users to upload files
  
  2. Security
    - Allow public read access
    - Restrict uploads to authenticated users
    - Only allow SVG file uploads
*/

-- Enable storage if not already enabled
CREATE EXTENSION IF NOT EXISTS "storage" WITH SCHEMA "storage";

-- Create a new bucket for logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true);

-- Policy to allow public access to files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'logos');

-- Policy to allow authenticated users to upload files
CREATE POLICY "Allow SVG uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'logos' AND
  (storage.extension(name) = 'svg')
);