"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"

interface SpotCardProps {
  merchant: any
  isOwner: boolean
  onClick: () => void
}

export function SpotCard({ merchant, isOwner, onClick }: SpotCardProps) {
  const relativeDate = formatDistanceToNow(new Date(merchant.last_visited_date), { addSuffix: true })

  const categoryLabel = merchant.category_detailed
    ? merchant.category_detailed
        .replace(merchant.category_primary + "_", "") // Remove primary category prefix
        .split("_")
        .map((w: string) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(" ")
    : ""

  return (
    <Card className="group transition-all hover:shadow-md">
      <div className="space-y-4 px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          {merchant.logo_url ? (
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded">
              <Image
                src={merchant.logo_url || "/placeholder.svg"}
                alt={merchant.merchant_name}
                fill
                className="object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                  const parent = target.parentElement
                  if (parent) {
                    parent.innerHTML = `<div class="flex h-12 w-12 items-center justify-center rounded bg-muted text-lg font-bold text-primary">${merchant.merchant_name[0]}</div>`
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-muted text-lg font-bold text-primary">
              {merchant.merchant_name[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-balance font-semibold leading-tight text-foreground">{merchant.merchant_name}</h3>
          </div>
        </div>

        {/* Category */}
        <p className="text-sm text-muted-foreground">{categoryLabel}</p>

        {/* Meta row */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{merchant.visits_count} visits</span>
          <span>•</span>
          <span>Last visited {relativeDate}</span>
        </div>

        {/* Tags */}
        {merchant.tags && merchant.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {merchant.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* CTA */}
        <Button variant="outline" size="sm" className="w-full cursor-pointer bg-transparent" onClick={onClick}>
          View details
        </Button>
      </div>
    </Card>
  )
}
