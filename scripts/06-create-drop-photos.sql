-- Create drop_photos junction table to link drops with specific photos
CREATE TABLE IF NOT EXISTS drop_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id UUID NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES transaction_photos(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(drop_id, photo_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_drop_photos_drop_id ON drop_photos(drop_id);
CREATE INDEX IF NOT EXISTS idx_drop_photos_photo_id ON drop_photos(photo_id);
