import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface SignatureSpotsProps {
  transactions: any[]
}

export function SignatureSpots({ transactions }: SignatureSpotsProps) {
  // Compute top merchants by visit count
  const merchantCounts = transactions.reduce(
    (acc, txn) => {
      const merchantId = txn.merchant_entity_id || txn.merchant_name
      if (!merchantId) return acc

      if (!acc[merchantId]) {
        acc[merchantId] = {
          name: txn.merchant_name || txn.name,
          logo: txn.logo_url,
          count: 0,
        }
      }
      acc[merchantId].count++
      return acc
    },
    {} as Record<string, { name: string; logo: string | null; count: number }>,
  )

  const topMerchants = Object.values(merchantCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  if (topMerchants.length === 0) return null

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground">Signature Spots</h3>
      <p className="mt-1 text-sm text-muted-foreground">Places that define you</p>

      <div className="mt-6 space-y-4">
        {topMerchants.map((merchant, idx) => (
          <div key={idx} className="flex items-center gap-3">
            {merchant.logo ? (
              <div className="relative h-8 w-8 overflow-hidden rounded">
                <Image src={merchant.logo || "/placeholder.svg"} alt={merchant.name} fill className="object-contain" />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-sm font-semibold">
                {merchant.name[0]}
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{merchant.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {merchant.count} visits
              </Badge>
              {merchant.count >= 5 && (
                <Badge variant="outline" className="text-xs">
                  Regular
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
