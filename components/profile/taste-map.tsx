"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TasteMapProps {
  transactions: any[]
}

export function TasteMap({ transactions }: TasteMapProps) {
  // Count by primary category
  const categoryCounts = transactions.reduce(
    (acc, txn) => {
      const category = txn.personal_finance_category_primary
      acc[category] = (acc[category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const categories = Object.entries(categoryCounts)
    .map(([category, count]) => ({
      category: category
        .split("_")
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(" "),
      count,
    }))
    .sort((a, b) => b.count - a.count)

  if (categories.length === 0) return null

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground">Taste Map</h3>
      <p className="mt-1 text-sm text-muted-foreground">Your interests at a glance</p>

      <div className="mt-6 flex flex-wrap gap-3">
        {categories.map(({ category, count }) => {
          // Size based on count
          const size = count <= 2 ? "text-sm" : count <= 4 ? "text-base" : "text-lg"

          return (
            <Badge
              key={category}
              variant="outline"
              className={`cursor-pointer transition-colors hover:bg-accent ${size}`}
            >
              {category} ({count})
            </Badge>
          )
        })}
      </div>
    </Card>
  )
}
