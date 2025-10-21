// Plaid configuration and types

export const PLAID_CONFIG = {
  clientId: process.env.PLAID_CLIENT_ID!,
  secret: process.env.PLAID_SECRET!,
  env: process.env.PLAID_ENV || "sandbox",
  products: ["transactions"],
  countryCodes: ["US"],
  language: "en",
}

export interface PlaidLinkOnSuccessMetadata {
  institution: {
    name: string
    institution_id: string
  }
  accounts: Array<{
    id: string
    name: string
    mask: string
    type: string
    subtype: string
  }>
  link_session_id: string
  public_token: string
}
