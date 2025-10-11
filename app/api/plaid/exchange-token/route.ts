import { NextResponse } from "next/server"
import { getUser, getSupabaseClient } from "@/lib/dev-auth"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { public_token, metadata } = await request.json()

    // Exchange public token for access token
    const response = await fetch("https://sandbox.plaid.com/item/public_token/exchange", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET,
        public_token,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error_message || "Failed to exchange token")
    }

    // Store Plaid item in database
    const { data: plaidItem, error: itemError } = await supabase
      .from("plaid_items")
      .insert({
        user_id: user.id,
        plaid_item_id: data.item_id,
        plaid_access_token: data.access_token,
        institution_id: metadata.institution.institution_id,
        institution_name: metadata.institution.name,
      })
      .select()
      .single()

    if (itemError) throw itemError

    // Store accounts
    const accountsToInsert = metadata.accounts.map((account: any) => ({
      user_id: user.id,
      plaid_item_id: plaidItem.id,
      plaid_account_id: account.id,
      account_name: account.name,
      account_type: account.type,
      account_subtype: account.subtype,
      mask: account.mask,
    }))

    const { error: accountsError } = await supabase.from("accounts").insert(accountsToInsert)

    if (accountsError) throw accountsError

    return NextResponse.json({ success: true, item_id: data.item_id })
  } catch (error) {
    console.error("[v0] Error exchanging token:", error)
    return NextResponse.json({ error: "Failed to exchange token" }, { status: 500 })
  }
}
