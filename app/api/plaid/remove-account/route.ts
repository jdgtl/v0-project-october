import { type NextRequest, NextResponse } from "next/server"
import { getUser, getSupabaseClient } from "@/lib/dev-auth"

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { plaid_item_id, deletion_type = "archive" } = await request.json()

    if (!plaid_item_id) {
      return NextResponse.json({ error: "plaid_item_id is required" }, { status: 400 })
    }

    const { data: plaidItem, error: fetchError } = await supabase
      .from("plaid_items")
      .select("id, user_id")
      .eq("id", plaid_item_id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !plaidItem) {
      return NextResponse.json({ error: "Plaid item not found or unauthorized" }, { status: 404 })
    }

    if (deletion_type === "archive") {
      const now = new Date().toISOString()

      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select("id")
        .eq("plaid_item_id", plaid_item_id)

      if (accountsError) {
        console.error("[v0] Error fetching accounts:", accountsError)
        return NextResponse.json({ error: "Failed to archive account" }, { status: 500 })
      }

      const accountIds = accounts.map((acc) => acc.id)

      const { error: accountsDeleteError } = await supabase
        .from("accounts")
        .update({ deleted_at: now })
        .eq("plaid_item_id", plaid_item_id)

      if (accountsDeleteError) {
        console.error("[v0] Error archiving accounts:", accountsDeleteError)
        return NextResponse.json({ error: "Failed to archive accounts" }, { status: 500 })
      }

      const { error: transactionsDeleteError } = await supabase
        .from("transactions")
        .update({ deleted_at: now })
        .in("account_id", accountIds)

      if (transactionsDeleteError) {
        console.error("[v0] Error archiving transactions:", transactionsDeleteError)
        return NextResponse.json({ error: "Failed to archive transactions" }, { status: 500 })
      }

      const { error: deleteError } = await supabase.from("plaid_items").delete().eq("id", plaid_item_id)

      if (deleteError) {
        console.error("[v0] Error deleting plaid item:", deleteError)
        return NextResponse.json({ error: "Failed to remove account" }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: "Account archived successfully" })
    } else {
      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select("id")
        .eq("plaid_item_id", plaid_item_id)

      if (accountsError) {
        console.error("[v0] Error fetching accounts:", accountsError)
        return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
      }

      const accountIds = accounts.map((acc) => acc.id)

      const { data: transactions, error: transactionsError } = await supabase
        .from("transactions")
        .select("id")
        .in("account_id", accountIds)

      if (transactionsError) {
        console.error("[v0] Error fetching transactions:", transactionsError)
        return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
      }

      const transactionIds = transactions.map((txn) => txn.id)

      if (transactionIds.length > 0) {
        const { error: dropsDeleteError } = await supabase.from("drops").delete().in("transaction_id", transactionIds)

        if (dropsDeleteError) {
          console.error("[v0] Error deleting drops:", dropsDeleteError)
          return NextResponse.json({ error: "Failed to delete associated Drops" }, { status: 500 })
        }
      }

      const { error: deleteError } = await supabase.from("plaid_items").delete().eq("id", plaid_item_id)

      if (deleteError) {
        console.error("[v0] Error deleting plaid item:", deleteError)
        return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: "Account and associated Drops permanently deleted" })
    }
  } catch (error) {
    console.error("[v0] Error in remove-account route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
