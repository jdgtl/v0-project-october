import { getSupabaseClient } from "@/lib/dev-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Calendar } from "lucide-react"
import { NavHeader } from "@/components/nav-header"
import { getUser } from "@/lib/dev-auth"

export default async function DropsPage() {
  const supabase = await getSupabaseClient()

  const {
    data: { user },
  } = await getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: drops } = await supabase
    .from("drops")
    .select(
      `
      *,
      transaction:transactions(
        id,
        merchant_name,
        amount,
        date,
        logo_url,
        category
      ),
      drop_photos(
        photo:transaction_photos(
          id,
          photo_url,
          thumbnail_url
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Drops</h1>
          <p className="text-muted-foreground">Your shared transactions</p>
        </div>

        {!drops || drops.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <p className="text-lg font-medium">No drops yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Share your first transaction to create a drop</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {drops.map((drop: any) => {
              const transaction = drop.transaction
              const formattedDate = format(new Date(transaction.date), "MMM d, yyyy")
              const formattedAmount = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(transaction.amount)

              const firstPhoto = drop.drop_photos?.[0]?.photo
              const photoUrl = firstPhoto?.photo_url || firstPhoto?.thumbnail_url

              return (
                <Link key={drop.id} href={`/drops/${drop.id}`}>
                  <Card className="group relative transition-all hover:shadow-lg cursor-pointer h-40">
                    <CardContent className="p-0 h-full">
                      <div className="flex gap-0 h-full">
                        {/* Image thumbnail - only show if photo exists */}
                        {photoUrl && (
                          <div className="relative h-full w-40 flex-shrink-0 overflow-hidden rounded-l-lg">
                            <img
                              src={photoUrl || "/placeholder.svg"}
                              alt={transaction.merchant_name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}

                        {/* Public badge - positioned absolutely */}
                        {drop.is_public && <Badge className="absolute top-3 right-3 text-xs shadow-md">Public</Badge>}

                        {/* Content - stacked vertically */}
                        <div className="flex flex-1 flex-col justify-center gap-2 p-6">
                          <h3 className="font-semibold text-lg">{transaction.merchant_name}</h3>
                          <p className="text-2xl font-bold text-primary">{formattedAmount}</p>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formattedDate}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
