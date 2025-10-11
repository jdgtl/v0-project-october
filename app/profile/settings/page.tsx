import { redirect } from "next/navigation"
import { NavHeader } from "@/components/nav-header"
import { getUser, getSupabaseClient } from "@/lib/dev-auth"
import { SettingsForm } from "@/components/settings-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default async function SettingsPage() {
  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile, error } = await supabase.from("users").select("*").eq("id", user.id).single()

  const needsMigration =
    error?.message?.includes("default_drop_visibility") ||
    error?.message?.includes("hidden_categories") ||
    error?.message?.includes("hidden_merchants") ||
    !profile?.hasOwnProperty("default_drop_visibility")

  if (needsMigration) {
    return (
      <div className="min-h-screen bg-background">
        <NavHeader />
        <div className="container mx-auto max-w-4xl p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your preferences and privacy settings</p>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Migration Required</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>The settings feature requires a database migration to be run.</p>
              <p className="font-mono text-sm bg-muted p-2 rounded mt-2">
                Please run: scripts/11-add-user-settings.sql
              </p>
              <p className="text-sm mt-2">
                This will add the necessary columns to store your preferences for hidden categories, hidden merchants,
                and default drop visibility.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const { data: transactions } = await supabase
    .from("transactions")
    .select("personal_finance_category_primary")
    .eq("user_id", user.id)
    .not("personal_finance_category_primary", "is", null)

  const uniqueCategories = Array.from(
    new Set(transactions?.map((t) => t.personal_finance_category_primary).filter(Boolean)),
  ).sort()

  // Fetch all unique merchants from user's transactions
  const { data: merchantData } = await supabase
    .from("transactions")
    .select("merchant_name")
    .eq("user_id", user.id)
    .not("merchant_name", "is", null)

  const uniqueMerchants = Array.from(new Set(merchantData?.map((t) => t.merchant_name).filter(Boolean))).sort()

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <div className="container mx-auto max-w-4xl p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences and privacy settings</p>
        </div>

        <SettingsForm
          userId={user.id}
          hiddenCategories={profile?.hidden_categories || []}
          hiddenMerchants={profile?.hidden_merchants || []}
          defaultDropVisibility={profile?.default_drop_visibility || "public"}
          availableCategories={uniqueCategories}
          availableMerchants={uniqueMerchants}
        />
      </div>
    </div>
  )
}
