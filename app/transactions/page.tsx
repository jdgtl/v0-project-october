import { redirect } from "next/navigation"
import { TransactionsList } from "@/components/transactions-list"
import { NavHeader } from "@/components/nav-header"
import { getUser, getSupabaseClient } from "@/lib/dev-auth"

export default async function TransactionsPage() {
  const supabase = await getSupabaseClient()

  const {
    data: { user },
  } = await getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("users")
    .select("hidden_categories, hidden_merchants")
    .eq("id", user.id)
    .single()

  const hiddenCategories = profile?.hidden_categories || []
  const hiddenMerchants = profile?.hidden_merchants || []

  let query = supabase
    .from("transactions")
    .select(
      `
      *,
      photos:transaction_photos(id, photo_url, thumbnail_url, transaction_id),
      drop:drops(id, created_at, is_public)
    `,
    )
    .eq("user_id", user.id)
    .is("deleted_at", null)

  // Filter out hidden categories
  if (hiddenCategories.length > 0) {
    query = query.not("personal_finance_category_primary", "in", `(${hiddenCategories.join(",")})`)
  }

  // Filter out hidden merchants
  if (hiddenMerchants.length > 0) {
    query = query.not("merchant_name", "in", `(${hiddenMerchants.join(",")})`)
  }

  const { data: transactions, error } = await query.order("date", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transactions</h1>
            <p className="text-muted-foreground">View and manage your transactions</p>
          </div>
          {/* <BackfillCategoriesButton /> */}
        </div>

        <TransactionsList transactions={transactions || []} userId={user.id} />
      </div>
    </div>
  )
}
