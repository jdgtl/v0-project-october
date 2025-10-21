"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ExternalLink, Edit } from "lucide-react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import { EnrichmentPanel } from "./enrichment-panel"

interface PlaceProvenanceCardProps {
  transaction: any
  privacy: {
    show_amounts: boolean
    show_dates: boolean
  }
  isOwner: boolean
}

export function PlaceProvenanceCard({ transaction, privacy, isOwner }: PlaceProvenanceCardProps) {
  const [showEnrichment, setShowEnrichment] = useState(false)
  const enrichment = transaction.enrichment || {}
  const isRefund = transaction.amount < 0

  const relativeDate = formatDistanceToNow(new Date(transaction.date), { addSuffix: true })
  const merchantLogo = transaction.logo_url || transaction.counterparties?.[0]?.logo_url
  const merchantName = transaction.merchant_name || transaction.counterparties?.[0]?.name || transaction.name
  const merchantWebsite = transaction.website || transaction.counterparties?.[0]?.website

  const categoryLabel = transaction.personal_finance_category_detailed
    ? transaction.personal_finance_category_detailed
        .replace(transaction.personal_finance_category_primary + "_", "") // Remove primary category prefix
        .split("_")
        .map((w: string) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(" ")
    : ""

  return (
    <>
      <TooltipProvider>
        <Card className="group relative transition-all hover:shadow-md pt-0">
          {/* Place Image/Logo */}
          <div className="relative aspect-video overflow-hidden rounded-t-lg">
            {merchantLogo ? (
              <div className="flex h-full items-center justify-center bg-muted p-8">
                <div className="relative h-24 w-24">
                  <Image src={merchantLogo || "/placeholder.svg"} alt={merchantName} fill className="object-contain" />
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                  {merchantName?.[0] || "?"}
                </div>
              </div>
            )}
            {isOwner && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute right-2 top-2 shadow-md opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => setShowEnrichment(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit place details</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Card Content */}
          <div className="space-y-4 px-5 pb-5 pt-0">
            {/* Title & Subline */}
            <div>
              <h3 className="text-balance text-lg font-semibold leading-tight text-foreground">{merchantName}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{categoryLabel}</p>
              {privacy.show_dates && <p className="text-sm text-muted-foreground">Last visited {relativeDate}</p>}
              {enrichment.user_notes && (
                <p className="mt-2 text-pretty text-sm leading-relaxed text-foreground/80">{enrichment.user_notes}</p>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {enrichment.user_tags?.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {transaction.payment_channel === "in store" && (
                <Badge variant="outline" className="text-xs">
                  #irl
                </Badge>
              )}
              {isRefund && (
                <Badge variant="outline" className="text-xs">
                  Returned
                </Badge>
              )}
            </div>

            {/* Amount (if privacy allows) */}
            {privacy.show_amounts && (
              <div className="text-right text-sm font-medium text-muted-foreground">
                {transaction.iso_currency_code} {Math.abs(transaction.amount).toFixed(2)}
              </div>
            )}

            {merchantWebsite && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                    <a href={merchantWebsite} target="_blank" rel="noopener noreferrer">
                      Visit merchant site
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open merchant website</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </Card>
      </TooltipProvider>

      {showEnrichment && <EnrichmentPanel transaction={transaction} onClose={() => setShowEnrichment(false)} />}
    </>
  )
}
