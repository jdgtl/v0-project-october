// Database types for Project October

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string | null
  username: string | null
  bio: string | null
  profile_photo_url: string | null
  global_privacy_enabled: boolean
  created_at: string
  updated_at: string
}

export interface PlaidItem {
  id: string
  user_id: string
  plaid_item_id: string
  plaid_access_token: string
  institution_id: string | null
  institution_name: string | null
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  user_id: string
  plaid_item_id: string
  plaid_account_id: string
  account_name: string
  account_type: string | null
  account_subtype: string | null
  mask: string | null
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  plaid_transaction_id: string
  amount: number
  date: string
  merchant_name: string | null
  category: string[] | null
  pending: boolean
  payment_channel: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
}

export interface TransactionPhoto {
  id: string
  transaction_id: string
  user_id: string
  photo_url: string
  thumbnail_url: string | null
  display_order: number
  created_at: string
}

export interface Drop {
  id: string
  user_id: string
  transaction_id: string
  caption: string | null
  show_amount: boolean
  show_range: boolean
  show_merchant: boolean
  show_date: boolean
  show_category: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}
