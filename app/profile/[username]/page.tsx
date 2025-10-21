"use client"

import { ProfileHeader } from "@/components/profile/profile-header"
import { ProvenanceFeed } from "@/components/profile/provenance-feed"
import { SignatureSpots } from "@/components/profile/signature-spots"
import { ValuesInAction } from "@/components/profile/values-in-action"
import { TasteMap } from "@/components/profile/taste-map"
import { SocialTrace } from "@/components/profile/social-trace"
import { StickyNav } from "@/components/profile/sticky-nav"

// Sample data matching the PRD
const sampleProfile = {
  id: "1",
  display_name: "Jordan D.",
  avatar_url: "https://placehold.co/144x144",
  bio: "Coffee, trail runs, and good books.",
  privacy: {
    show_amounts: false,
    show_dates: true,
    show_values: true,
    show_influence: true,
    show_feed: true,
  },
}

const sampleTransactions = [
  {
    id: "yeZdkr4v7dC6EwzLXzjAHJlRrVvoNpugmexAb",
    date: "2025-10-13",
    amount: 4.33,
    iso_currency_code: "USD",
    merchant_name: "Starbucks",
    merchant_entity_id: "NZAJQ5wYdo1W1p39X5q5gpb15OMe39pj4pJBb",
    logo_url: "https://plaid-merchant-logos.plaid.com/starbucks_956.png",
    website: "https://starbucks.com",
    personal_finance_category_primary: "FOOD_AND_DRINK",
    personal_finance_category_detailed: "FOOD_AND_DRINK_COFFEE",
    payment_channel: "in store",
    transaction_type: "place",
    enrichment: {
      visibility: "public",
      product_brand: "Starbucks",
      product_name: "Iced Oat Latte",
      product_image_url: "/placeholder.svg?height=360&width=640",
      product_url: "https://www.starbucks.com/menu",
      user_tags: ["local"],
      user_notes: "Neighborhood spot",
    },
  },
  {
    id: "mkBJMAmoKJFLovKnDKqwcl97jGz8pKurNz6JW",
    date: "2025-10-13",
    amount: 12,
    iso_currency_code: "USD",
    merchant_name: "McDonald's",
    merchant_entity_id: "vzWXDWBjB06j5BJoD3Jo84OJZg7JJzmqOZA22",
    logo_url: "https://plaid-merchant-logos.plaid.com/mcdonalds_619.png",
    website: "https://mcdonalds.com",
    personal_finance_category_primary: "FOOD_AND_DRINK",
    personal_finance_category_detailed: "FOOD_AND_DRINK_FAST_FOOD",
    payment_channel: "in store",
    transaction_type: "place",
    enrichment: {
      visibility: "public",
      user_tags: ["late-night"],
      user_notes: "Post-game snack",
    },
  },
  {
    id: "11DJ6WzKRJHgezj38jqXUw7aj4E1GGiDzpg1p",
    date: "2025-10-14",
    amount: -500,
    iso_currency_code: "USD",
    merchant_name: "United Airlines",
    merchant_entity_id: "NKDjqyAdQQzpyeD8qpLnX0D6yvLe2KYKYYzQ4",
    logo_url: "https://plaid-merchant-logos.plaid.com/united_airlines_1065.png",
    website: "https://united.com",
    personal_finance_category_primary: "TRAVEL",
    personal_finance_category_detailed: "TRAVEL_FLIGHTS",
    transaction_type: "special",
    enrichment: {
      visibility: "public",
      user_tags: ["travel"],
      user_notes: "Refund processed",
    },
  },
  {
    id: "E5g7V38oQ7cgxawEnw5NUPdjBkQVwwi6y4wN6",
    date: "2025-10-14",
    amount: 78.5,
    iso_currency_code: "USD",
    merchant_name: null,
    name: "Touchstone Climbing",
    logo_url: null,
    website: null,
    personal_finance_category_primary: "PERSONAL_CARE",
    personal_finance_category_detailed: "PERSONAL_CARE_GYMS_AND_FITNESS_CENTERS",
    transaction_type: "place",
    enrichment: {
      visibility: "public",
      user_tags: ["fitness"],
    },
  },
]

export default function ProfilePage({
  params,
}: {
  params: { username: string }
}) {
  return (
    <div className="min-h-screen bg-background">
      <StickyNav profile={sampleProfile} currentPage="feed" />

      <main className="mx-auto max-w-[1200px] px-6 py-8 lg:py-12">
        {/* Identity Header */}
        <ProfileHeader profile={sampleProfile} transactions={sampleTransactions} />

        {/* Main Grid: Feed + Right Rail */}
        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          {/* Provenance Feed - 8 cols on desktop */}
          <div className="lg:col-span-8">
            <ProvenanceFeed transactions={sampleTransactions} privacy={sampleProfile.privacy} isOwner={true} />
          </div>

          {/* Right Rail - 4 cols on desktop */}
          <aside className="space-y-8 lg:col-span-4">
            <SignatureSpots transactions={sampleTransactions} />
            <ValuesInAction transactions={sampleTransactions} showValues={sampleProfile.privacy.show_values} />
            <TasteMap transactions={sampleTransactions} />
            {sampleProfile.privacy.show_influence && <SocialTrace influence={{ total_inspired: 24 }} />}
          </aside>
        </div>
      </main>
    </div>
  )
}
