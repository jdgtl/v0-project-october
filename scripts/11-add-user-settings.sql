-- Add user settings columns to users table

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS hidden_categories TEXT[] DEFAULT ARRAY[
  'BANK_FEES_ATM_FEES',
  'BANK_FEES_FOREIGN_TRANSACTION_FEES',
  'BANK_FEES_INSUFFICIENT_FUNDS',
  'BANK_FEES_INTEREST_CHARGE',
  'BANK_FEES_OVERDRAFT_FEES',
  'BANK_FEES_OTHER_BANK_FEES',
  'INCOME_DIVIDENDS',
  'INCOME_INTEREST_EARNED',
  'INCOME_RETIREMENT_PENSION',
  'INCOME_TAX_REFUND',
  'INCOME_UNEMPLOYMENT',
  'INCOME_WAGES',
  'INCOME_OTHER_INCOME',
  'LOAN_PAYMENTS_CAR_PAYMENT',
  'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT',
  'LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT',
  'LOAN_PAYMENTS_MORTGAGE_PAYMENT',
  'LOAN_PAYMENTS_STUDENT_LOAN_PAYMENT',
  'LOAN_PAYMENTS_OTHER_PAYMENT',
  'TRANSFER_IN_CASH_DEPOSITS_AND_TRANSFERS',
  'TRANSFER_IN_DEPOSIT',
  'TRANSFER_IN_INVESTMENT_AND_RETIREMENT_FUNDS',
  'TRANSFER_IN_SAVINGS',
  'TRANSFER_IN_ACCOUNT_TRANSFER',
  'TRANSFER_IN_OTHER_TRANSFER_IN',
  'TRANSFER_OUT_INVESTMENT_AND_RETIREMENT_FUNDS',
  'TRANSFER_OUT_SAVINGS',
  'TRANSFER_OUT_WITHDRAWAL',
  'TRANSFER_OUT_ACCOUNT_TRANSFER',
  'TRANSFER_OUT_OTHER_TRANSFER_OUT'
],
ADD COLUMN IF NOT EXISTS hidden_merchants TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS default_drop_visibility TEXT DEFAULT 'public' CHECK (default_drop_visibility IN ('public', 'private'));

-- Add comments
COMMENT ON COLUMN users.hidden_categories IS 'Array of personal_finance_category_detailed values to hide from transactions list';
COMMENT ON COLUMN users.hidden_merchants IS 'Array of merchant names to hide from transactions list';
COMMENT ON COLUMN users.default_drop_visibility IS 'Default visibility for new drops (public or private)';

-- Removed GIN indexes that required pg_trgm extension
-- Basic indexes for filtering (these work without extensions)
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions (personal_finance_category_detailed);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions (merchant_name);
