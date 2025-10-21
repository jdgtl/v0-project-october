"use client"

import { useState } from "react"
import Masonry from "react-masonry-css"
import { ProductProvenanceCard } from "./product-provenance-card"
import { PlaceProvenanceCard } from "./place-provenance-card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

interface ProvenanceFeedProps {
  transactions: any[]
  privacy: {
    show_amounts: boolean
    show_dates: boolean
  }
  isOwner: boolean
}

export function ProvenanceFeed({ transactions, privacy, isOwner }: ProvenanceFeedProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Filter transactions
  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      searchQuery === "" ||
      txn.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.enrichment?.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.enrichment?.product_brand?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = !selectedCategory || txn.personal_finance_category_primary === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Group by time buckets
  const groupedTransactions = filteredTransactions.reduce(
    (acc, txn) => {
      const date = new Date(txn.date)
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

      let bucket = "Earlier"
      if (diffDays <= 7) bucket = "This week"
      else if (diffDays <= 14) bucket = "Last week"
      else if (diffDays <= 30) bucket = "Earlier this month"

      if (!acc[bucket]) acc[bucket] = []
      acc[bucket].push(txn)
      return acc
    },
    {} as Record<string, any[]>,
  )

  const categories = ["FOOD_AND_DRINK", "TRAVEL", "PERSONAL_CARE", "SHOPPING"]

  const breakpointColumns = {
    default: 2,
    640: 1,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground">Your Feed</h2>
        <p className="mt-1 text-pretty text-muted-foreground">A collection of your lastest transactions</p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products, brands, or places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat
                .split("_")
                .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
                .join(" ")}
            </Badge>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-12">
        {Object.entries(groupedTransactions).map(([bucket, txns]) => (
          <div key={bucket} className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{bucket}</h3>
            <Masonry
              breakpointCols={breakpointColumns}
              className="flex -ml-8 w-auto"
              columnClassName="pl-8 bg-clip-padding"
            >
              {txns.map((txn) => {
                // Determine card type based on enrichment
                const hasProductEnrichment = txn.enrichment?.product_name || txn.enrichment?.product_image_url

                if (hasProductEnrichment) {
                  return <ProductProvenanceCard key={txn.id} transaction={txn} privacy={privacy} isOwner={isOwner} />
                } else {
                  return <PlaceProvenanceCard key={txn.id} transaction={txn} privacy={privacy} isOwner={isOwner} />
                }
              })}
            </Masonry>
          </div>
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No transactions found matching your filters.</p>
        </div>
      )}
    </div>
  )
}
