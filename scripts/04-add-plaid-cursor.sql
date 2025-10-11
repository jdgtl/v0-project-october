-- Add cursor column to plaid_items table for /transactions/sync endpoint
ALTER TABLE plaid_items
ADD COLUMN IF NOT EXISTS transactions_cursor TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN plaid_items.transactions_cursor IS 'Cursor for Plaid /transactions/sync endpoint to track sync state';
