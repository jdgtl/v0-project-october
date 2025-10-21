-- Create storage buckets for transaction photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('transaction-photos', 'transaction-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for transaction photos
CREATE POLICY "Users can upload their own transaction photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'transaction-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own transaction photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'transaction-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view public transaction photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'transaction-photos');

CREATE POLICY "Users can delete their own transaction photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'transaction-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
