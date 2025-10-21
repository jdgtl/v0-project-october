import { notFound } from "next/navigation"
import { getSupabaseClient } from "@/lib/dev-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { NavHeader } from "@/components/nav-header"
import { Building2, Calendar, Tag, Share2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { SyncPhotosButton } from "@/components/sync-photos-button"
import { formatCategoryName } from "@/lib/utils/format-category"

export default async function DropPage({ params }: { params: { id: string } }) {
  const supabase = await getSupabaseClient()

  console.log("[v0] Fetching drop with id:", params.id)

  const { data: drop, error } = await supabase
    .from("drops")
    .select(
      `
      *,
      transaction:transactions(*),
      user:users(*),
      drop_photos(
        photo:transaction_photos(*)
      )
    `,
    )
    .eq("id", params.id)
    .single()

  console.log("[v0] Drop data:", JSON.stringify(drop, null, 2))
  console.log("[v0] Drop error:", error)

  if (error || !drop) {
    console.error("[v0] Error fetching drop:", error)
    notFound()
  }

  const transaction = drop.transaction as any
  const user = drop.user as any

  console.log("[v0] drop.drop_photos:", drop.drop_photos)

  const photos = Array.isArray(drop.drop_photos)
    ? drop.drop_photos
        .map((dp: any) => {
          console.log("[v0] Processing drop_photo:", dp)
          return dp?.photo || null
        })
        .filter(Boolean)
    : []

  console.log("[v0] Processed photos:", photos)

  if (!transaction) {
    console.error("[v0] Drop has no associated transaction")
    notFound()
  }

  const formattedAmount = drop.show_amount
    ? drop.show_range
      ? (() => {
          const minAmount = Math.floor(transaction.amount * 0.8)
          const maxAmount = Math.ceil(transaction.amount * 1.2)
          return `${new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(minAmount)} - ${new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(maxAmount)}`
        })()
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(transaction.amount)
    : null

  return (
    <div className="min-h-svh bg-background">
      <NavHeader title="Drop" />

      <div className="container mx-auto max-w-2xl px-6 py-8">
        {photos.length === 0 && (
          <div className="mb-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
            <p className="mb-2 text-sm text-yellow-600 dark:text-yellow-400">
              This drop has no photos. If the transaction has photos, you can sync them:
            </p>
            <SyncPhotosButton dropId={params.id} />
          </div>
        )}

        <Card>
          <CardContent className="p-8">
            {/* User info */}
            <div className="mb-6 flex items-center justify-between">
              <Link href={`/profile/${user.username || user.id}`} className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.profile_photo_url || undefined} />
                  <AvatarFallback>{user.first_name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {user.first_name} {user.last_name || ""}
                  </p>
                  {user.username && <p className="text-sm text-muted-foreground">@{user.username}</p>}
                </div>
              </Link>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Drop content */}
            <div className="space-y-6">
              {photos.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {photos.slice(0, 3).map((photo: any, index: number) => (
                    <div
                      key={photo.id}
                      className={`overflow-hidden rounded-lg ${index === 0 && photos.length === 1 ? "col-span-2" : ""}`}
                    >
                      <img
                        src={photo.photo_url || "/placeholder.svg"}
                        alt="Transaction"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {drop.show_merchant && (
                <div className="flex items-center gap-3">
                  {transaction.logo_url ? (
                    <img src={transaction.logo_url || "/placeholder.svg"} alt="" className="h-12 w-12 rounded" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <h1 className="text-3xl font-bold">{transaction.merchant_name || "Unknown Merchant"}</h1>
                </div>
              )}

              {formattedAmount && <p className="text-4xl font-bold text-primary">{formattedAmount}</p>}

              {drop.caption && <p className="text-lg text-muted-foreground">{drop.caption}</p>}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {drop.show_date && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(transaction.date), "MMMM d, yyyy")}</span>
                  </div>
                )}
                {drop.show_category &&
                  (transaction.personal_finance_category_detailed || transaction.category?.[0]) && (
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-4 w-4" />
                      <span>
                        {transaction.personal_finance_category_detailed
                          ? formatCategoryName(
                              transaction.personal_finance_category_detailed,
                              transaction.personal_finance_category_primary || undefined,
                            )
                          : transaction.category?.[0]}
                      </span>
                    </div>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-4">
          <Button variant="outline" className="flex-1 bg-transparent" asChild>
            <Link href="/drops">View More Drops</Link>
          </Button>
          <Button className="flex-1" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
