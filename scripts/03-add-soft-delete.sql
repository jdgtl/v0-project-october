-- Add deleted_at column to accounts table
ALTER TABLE accounts
ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add deleted_at column to transactions table
ALTER TABLE transactions
ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Add index for better query performance on non-deleted records
CREATE INDEX idx_accounts_deleted_at ON accounts(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_deleted_at ON transactions(deleted_at) WHERE deleted_at IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN accounts.deleted_at IS 'Timestamp when account was soft deleted. NULL means active.';
COMMENT ON COLUMN transactions.deleted_at IS 'Timestamp when transaction was soft deleted. NULL means active.';
