"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ExternalLink, MapPin } from "lucide-react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"

interface MerchantDetailDrawerProps {
  merchant: any
  transactions: any[]
  isOwner: boolean
  onClose: () => void
}

export function MerchantDetailDrawer({ merchant, transactions, isOwner, onClose }: MerchantDetailDrawerProps) {
  const [note, setNote] = useState("")
  const [isHidden, setIsHidden] = useState(false)

  const categoryLabel = merchant.category_detailed
    ? merchant.category_detailed
        .replace(merchant.category_primary + "_", "") // Remove primary category prefix
        .split("_")
        .map((w: string) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(" ")
    : ""

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full overflow-y-auto px-6 sm:max-w-lg">
        <SheetHeader className="pt-6">
          <SheetTitle>Merchant Details</SheetTitle>
          <SheetDescription>View and manage information about this spot</SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-8">
          {/* Banner */}
          <div className="flex items-start gap-4">
            {merchant.logo_url ? (
              <div className="relative h-16 w-16 overflow-hidden rounded">
                <Image
                  src={merchant.logo_url || "/placeholder.svg"}
                  alt={merchant.merchant_name}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded bg-muted text-2xl font-bold text-primary">
                {merchant.merchant_name[0]}
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{merchant.merchant_name}</h3>
              <p className="text-sm text-muted-foreground">{categoryLabel}</p>
              {merchant.website && (
                <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
                  <a href={merchant.website} target="_blank" rel="noopener noreferrer">
                    Visit website
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/30 p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total visits</p>
              <p className="text-2xl font-bold text-foreground">{merchant.visits_count}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last visited</p>
              <p className="text-sm font-medium text-foreground">
                {formatDistanceToNow(new Date(merchant.last_visited_date), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Location */}
          {merchant.location_city && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {merchant.location_city}, {merchant.location_region}
              </span>
            </div>
          )}

          {/* Tags */}
          {merchant.tags && merchant.tags.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Tags</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {merchant.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Transaction Timeline */}
          <div>
            <Label className="text-sm font-medium">Recent visits</Label>
            <div className="mt-3 space-y-3">
              {transactions.slice(0, 5).map((txn) => (
                <div key={txn.id} className="flex items-start justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {formatDistanceToNow(new Date(txn.date), { addSuffix: true })}
                    </p>
                    {txn.enrichment?.user_notes && (
                      <p className="mt-1 text-xs text-muted-foreground">{txn.enrichment.user_notes}</p>
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground">${txn.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Owner-only controls */}
          {isOwner && (
            <>
              <div className="space-y-3">
                <Label htmlFor="merchant-note">Add Note</Label>
                <Textarea
                  id="merchant-note"
                  placeholder="Add a personal note about this spot..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <Label htmlFor="hide-merchant" className="font-medium">
                    Hide from profile
                  </Label>
                  <p className="text-xs text-muted-foreground">Make this spot private</p>
                </div>
                <Switch id="hide-merchant" checked={isHidden} onCheckedChange={setIsHidden} />
              </div>

              <Button className="w-full pb-6">Save Changes</Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
