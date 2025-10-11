-- Add personal finance category columns to transactions table
ALTER TABLE transactions
ADD COLUMN personal_finance_category_primary TEXT,
ADD COLUMN personal_finance_category_detailed TEXT,
ADD COLUMN personal_finance_category_confidence TEXT,
ADD COLUMN personal_finance_category_icon_url TEXT;

-- Add comments to document the columns
COMMENT ON COLUMN transactions.personal_finance_category_primary IS 'Plaid personal finance category primary (e.g., FOOD_AND_DRINK)';
COMMENT ON COLUMN transactions.personal_finance_category_detailed IS 'Plaid personal finance category detailed (e.g., FOOD_AND_DRINK_RESTAURANTS)';
COMMENT ON COLUMN transactions.personal_finance_category_confidence IS 'Confidence level for the categorization (VERY_HIGH, HIGH, MEDIUM, LOW)';
COMMENT ON COLUMN transactions.personal_finance_category_icon_url IS 'URL to Plaid category icon';
