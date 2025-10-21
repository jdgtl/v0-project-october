"use client"

import { useState } from "react"
import { SpotsHeader } from "@/components/spots/spots-header"
import { RegularsGrid } from "@/components/spots/regulars-grid"
import { NewDiscoveries } from "@/components/spots/new-discoveries"
import { DemoToggle } from "@/components/profile/demo-toggle"
import { StickyNav } from "@/components/profile/sticky-nav"

// Sample merchant summary data derived from transactions
const sampleMerchantSummaries = [
  {
    merchant_entity_id: "NZAJQ5wYdo1W1p39X5q5gpb15OMe39pj4pJBb",
    merchant_name: "Starbucks",
    logo_url: "https://plaid-merchant-logos.plaid.com/starbucks_956.png",
    website: "https://starbucks.com",
    visits_count: 12,
    last_visited_date: "2025-10-13",
    first_seen_date: "2025-08-01",
    category_primary: "FOOD_AND_DRINK",
    category_detailed: "FOOD_AND_DRINK_COFFEE",
    tags: ["local", "coffee"],
    location_city: "San Francisco",
    location_region: "CA",
  },
  {
    merchant_entity_id: "vzWXDWBjB06j5BJoD3Jo84OJZg7JJzmqOZA22",
    merchant_name: "McDonald's",
    logo_url: "https://plaid-merchant-logos.plaid.com/mcdonalds_619.png",
    website: "https://mcdonalds.com",
    visits_count: 8,
    last_visited_date: "2025-10-13",
    first_seen_date: "2025-07-15",
    category_primary: "FOOD_AND_DRINK",
    category_detailed: "FOOD_AND_DRINK_FAST_FOOD",
    tags: ["late-night", "irl"],
    location_city: "San Francisco",
    location_region: "CA",
  },
  {
    merchant_entity_id: "E5g7V38oQ7cgxawEnw5NUPdjBkQVwwi6y4wN6",
    merchant_name: "Touchstone Climbing",
    logo_url: null,
    website: "https://touchstoneclimbing.com",
    visits_count: 6,
    last_visited_date: "2025-10-14",
    first_seen_date: "2025-06-20",
    category_primary: "PERSONAL_CARE",
    category_detailed: "PERSONAL_CARE_GYMS_AND_FITNESS_CENTERS",
    tags: ["fitness", "local"],
    location_city: "San Francisco",
    location_region: "CA",
  },
  {
    merchant_entity_id: "NKDjqyAdQQzpyeD8qpLnX0D6yvLe2KYKYYzQ4",
    merchant_name: "United Airlines",
    logo_url: "https://plaid-merchant-logos.plaid.com/united_airlines_1065.png",
    website: "https://united.com",
    visits_count: 3,
    last_visited_date: "2025-10-14",
    first_seen_date: "2025-09-01",
    category_primary: "TRAVEL",
    category_detailed: "TRAVEL_FLIGHTS",
    tags: ["travel"],
    location_city: "Various",
    location_region: "N/A",
  },
  {
    merchant_entity_id: "new_discovery_1",
    merchant_name: "Blue Bottle Coffee",
    logo_url: "https://plaid-merchant-logos.plaid.com/blue_bottle_coffee_123.png",
    website: "https://bluebottlecoffee.com",
    visits_count: 2,
    last_visited_date: "2025-10-12",
    first_seen_date: "2025-10-05",
    category_primary: "FOOD_AND_DRINK",
    category_detailed: "FOOD_AND_DRINK_COFFEE",
    tags: ["coffee", "local"],
    location_city: "San Francisco",
    location_region: "CA",
  },
  {
    merchant_entity_id: "new_discovery_2",
    merchant_name: "Whole Foods Market",
    logo_url: "https://plaid-merchant-logos.plaid.com/whole_foods_456.png",
    website: "https://wholefoodsmarket.com",
    visits_count: 1,
    last_visited_date: "2025-10-10",
    first_seen_date: "2025-10-10",
    category_primary: "FOOD_AND_DRINK",
    category_detailed: "FOOD_AND_DRINK_GROCERIES",
    tags: ["groceries", "sustainable"],
    location_city: "San Francisco",
    location_region: "CA",
  },
]

// Sample transactions for merchant detail drawer
const sampleTransactions = [
  {
    id: "1",
    date: "2025-10-13",
    amount: 4.33,
    merchant_name: "Starbucks",
    enrichment: { user_notes: "Morning coffee" },
  },
  {
    id: "2",
    date: "2025-10-10",
    amount: 5.75,
    merchant_name: "Starbucks",
    enrichment: { user_notes: "Afternoon pick-me-up" },
  },
  {
    id: "3",
    date: "2025-10-08",
    amount: 4.33,
    merchant_name: "Starbucks",
    enrichment: { user_notes: "Quick stop before work" },
  },
]

export default function SpotsPage() {
  const [isOwnerMode, setIsOwnerMode] = useState(true)
  const [timeframe, setTimeframe] = useState<"30d" | "90d" | "all">("90d")

  const sampleProfile = {
    display_name: "Jordan D.",
    avatar_url: "https://placehold.co/144x144",
  }

  // Filter merchants based on timeframe
  const now = new Date()
  const filteredMerchants = sampleMerchantSummaries.filter((merchant) => {
    if (timeframe === "all") return true
    const lastVisited = new Date(merchant.last_visited_date)
    const diffDays = Math.floor((now.getTime() - lastVisited.getTime()) / (1000 * 60 * 60 * 24))
    return timeframe === "30d" ? diffDays <= 30 : diffDays <= 90
  })

  // Separate regulars (5+ visits) and new discoveries (first seen in last 30 days)
  const regulars = filteredMerchants.filter((m) => m.visits_count >= 5).sort((a, b) => b.visits_count - a.visits_count)

  const newDiscoveries = filteredMerchants
    .filter((m) => {
      const firstSeen = new Date(m.first_seen_date)
      const diffDays = Math.floor((now.getTime() - firstSeen.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays <= 30
    })
    .sort((a, b) => new Date(b.first_seen_date).getTime() - new Date(a.first_seen_date).getTime())

  const numRegulars = regulars.length
  const numNew = newDiscoveries.length

  return (
    <div className="min-h-screen bg-background">
      <StickyNav profile={sampleProfile} currentPage="spots" />

      <DemoToggle isOwner={isOwnerMode} onToggle={setIsOwnerMode} />

      <main className="mx-auto max-w-[1200px] px-6 py-8 lg:py-12">
        <SpotsHeader numRegulars={numRegulars} numNew={numNew} timeframe={timeframe} onTimeframeChange={setTimeframe} />

        <div className="mt-12 space-y-16">
          <RegularsGrid merchants={regulars} isOwner={isOwnerMode} transactions={sampleTransactions} />
          <NewDiscoveries merchants={newDiscoveries} />
        </div>

        {filteredMerchants.length === 0 && (
          <div className="py-24 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <span className="text-4xl">📍</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground">No public spots yet</h3>
            <p className="mt-2 text-muted-foreground">Start adding transactions to see your favorite places here.</p>
          </div>
        )}
      </main>
    </div>
  )
}
