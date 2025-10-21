"use client"

import { useCallback, useEffect, useState } from "react"
import { usePlaidLink } from "react-plaid-link"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface PlaidLinkButtonProps {
  onSuccess?: () => void
}

export function PlaidLinkButton({ onSuccess }: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Fetch link token on mount
  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        const response = await fetch("/api/plaid/create-link-token", {
          method: "POST",
        })
        const data = await response.json()
        if (data.link_token) {
          setLinkToken(data.link_token)
        }
      } catch (error) {
        console.error("[v0] Error fetching link token:", error)
      }
    }
    fetchLinkToken()
  }, [])

  const onPlaidSuccess = useCallback(
    async (public_token: string, metadata: any) => {
      setIsLoading(true)
      try {
        // Exchange public token for access token
        const exchangeResponse = await fetch("/api/plaid/exchange-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            public_token,
            metadata,
          }),
        })

        const exchangeData = await exchangeResponse.json()

        if (!exchangeResponse.ok) {
          throw new Error(exchangeData.error || "Failed to connect account")
        }

        // Sync transactions
        await fetch("/api/plaid/sync-transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            item_id: exchangeData.item_id,
          }),
        })

        // Refresh the page to show new transactions
        router.refresh()
        onSuccess?.()
      } catch (error) {
        console.error("[v0] Error connecting account:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [router, onSuccess],
  )

  const config = {
    token: linkToken,
    onSuccess: onPlaidSuccess,
  }

  const { open, ready } = usePlaidLink(config)

  return (
    <Button onClick={() => open()} disabled={!ready || isLoading} size="lg">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        "Connect Bank Account"
      )}
    </Button>
  )
}
