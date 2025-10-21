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

    const { item_id } = await request.json()

    // Get Plaid item from database
    const { data: plaidItem, error: itemError } = await supabase
      .from("plaid_items")
      .select("*")
      .eq("plaid_item_id", item_id)
      .eq("user_id", user.id)
      .single()

    if (itemError || !plaidItem) {
      return NextResponse.json({ error: "Plaid item not found" }, { status: 404 })
    }

    // Get accounts for this item
    const { data: accounts, error: accountsError } = await supabase
      .from("accounts")
      .select("*")
      .eq("plaid_item_id", plaidItem.id)

    if (accountsError) throw accountsError

    let allAddedTransactions: any[] = []
    let allModifiedTransactions: any[] = []
    let allRemovedTransactions: any[] = []
    let cursor = plaidItem.transactions_cursor || undefined
    let hasMore = true

    // Fetch all pages of transactions
    while (hasMore) {
      const requestBody: any = {
        client_id: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET,
        access_token: plaidItem.plaid_access_token,
        options: {
          include_personal_finance_category: true,
        },
      }

      // Only include cursor if it exists (first sync won't have a cursor)
      if (cursor) {
        requestBody.cursor = cursor
      }

      const response = await fetch("https://sandbox.plaid.com/transactions/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error_message || "Failed to sync transactions")
      }

      // Accumulate transactions from all pages
      allAddedTransactions = allAddedTransactions.concat(data.added || [])
      allModifiedTransactions = allModifiedTransactions.concat(data.modified || [])
      allRemovedTransactions = allRemovedTransactions.concat(data.removed || [])

      // Update cursor and check if more pages exist
      cursor = data.next_cursor
      hasMore = data.has_more

      console.log("[v0] Sync page complete:", {
        added: data.added?.length || 0,
        modified: data.modified?.length || 0,
        removed: data.removed?.length || 0,
        has_more: hasMore,
      })
    }

    console.log("[v0] Total transactions synced:", {
      added: allAddedTransactions.length,
      modified: allModifiedTransactions.length,
      removed: allRemovedTransactions.length,
    })

    // Log sample transaction to see category data
    if (allAddedTransactions.length > 0) {
      console.log("[v0] Sample added transaction:", JSON.stringify(allAddedTransactions[0], null, 2))
    }

    // Process added and modified transactions
    const transactionsToUpsert = [...allAddedTransactions, ...allModifiedTransactions].map((transaction: any) => {
      const account = accounts.find((acc) => acc.plaid_account_id === transaction.account_id)

      let category = transaction.category || []
      if (transaction.personal_finance_category?.primary) {
        // Convert from FOOD_AND_DRINK to "Food and Drink" format
        const primaryCategory = transaction.personal_finance_category.primary
          .split("_")
          .map((word: string) => word.charAt(0) + word.slice(1).toLowerCase())
          .join(" ")
        category = [primaryCategory]
      }

      return {
        user_id: user.id,
        account_id: account?.id,
        plaid_transaction_id: transaction.transaction_id,
        amount: Math.abs(transaction.amount),
        date: transaction.date,
        merchant_name: transaction.merchant_name || transaction.name,
        category: category,
        pending: transaction.pending,
        payment_channel: transaction.payment_channel,
        logo_url: transaction.logo_url || null,
        personal_finance_category_primary: transaction.personal_finance_category?.primary || null,
        personal_finance_category_detailed: transaction.personal_finance_category?.detailed || null,
        personal_finance_category_confidence: transaction.personal_finance_category?.confidence_level || null,
        personal_finance_category_icon_url: transaction.personal_finance_category_icon_url || null,
      }
    })

    // Upsert transactions (insert or update if exists)
    if (transactionsToUpsert.length > 0) {
      const { error: upsertError } = await supabase.from("transactions").upsert(transactionsToUpsert, {
        onConflict: "plaid_transaction_id",
        ignoreDuplicates: false,
      })

      if (upsertError) throw upsertError
    }

    // Handle removed transactions (soft delete)
    if (allRemovedTransactions.length > 0) {
      const removedIds = allRemovedTransactions.map((t: any) => t.transaction_id)
      const { error: deleteError } = await supabase
        .from("transactions")
        .update({ deleted_at: new Date().toISOString() })
        .in("plaid_transaction_id", removedIds)

      if (deleteError) throw deleteError
    }

    // Save the cursor for next sync
    const { error: cursorError } = await supabase
      .from("plaid_items")
      .update({ transactions_cursor: cursor })
      .eq("id", plaidItem.id)

    if (cursorError) throw cursorError

    return NextResponse.json({
      success: true,
      added: allAddedTransactions.length,
      modified: allModifiedTransactions.length,
      removed: allRemovedTransactions.length,
      total_synced: transactionsToUpsert.length,
    })
  } catch (error) {
    console.error("[v0] Error syncing transactions:", error)
    return NextResponse.json({ error: "Failed to sync transactions" }, { status: 500 })
  }
}
