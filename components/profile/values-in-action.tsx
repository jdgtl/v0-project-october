import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ValuesInActionProps {
  transactions: any[]
  showValues: boolean
}

export function ValuesInAction({ transactions, showValues }: ValuesInActionProps) {
  // Compute values breakdown from user tags
  const allTags = transactions.flatMap((t) => t.enrichment?.user_tags || [])

  if (allTags.length === 0) return null

  const tagCounts = allTags.reduce(
    (acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const valueBreakdown = Object.entries(tagCounts)
    .map(([tag, count]) => ({
      tag,
      percentage: Math.round((count / allTags.length) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage)

  const topValues = valueBreakdown.slice(0, 3)

  // Determine badges
  const badges = []
  const localPct = valueBreakdown.find((v) => v.tag === "local")?.percentage || 0
  const sustainablePct = valueBreakdown.find((v) => v.tag === "sustainable")?.percentage || 0

  if (localPct >= 60) badges.push("Local Loyalist")
  if (sustainablePct >= 30) badges.push("Sustainability Champion")

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground">Values in Action</h3>
      <p className="mt-1 text-sm text-muted-foreground">What matters to you</p>

      <div className="mt-6 space-y-4">
        {showValues ? (
          <>
            {valueBreakdown.map(({ tag, percentage }) => (
              <div key={tag} className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="flex-1 text-sm font-medium capitalize text-foreground">{tag}</span>
                <span className="text-sm font-semibold text-foreground">{percentage}%</span>
              </div>
            ))}
          </>
        ) : (
          <div className="flex flex-wrap gap-2">
            {topValues.map(({ tag }) => (
              <Badge key={tag} variant="secondary" className="capitalize">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {badges.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            {badges.map((badge) => (
              <Badge key={badge} className="w-full justify-center">
                {badge}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
