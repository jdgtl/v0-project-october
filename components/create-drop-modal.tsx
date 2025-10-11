"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Transaction } from "@/lib/types/database"
import { formatCategoryName } from "@/lib/utils/format-category"

interface CreateDropModalProps {
  transaction: Transaction
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateDropModal({ transaction, userId, open, onOpenChange }: CreateDropModalProps) {
  const [step, setStep] = useState(1)
  const [caption, setCaption] = useState("")
  const [showAmount, setShowAmount] = useState(true)
  const [showRange, setShowRange] = useState(false)
  const [showMerchant, setShowMerchant] = useState(true)
  const [showDate, setShowDate] = useState(true)
  const [showCategory, setShowCategory] = useState(true)
  const [isPublic, setIsPublic] = useState(true)
  const [photos, setPhotos] = useState<any[]>([])
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchPhotos()
      fetchUserSettings()
    }
  }, [open, transaction.id])

  const fetchPhotos = async () => {
    const { data } = await supabase
      .from("transaction_photos")
      .select("*")
      .eq("transaction_id", transaction.id)
      .order("display_order")

    if (data) {
      setPhotos(data)
      setSelectedPhotoIds(data.map((p) => p.id))
    }
  }

  const fetchUserSettings = async () => {
    const { data } = await supabase.from("users").select("default_drop_visibility").eq("id", userId).single()

    if (data?.default_drop_visibility) {
      setIsPublic(data.default_drop_visibility === "public")
    }
  }

  const handleCreateDrop = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] Creating drop with selectedPhotoIds:", selectedPhotoIds)
      console.log("[v0] Total photos available:", photos.length)

      const response = await fetch("/api/drops/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_id: transaction.id,
          caption,
          show_amount: showAmount,
          show_range: showRange,
          show_merchant: showMerchant,
          show_date: showDate,
          show_category: showCategory,
          is_public: isPublic,
          photo_ids: selectedPhotoIds,
        }),
      })

      if (!response.ok) throw new Error("Failed to create drop")

      const data = await response.json()
      console.log("[v0] Drop created, response:", data)
      router.push(`/drops/${data.drop.id}`)
      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Error creating drop:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotoIds((prev) => (prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId]))
  }

  const calculatePriceRange = (amount: number) => {
    const lowerBound = Math.floor(amount * 0.8)
    const upperBound = Math.ceil(amount * 1.2)
    return {
      lower: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(lowerBound),
      upper: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(upperBound),
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create a Drop</DialogTitle>
          <DialogDescription>Share this transaction with your followers</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-y-auto pr-2">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 w-12 rounded-full transition-colors ${
                  i === step ? "bg-primary" : i < step ? "bg-primary/50" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Add Caption & Photos */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="caption">Caption (optional)</Label>
                <Textarea
                  id="caption"
                  placeholder="Share your thoughts about this purchase..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                />
              </div>

              {photos.length > 0 && (
                <div className="space-y-2">
                  <Label>Photos to Include</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative">
                        <div
                          className={`cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                            selectedPhotoIds.includes(photo.id) ? "border-primary" : "border-transparent"
                          }`}
                          onClick={() => togglePhotoSelection(photo.id)}
                        >
                          <img
                            src={photo.photo_url || "/placeholder.svg"}
                            alt="Transaction"
                            className="aspect-square object-cover"
                          />
                        </div>
                        <Checkbox
                          checked={selectedPhotoIds.includes(photo.id)}
                          onCheckedChange={() => togglePhotoSelection(photo.id)}
                          className="absolute right-2 top-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={() => setStep(2)} className="w-full">
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Privacy Settings */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div className="space-y-0.5">
                    <Label>Public Drop</Label>
                    <p className="text-sm text-muted-foreground">Make this drop visible to everyone</p>
                  </div>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Amount</Label>
                    <p className="text-sm text-muted-foreground">Display the exact purchase amount</p>
                  </div>
                  <Switch checked={showAmount} onCheckedChange={setShowAmount} />
                </div>
                {showAmount && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show as Range</Label>
                      <p className="text-sm text-muted-foreground">Display amount as ±20% range for negotiation</p>
                    </div>
                    <Switch checked={showRange} onCheckedChange={setShowRange} />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Merchant</Label>
                    <p className="text-sm text-muted-foreground">Display where you made the purchase</p>
                  </div>
                  <Switch checked={showMerchant} onCheckedChange={setShowMerchant} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Date</Label>
                    <p className="text-sm text-muted-foreground">Display when you made the purchase</p>
                  </div>
                  <Switch checked={showDate} onCheckedChange={setShowDate} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Category</Label>
                    <p className="text-sm text-muted-foreground">Display the transaction category</p>
                  </div>
                  <Switch checked={showCategory} onCheckedChange={setShowCategory} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Preview & Confirm */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Preview</Label>
                <Card className="overflow-hidden">
                  {selectedPhotoIds.length > 0 && (
                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                      <div className="flex h-full">
                        {photos
                          .filter((p) => selectedPhotoIds.includes(p.id))
                          .map((photo, index) => (
                            <div key={photo.id} className="relative h-full w-full flex-shrink-0 overflow-hidden">
                              <img
                                src={photo.photo_url || "/placeholder.svg"}
                                alt={`Preview ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                      </div>
                      {selectedPhotoIds.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                          {photos
                            .filter((p) => selectedPhotoIds.includes(p.id))
                            .map((photo, index) => (
                              <div
                                key={photo.id}
                                className={`h-1.5 rounded-full transition-all ${
                                  index === 0 ? "w-6 bg-white" : "w-1.5 bg-white/50"
                                }`}
                              />
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {showMerchant && (
                        <h3 className="text-xl font-semibold">{transaction.merchant_name || "Unknown Merchant"}</h3>
                      )}
                      {showAmount && (
                        <p className="text-2xl font-bold text-primary">
                          {showRange
                            ? (() => {
                                const range = calculatePriceRange(transaction.amount)
                                return `${range.lower} - ${range.upper}`
                              })()
                            : new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                              }).format(transaction.amount)}
                        </p>
                      )}
                      {caption && <p className="text-muted-foreground">{caption}</p>}
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        {showDate && <span>{new Date(transaction.date).toLocaleDateString()}</span>}
                        {showCategory &&
                          (transaction.personal_finance_category_detailed || transaction.category?.[0]) && (
                            <span>
                              •{" "}
                              {transaction.personal_finance_category_detailed
                                ? formatCategoryName(
                                    transaction.personal_finance_category_detailed,
                                    transaction.personal_finance_category_primary || undefined,
                                  )
                                : transaction.category?.[0]}
                            </span>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleCreateDrop} disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    "Creating..."
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Create Drop
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
