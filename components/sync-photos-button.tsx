"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

interface SyncPhotosButtonProps {
  dropId: string
}

export function SyncPhotosButton({ dropId }: SyncPhotosButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSync = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/drops/${dropId}/sync-photos`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to sync photos")
      }

      const data = await response.json()
      console.log("[v0] Sync result:", data)

      // Refresh the page to show the synced photos
      router.refresh()
    } catch (error) {
      console.error("[v0] Error syncing photos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleSync} disabled={isLoading} size="sm" variant="outline">
      <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      {isLoading ? "Syncing..." : "Sync Photos from Transaction"}
    </Button>
  )
}
