"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ExternalLink, Bookmark, Edit } from "lucide-react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import { EnrichmentPanel } from "./enrichment-panel"

interface ProductProvenanceCardProps {
  transaction: any
  privacy: {
    show_amounts: boolean
    show_dates: boolean
  }
  isOwner: boolean
}

export function ProductProvenanceCard({ transaction, privacy, isOwner }: ProductProvenanceCardProps) {
  const [showEnrichment, setShowEnrichment] = useState(false)
  const enrichment = transaction.enrichment || {}
  const isRefund = transaction.amount < 0

  const relativeDate = formatDistanceToNow(new Date(transaction.date), { addSuffix: true })
  const merchantLogo = transaction.logo_url || transaction.counterparties?.[0]?.logo_url
  const merchantName = transaction.merchant_name || transaction.counterparties?.[0]?.name || transaction.name
  const productUrl = enrichment.product_url || transaction.website

  return (
    <>
      <TooltipProvider>
        <Card className="group relative transition-all hover:shadow-md pt-0">
          {/* Product Image */}
          <div className="relative aspect-video overflow-hidden rounded-t-lg">
            {enrichment.product_image_url ? (
              <Image
                src={enrichment.product_image_url || "/placeholder.svg"}
                alt={`${enrichment.product_brand} ${enrichment.product_name}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">No image</div>
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
                  <p>Edit product details</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Card Content */}
          <div className="space-y-4 px-5 pb-5 pt-0">
            {/* Title & Subline */}
            <div>
              <h3 className="text-balance text-lg font-semibold leading-tight text-foreground">
                {enrichment.product_brand && `${enrichment.product_brand} `}
                {enrichment.product_name || merchantName}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {isRefund ? "Returned" : "Purchased"} {privacy.show_dates ? relativeDate : "recently"}
              </p>
              {enrichment.user_notes && (
                <p className="mt-2 text-pretty text-sm leading-relaxed text-foreground/80">{enrichment.user_notes}</p>
              )}
            </div>

            {/* Merchant Row */}
            <div className="flex items-center gap-3">
              {merchantLogo && (
                <div className="relative h-6 w-6 overflow-hidden rounded">
                  <Image src={merchantLogo || "/placeholder.svg"} alt={merchantName} fill className="object-contain" />
                </div>
              )}
              <span className="text-sm font-medium text-foreground">{merchantName}</span>
              {productUrl && <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />}
            </div>

            {/* Tags */}
            {enrichment.user_tags && enrichment.user_tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {enrichment.user_tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
                {isRefund && (
                  <Badge variant="outline" className="text-xs">
                    Returned
                  </Badge>
                )}
              </div>
            )}

            {/* Amount (if privacy allows) */}
            {privacy.show_amounts && (
              <div className="text-right text-sm font-medium text-muted-foreground">
                {transaction.iso_currency_code} {Math.abs(transaction.amount).toFixed(2)}
              </div>
            )}

            {/* CTAs */}
            <div className="flex gap-2">
              {productUrl && !isRefund && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild className="flex-1" size="sm">
                      <a href={productUrl} target="_blank" rel="noopener noreferrer">
                        View product
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Visit merchant website</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save for later</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </Card>
      </TooltipProvider>

      {showEnrichment && <EnrichmentPanel transaction={transaction} onClose={() => setShowEnrichment(false)} />}
    </>
  )
}
