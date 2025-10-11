import { getSupabaseClient } from "@/lib/dev-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TrendingUp, CreditCard, Users, Wallet } from "lucide-react"
import { ConnectedAccountsCard } from "@/components/connected-accounts-card"
import { NavHeader } from "@/components/nav-header"
import { getUser } from "@/lib/dev-auth"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default async function DashboardPage() {
  const supabase = await getSupabaseClient()

  const {
    data: { user },
  } = await getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*, profile_photo_url, created_at, hidden_categories, hidden_merchants")
    .eq("id", user.id)
    .single()

  const { data: plaidItems } = await supabase.from("plaid_items").select("*, accounts(*)").eq("user_id", user.id)

  let transactionQuery = supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("deleted_at", null)

  // Filter by hidden categories
  if (profile?.hidden_categories && profile.hidden_categories.length > 0) {
    transactionQuery = transactionQuery.not(
      "personal_finance_category_primary",
      "in",
      `(${profile.hidden_categories.join(",")})`,
    )
  }

  // Filter by hidden merchants
  if (profile?.hidden_merchants && profile.hidden_merchants.length > 0) {
    transactionQuery = transactionQuery.not("merchant_name", "in", `(${profile.hidden_merchants.join(",")})`)
  }

  const { count: transactionCount } = await transactionQuery

  const { count: dropsCount } = await supabase
    .from("drops")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const { data: droppedTransactionIds } = await supabase.from("drops").select("transaction_id").eq("user_id", user.id)

  const droppedIds = droppedTransactionIds?.map((d) => d.transaction_id) || []

  let undroppedQuery = supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .not("id", "in", `(${droppedIds.length > 0 ? droppedIds.join(",") : "null"})`)

  // Filter by hidden categories
  if (profile?.hidden_categories && profile.hidden_categories.length > 0) {
    undroppedQuery = undroppedQuery.not(
      "personal_finance_category_primary",
      "in",
      `(${profile.hidden_categories.join(",")})`,
    )
  }

  // Filter by hidden merchants
  if (profile?.hidden_merchants && profile.hidden_merchants.length > 0) {
    undroppedQuery = undroppedQuery.not("merchant_name", "in", `(${profile.hidden_merchants.join(",")})`)
  }

  const { count: undroppedCount } = await undroppedQuery

  const { count: followersCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", user.id)

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.profile_photo_url || undefined} alt={profile?.first_name || "User"} />
              <AvatarFallback className="text-lg">
                {profile?.first_name?.[0]}
                {profile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                {profile?.first_name} {profile?.last_name}
              </h1>
              {memberSince && <p className="text-sm text-muted-foreground">Joined {memberSince}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          <Link href="/transactions" className="flex h-full">
            <Card className="group h-full w-full cursor-pointer transition-all hover:shadow-lg flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactionCount || 0}</div>
                <p className="text-xs text-muted-foreground">Total transactions</p>
                {undroppedCount && undroppedCount > 0 ? (
                  <Badge variant="secondary" className="mt-2">
                    {undroppedCount} ready to share
                  </Badge>
                ) : null}
              </CardContent>
            </Card>
          </Link>

          <Link href="/drops" className="flex h-full">
            <Card className="group h-full w-full cursor-pointer transition-all hover:shadow-lg flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Drops</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dropsCount || 0}</div>
                <p className="text-xs text-muted-foreground">Shared publicly</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Followers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{followersCount || 0}</div>
              <p className="text-xs text-muted-foreground">People following you</p>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accounts</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{plaidItems?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Connected accounts</p>
            </CardContent>
          </Card>
        </div>

        <ConnectedAccountsCard plaidItems={plaidItems || []} />
      </div>
    </div>
  )
}
