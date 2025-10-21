-- Fix RLS policies for profile-photos bucket to work with service role

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile photos" ON storage.objects;

-- Policy: Allow authenticated users to upload their own profile photos
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-photos' AND
  (
    -- Allow authenticated users to upload to their own folder
    (auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text)
    OR
    -- Allow service role to upload anywhere (for dev mode)
    auth.role() = 'service_role'
  )
);

-- Policy: Allow authenticated users to update their own profile photos
CREATE POLICY "Users can update their own profile photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-photos' AND
  (
    (auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text)
    OR
    auth.role() = 'service_role'
  )
);

-- Policy: Allow authenticated users to delete their own profile photos
CREATE POLICY "Users can delete their own profile photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-photos' AND
  (
    (auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text)
    OR
    auth.role() = 'service_role'
  )
);

-- Policy: Allow anyone to view profile photos (public bucket)
CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');
