import { type NextRequest, NextResponse } from "next/server"
import { getUser, getSupabaseClient } from "@/lib/dev-auth"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { plaid_item_id } = await request.json()

    if (!plaid_item_id) {
      return NextResponse.json({ error: "plaid_item_id is required" }, { status: 400 })
    }

    // Get accounts for this plaid item
    const { data: accounts, error: accountsError } = await supabase
      .from("accounts")
      .select("id")
      .eq("plaid_item_id", plaid_item_id)
      .is("deleted_at", null)

    if (accountsError) {
      console.error("[v0] Error fetching accounts:", accountsError)
      return NextResponse.json({ error: "Failed to fetch account details" }, { status: 500 })
    }

    const accountIds = accounts.map((acc) => acc.id)

    // Get transaction count for these accounts
    const { count: transactionCount, error: transactionsError } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .in("account_id", accountIds)
      .is("deleted_at", null)

    if (transactionsError) {
      console.error("[v0] Error counting transactions:", transactionsError)
      return NextResponse.json({ error: "Failed to count transactions" }, { status: 500 })
    }

    // Get drops count for these transactions
    const { count: dropsCount, error: dropsError } = await supabase
      .from("drops")
      .select("*", { count: "exact", head: true })
      .in("transaction_id", accountIds)

    if (dropsError) {
      console.error("[v0] Error counting drops:", dropsError)
      return NextResponse.json({ error: "Failed to count drops" }, { status: 500 })
    }

    return NextResponse.json({
      transaction_count: transactionCount || 0,
      drops_count: dropsCount || 0,
    })
  } catch (error) {
    console.error("[v0] Error in account-details route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
