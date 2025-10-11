"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function BackfillCategoriesButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleBackfill = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/transactions/backfill-categories", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        console.log("[v0] Backfill complete:", data)
        router.refresh()
      } else {
        console.error("[v0] Backfill failed:", data.error)
      }
    } catch (error) {
      console.error("[v0] Error backfilling categories:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleBackfill} disabled={loading} variant="outline" size="sm">
      <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Updating Categories..." : "Update Categories"}
    </Button>
  )
}
