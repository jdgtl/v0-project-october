"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PlaidLinkButton } from "@/components/plaid-link-button"
import { Building2, Trash2, AlertTriangle, Archive, Loader2, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface PlaidItem {
  id: string
  institution_name: string
  plaid_item_id: string
}

interface ConnectedAccountsCardProps {
  plaidItems: PlaidItem[]
}

interface AccountDetails {
  transaction_count: number
  drops_count: number
}

export function ConnectedAccountsCard({ plaidItems }: ConnectedAccountsCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = useState<PlaidItem | null>(null)
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null)
  const [deletionType, setDeletionType] = useState<"archive" | "permanent" | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  const handleSyncTransactions = async (item: PlaidItem) => {
    setIsSyncing(item.id)

    try {
      const response = await fetch("/api/plaid/sync-transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_id: item.plaid_item_id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync transactions")
      }

      toast({
        title: "Transactions synced",
        description: `Successfully synced ${data.transactions_synced} transactions`,
      })

      router.refresh()
    } catch (error) {
      console.error("[v0] Error syncing transactions:", error)
      toast({
        title: "Sync failed",
        description: "Failed to sync transactions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(null)
    }
  }

  const handleOpenDialog = async (item: PlaidItem) => {
    setItemToDelete(item)
    setIsLoadingDetails(true)

    try {
      const response = await fetch("/api/plaid/account-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plaid_item_id: item.id }),
      })

      if (response.ok) {
        const details = await response.json()
        setAccountDetails(details)
      }
    } catch (error) {
      console.error("[v0] Error fetching account details:", error)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleRemoveAccount = async () => {
    if (!itemToDelete || !deletionType) return

    setIsDeleting(itemToDelete.id)

    try {
      const response = await fetch("/api/plaid/remove-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plaid_item_id: itemToDelete.id,
          deletion_type: deletionType,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to remove account")
      }

      router.refresh()
    } catch (error) {
      console.error("[v0] Error removing account:", error)
      alert("Failed to remove account. Please try again.")
    } finally {
      setIsDeleting(null)
      setItemToDelete(null)
      setAccountDetails(null)
      setDeletionType(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Manage your linked bank accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {plaidItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{item.institution_name}</p>
                  <p className="text-sm text-muted-foreground">Connected</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSyncTransactions(item)}
                  disabled={isSyncing === item.id || isDeleting === item.id}
                  className="text-primary hover:bg-primary/10 hover:text-primary"
                  title="Sync transactions"
                >
                  {isSyncing === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenDialog(item)}
                  disabled={isDeleting === item.id || isSyncing === item.id}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  title="Remove account"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <PlaidLinkButton />
        </CardContent>
      </Card>

      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setItemToDelete(null)
            setAccountDetails(null)
            setDeletionType(null)
          }
        }}
      >
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Account: {itemToDelete?.institution_name}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-4">
              {isLoadingDetails ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {accountDetails && (
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <div className="text-sm font-medium text-foreground">This account has:</div>
                      <div className="mt-2 space-y-1 text-sm text-foreground">
                        <div>• {accountDetails.transaction_count} transactions</div>
                        <div>• {accountDetails.drops_count} public Drops shared</div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="text-sm font-medium text-foreground">Choose what to do with your data:</div>

                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setDeletionType("archive")}
                        className={`w-full rounded-lg border p-4 text-left transition-colors ${
                          deletionType === "archive" ? "border-primary bg-accent" : "border-border hover:bg-accent/50"
                        }`}
                      >
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center gap-2">
                            <Archive className="h-4 w-4 text-primary" />
                            <span className="font-medium text-foreground">Archive (Recommended)</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Transactions hidden from dashboard but public Drops remain accessible. Can restore if you
                            reconnect.
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletionType("permanent")}
                        className={`w-full rounded-lg border p-4 text-left transition-colors ${
                          deletionType === "permanent"
                            ? "border-destructive bg-accent"
                            : "border-border hover:bg-accent/50"
                        }`}
                      >
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center gap-2">
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="font-medium text-foreground">Permanently Delete</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            All transactions and associated Drops deleted forever. Cannot be undone.
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {deletionType === "permanent" && accountDetails && accountDetails.drops_count > 0 && (
                    <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                      <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-destructive">Warning: This will delete your Drops</div>
                        <div className="text-sm text-destructive/90">
                          You have {accountDetails.drops_count} public Drop{accountDetails.drops_count > 1 ? "s" : ""}{" "}
                          that will be permanently deleted. Any links you've shared will no longer work.
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting === itemToDelete?.id}>Cancel</AlertDialogCancel>
            <Button
              onClick={handleRemoveAccount}
              disabled={isDeleting === itemToDelete?.id || isLoadingDetails || !deletionType}
              variant={deletionType === "permanent" ? "destructive" : "default"}
            >
              {isDeleting === itemToDelete?.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : deletionType === "archive" ? (
                "Archive Account"
              ) : deletionType === "permanent" ? (
                "Permanently Delete"
              ) : (
                "Select an option"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
