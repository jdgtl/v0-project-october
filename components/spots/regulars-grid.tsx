"use client"

import { useState } from "react"
import { SpotCard } from "./spot-card"
import { MerchantDetailDrawer } from "./merchant-detail-drawer"

interface RegularsGridProps {
  merchants: any[]
  isOwner: boolean
  transactions: any[]
}

export function RegularsGrid({ merchants, isOwner, transactions }: RegularsGridProps) {
  const [selectedMerchant, setSelectedMerchant] = useState<any | null>(null)

  if (merchants.length === 0) return null

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Where you're a regular</h2>
          <p className="mt-1 text-muted-foreground">Places you visit frequently</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {merchants.map((merchant) => (
            <SpotCard
              key={merchant.merchant_entity_id}
              merchant={merchant}
              isOwner={isOwner}
              onClick={() => setSelectedMerchant(merchant)}
            />
          ))}
        </div>
      </div>

      {selectedMerchant && (
        <MerchantDetailDrawer
          merchant={selectedMerchant}
          transactions={transactions.filter((t) => t.merchant_name === selectedMerchant.merchant_name)}
          isOwner={isOwner}
          onClose={() => setSelectedMerchant(null)}
        />
      )}
    </>
  )
}
