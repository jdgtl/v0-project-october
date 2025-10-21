import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface ProfileHeaderProps {
  profile: {
    display_name: string
    avatar_url: string
    bio: string
    privacy: {
      show_values: boolean
    }
  }
  transactions: any[]
}

export function ProfileHeader({ profile, transactions }: ProfileHeaderProps) {
  // Compute behavior tagline from recent categories
  const categoryCount = transactions.reduce(
    (acc, txn) => {
      const category = txn.personal_finance_category_detailed || txn.personal_finance_category_primary
      acc[category] = (acc[category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topCategories = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cat]) => cat.split("_").pop()?.toLowerCase())

  const behaviorTagline = `Mostly ${topCategories.join(", ")}`

  // Compute discoveries (new merchants in last 30 days)
  const discoveries = new Set(transactions.map((t) => t.merchant_entity_id || t.merchant_name)).size

  // Compute values percentages
  const allTags = transactions.flatMap((t) => t.enrichment?.user_tags || [])
  const localPct =
    allTags.length > 0 ? Math.round((allTags.filter((t) => t === "local").length / allTags.length) * 100) : 0

  return (
    <Card className="p-8 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* Avatar */}
        <Avatar className="h-18 w-18 md:h-[72px] md:w-[72px]">
          <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.display_name} />
          <AvatarFallback className="text-2xl font-bold">{profile.display_name[0]}</AvatarFallback>
        </Avatar>

        {/* Identity Info */}
        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {profile.display_name}
            </h1>
            <p className="mt-2 text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              {behaviorTagline}
            </p>
          </div>

          {/* Quick Chips */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="font-medium">
              {discoveries} new spots
            </Badge>
            {profile.privacy.show_values && localPct > 0 && (
              <Badge variant="secondary" className="font-medium">
                {localPct}% local
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
