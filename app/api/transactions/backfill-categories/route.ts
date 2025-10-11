import { NextResponse } from "next/server"
import { getUser, getSupabaseClient } from "@/lib/dev-auth"

export async function POST() {
  try {
    const {
      data: { user },
      error: authError,
    } = await getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await getSupabaseClient()

    // Get all transactions that don't have personal finance categories
    const { data: transactions, error: fetchError } = await supabase
      .from("transactions")
      .select("id, plaid_transaction_id, account_id")
      .eq("user_id", user.id)
      .is("personal_finance_category_detailed", null)
      .not("plaid_transaction_id", "is", null)

    if (fetchError) {
      console.error("[v0] Error fetching transactions:", fetchError)
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ message: "No transactions to backfill", updated: 0 })
    }

    console.log(`[v0] Found ${transactions.length} transactions to backfill`)

    const { data: accountData } = await supabase
      .from("accounts")
      .select("plaid_item_id, plaid_items(plaid_access_token)")
      .eq("id", transactions[0].account_id)
      .single()

    const accessToken = (accountData?.plaid_items as any)?.plaid_access_token

    if (!accessToken) {
      return NextResponse.json({ error: "No access token found" }, { status: 400 })
    }

    console.log("[v0] Fetching transactions from Plaid...")

    const plaidEnv = process.env.PLAID_ENV || "sandbox"
    const plaidUrl =
      plaidEnv === "production"
        ? "https://production.plaid.com/transactions/get"
        : "https://sandbox.plaid.com/transactions/get"

    const response = await fetch(plaidUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET,
        access_token: accessToken,
        start_date: "2020-01-01",
        end_date: new Date().toISOString().split("T")[0],
        options: {
          include_personal_finance_category: true,
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[v0] Plaid API error:", data)
      return NextResponse.json({ error: data.error_message || "Failed to fetch from Plaid" }, { status: 500 })
    }

    console.log("[v0] Plaid response received")

    const plaidTransactions = data.transactions

    if (!plaidTransactions || !Array.isArray(plaidTransactions)) {
      console.error("[v0] Invalid Plaid response structure:", data)
      return NextResponse.json({ error: "Invalid response from Plaid" }, { status: 500 })
    }

    console.log(`[v0] Found ${plaidTransactions.length} transactions from Plaid`)

    // Create a map of plaid_transaction_id to personal finance category
    const categoryMap = new Map()
    for (const tx of plaidTransactions) {
      if (tx.personal_finance_category) {
        categoryMap.set(tx.transaction_id, {
          primary: tx.personal_finance_category.primary,
          detailed: tx.personal_finance_category.detailed,
          confidence: tx.personal_finance_category.confidence_level,
          icon_url: tx.personal_finance_category_icon_url,
        })
      }
    }

    console.log(`[v0] Found ${categoryMap.size} transactions with categories from Plaid`)

    // Update transactions in database
    let updated = 0
    for (const transaction of transactions) {
      const categoryData = categoryMap.get(transaction.plaid_transaction_id)
      if (categoryData) {
        const { error: updateError } = await supabase
          .from("transactions")
          .update({
            personal_finance_category_primary: categoryData.primary,
            personal_finance_category_detailed: categoryData.detailed,
            personal_finance_category_confidence: categoryData.confidence,
            personal_finance_category_icon_url: categoryData.icon_url,
          })
          .eq("id", transaction.id)

        if (!updateError) {
          updated++
        } else {
          console.error(`[v0] Error updating transaction ${transaction.id}:`, updateError)
        }
      }
    }

    console.log(`[v0] Successfully updated ${updated} transactions`)

    return NextResponse.json({
      message: "Categories backfilled successfully",
      total: transactions.length,
      updated,
    })
  } catch (error) {
    console.error("[v0] Error backfilling categories:", error)
    return NextResponse.json({ error: "Failed to backfill categories" }, { status: 500 })
  }
}
