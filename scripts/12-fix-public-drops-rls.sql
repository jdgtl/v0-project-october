-- Fix RLS policies to allow viewing transactions in public drops
-- This allows users to see transaction details when viewing public drops from other users

-- Add policy to allow viewing transactions that are part of public drops
CREATE POLICY "Anyone can view transactions in public drops"
  ON public.transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.drops
      WHERE drops.transaction_id = transactions.id
      AND drops.is_public = true
    )
  );

-- Add policy to allow viewing transaction photos that are part of public drops
CREATE POLICY "Anyone can view photos in public drops"
  ON public.transaction_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.drops
      WHERE drops.transaction_id = transaction_photos.transaction_id
      AND drops.is_public = true
    )
  );
