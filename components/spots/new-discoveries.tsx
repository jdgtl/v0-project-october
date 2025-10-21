import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"

interface NewDiscoveriesProps {
  merchants: any[]
}

export function NewDiscoveries({ merchants }: NewDiscoveriesProps) {
  if (merchants.length === 0) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">New spots you've visited recently</h2>
        <p className="mt-1 text-muted-foreground">Places discovered in the last 30 days</p>
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4">
          {merchants.map((merchant) => {
            const relativeDate = formatDistanceToNow(new Date(merchant.first_seen_date), { addSuffix: true })
            const categoryLabel = merchant.category_detailed
              ? merchant.category_detailed
                  .replace(merchant.category_primary + "_", "") // Remove primary category prefix
                  .split("_")
                  .map((w: string) => w.charAt(0) + w.slice(1).toLowerCase())
                  .join(" ")
              : ""

            return (
              <Card key={merchant.merchant_entity_id} className="w-[280px] shrink-0">
                <div className="space-y-4 px-5 pb-5">
                  {/* Logo */}
                  <div className="flex items-center gap-3">
                    {merchant.logo_url ? (
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded">
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
                              parent.innerHTML = `<div class="flex h-10 w-10 items-center justify-center rounded bg-muted text-base font-bold text-primary">${merchant.merchant_name[0]}</div>`
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-muted text-base font-bold text-primary">
                        {merchant.merchant_name[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-balance text-sm font-semibold leading-tight text-foreground">
                        {merchant.merchant_name}
                      </h3>
                    </div>
                  </div>

                  {/* Discovery date */}
                  <p className="text-sm text-muted-foreground">Discovered {relativeDate}</p>

                  {/* Category */}
                  <p className="text-xs text-muted-foreground">{categoryLabel}</p>

                  {/* Tags */}
                  {merchant.tags && merchant.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {merchant.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    See on Feed
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
