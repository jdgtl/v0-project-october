-- Project October Database Schema
-- This script creates all tables and enables Row Level Security (RLS)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
-- Extends Supabase auth.users with profile information
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  username TEXT UNIQUE,
  bio TEXT,
  profile_photo_url TEXT,
  global_privacy_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view all profiles"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- PLAID ITEMS TABLE
-- ============================================================================
-- Stores Plaid connection information for each user
CREATE TABLE IF NOT EXISTS public.plaid_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plaid_item_id TEXT NOT NULL UNIQUE,
  plaid_access_token TEXT NOT NULL,
  institution_id TEXT,
  institution_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.plaid_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plaid_items
CREATE POLICY "Users can view own plaid items"
  ON public.plaid_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plaid items"
  ON public.plaid_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plaid items"
  ON public.plaid_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plaid items"
  ON public.plaid_items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- ACCOUNTS TABLE
-- ============================================================================
-- Stores bank accounts from Plaid
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plaid_item_id UUID NOT NULL REFERENCES public.plaid_items(id) ON DELETE CASCADE,
  plaid_account_id TEXT NOT NULL UNIQUE,
  account_name TEXT NOT NULL,
  account_type TEXT,
  account_subtype TEXT,
  mask TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accounts
CREATE POLICY "Users can view own accounts"
  ON public.accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts"
  ON public.accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON public.accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
  ON public.accounts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
-- Stores transactions from Plaid
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  plaid_transaction_id TEXT NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  merchant_name TEXT,
  category TEXT[],
  pending BOOLEAN DEFAULT false,
  payment_channel TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRANSACTION PHOTOS TABLE
-- ============================================================================
-- Stores photos attached to transactions
CREATE TABLE IF NOT EXISTS public.transaction_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transaction_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transaction_photos
CREATE POLICY "Users can view own transaction photos"
  ON public.transaction_photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transaction photos"
  ON public.transaction_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transaction photos"
  ON public.transaction_photos FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- DROPS TABLE
-- ============================================================================
-- Stores shared transactions (Drops)
CREATE TABLE IF NOT EXISTS public.drops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  caption TEXT,
  show_amount BOOLEAN DEFAULT true,
  show_range BOOLEAN DEFAULT false,
  show_merchant BOOLEAN DEFAULT true,
  show_date BOOLEAN DEFAULT true,
  show_category BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(transaction_id)
);

-- Enable RLS
ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;

-- RLS Policies for drops
CREATE POLICY "Anyone can view public drops"
  ON public.drops FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view own drops"
  ON public.drops FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drops"
  ON public.drops FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drops"
  ON public.drops FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own drops"
  ON public.drops FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FOLLOWS TABLE
-- ============================================================================
-- Stores follow relationships between users
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for follows
CREATE POLICY "Anyone can view follows"
  ON public.follows FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own follows"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Performance indexes for common queries

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

CREATE INDEX IF NOT EXISTS idx_plaid_items_user_id ON public.plaid_items(user_id);
CREATE INDEX IF NOT EXISTS idx_plaid_items_plaid_item_id ON public.plaid_items(plaid_item_id);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_plaid_item_id ON public.accounts(plaid_item_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_name ON public.transactions(merchant_name);

CREATE INDEX IF NOT EXISTS idx_transaction_photos_transaction_id ON public.transaction_photos(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_photos_user_id ON public.transaction_photos(user_id);

CREATE INDEX IF NOT EXISTS idx_drops_user_id ON public.drops(user_id);
CREATE INDEX IF NOT EXISTS idx_drops_transaction_id ON public.drops(transaction_id);
CREATE INDEX IF NOT EXISTS idx_drops_created_at ON public.drops(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drops_is_public ON public.drops(is_public);

CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plaid_items_updated_at
  BEFORE UPDATE ON public.plaid_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drops_updated_at
  BEFORE UPDATE ON public.drops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
