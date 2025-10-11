-- Add first_name and last_name columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Migrate existing display_name data to first_name (if any exists)
-- This splits display_name on first space and puts first word in first_name, rest in last_name
UPDATE public.users
SET 
  first_name = SPLIT_PART(display_name, ' ', 1),
  last_name = CASE 
    WHEN display_name LIKE '% %' THEN SUBSTRING(display_name FROM POSITION(' ' IN display_name) + 1)
    ELSE ''
  END
WHERE display_name IS NOT NULL AND first_name IS NULL;

-- Drop display_name column since we're replacing it
ALTER TABLE public.users
DROP COLUMN IF EXISTS display_name;

-- Make first_name required
ALTER TABLE public.users
ALTER COLUMN first_name SET NOT NULL;
