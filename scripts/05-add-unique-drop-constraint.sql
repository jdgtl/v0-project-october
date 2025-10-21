-- Add unique constraint to prevent duplicate drops per transaction
-- This ensures each transaction can only be dropped once

ALTER TABLE drops
ADD CONSTRAINT unique_transaction_drop UNIQUE (transaction_id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_drops_transaction_id ON drops(transaction_id);
