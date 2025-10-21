"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import {
  Building2,
  Calendar,
  Tag,
  Share2,
  ImagePlus,
  ExternalLink,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import type { Transaction } from "@/lib/types/database"
import { CreateDropModal } from "./create-drop-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PhotoUpload } from "./photo-upload"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatCategoryName } from "@/lib/utils/format-category"

interface TransactionCardProps {
  transaction: Transaction & {
    photos?: Array<{ id: string; photo_url: string; thumbnail_url?: string }>
    drop?: { id: string; created_at: string; is_public: boolean } | null
  }
  userId: string
}

export function TransactionCard({ transaction, userId }: TransactionCardProps) {
  const router = useRouter()
  const [showDropModal, setShowDropModal] = useState(false)
  const [showPhotoDialog, setShowPhotoDialog] = useState(false)
  const [photos, setPhotos] = useState(transaction.photos || [])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const existingDrop = transaction.drop

  const formattedDate = format(new Date(transaction.date), "MMM d, yyyy")
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(transaction.amount)

  const handlePhotosChange = async () => {
    try {
      const response = await fetch(`/api/transactions/${transaction.id}/photos`)
      if (response.ok) {
        const data = await response.json()
        setPhotos(data.photos || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching photos:", error)
    }
    router.refresh()
  }

  const handleCardClick = () => {
    if (existingDrop) {
      router.push(`/drops/${existingDrop.id}`)
    }
  }

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }

  return (
    <>
      <Card
        className={`group overflow-hidden transition-all hover:shadow-lg ${existingDrop ? "cursor-pointer" : ""} ${photos.length > 0 ? "pb-6 pt-0" : "py-6"}`}
        onClick={handleCardClick}
      >
        {photos.length > 0 && (
          <div className="relative aspect-video w-full overflow-hidden">
            <div
              className="flex h-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {photos.map((photo, index) => (
                <div key={photo.id} className="h-full w-full flex-shrink-0 overflow-hidden">
                  <img
                    src={photo.photo_url || "/placeholder.svg"}
                    alt={`${transaction.merchant_name || "Transaction"} - Image ${index + 1}`}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
            {photos.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 transition-opacity hover:opacity-80"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6 text-white drop-shadow-lg" />
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 transition-opacity hover:opacity-80"
                  onClick={handleNextImage}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6 text-white drop-shadow-lg" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {photos.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 w-1.5 rounded-full transition-all ${
                        index === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        <CardContent className={photos.length > 0 ? "px-6 pt-6 pb-0" : "p-6"}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                {transaction.logo_url ? (
                  <img src={transaction.logo_url || "/placeholder.svg"} alt="" className="h-6 w-6 rounded" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                )}
                <h3 className="font-semibold leading-none">{transaction.merchant_name || "Unknown Merchant"}</h3>
              </div>
              <div className="flex items-center gap-2">
                {transaction.pending && (
                  <Badge variant="secondary" className="text-xs">
                    Pending
                  </Badge>
                )}
                {existingDrop && (
                  <Badge variant="default" className="text-xs bg-primary/10 text-primary hover:bg-primary/20">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Dropped
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{formattedAmount}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
            {(transaction.personal_finance_category_detailed || transaction.category?.[0]) && (
              <div className="flex items-center gap-1.5">
                <Tag className="h-4 w-4" />
                <span>
                  {transaction.personal_finance_category_detailed
                    ? formatCategoryName(
                        transaction.personal_finance_category_detailed,
                        transaction.personal_finance_category_primary || undefined,
                      )
                    : transaction.category?.[0]}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <ImagePlus className="mr-2 h-4 w-4" />
                  {photos.length > 0 ? `Photos (${photos.length})` : "Add Photos"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manage Photos</DialogTitle>
                </DialogHeader>
                <PhotoUpload
                  transactionId={transaction.id}
                  userId={userId}
                  existingPhotos={photos}
                  onPhotosChange={handlePhotosChange}
                />
              </DialogContent>
            </Dialog>

            {existingDrop ? (
              <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                <Link href={`/drops/${existingDrop.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Drop
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
                onClick={() => setShowDropModal(true)}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share as Drop
              </Button>
            )}
          </div>

          {existingDrop && (
            <div className="mt-3 text-xs text-muted-foreground">
              Dropped on {format(new Date(existingDrop.created_at), "MMM d, yyyy")}
            </div>
          )}
        </CardContent>
      </Card>

      {!existingDrop && (
        <CreateDropModal
          transaction={transaction}
          userId={userId}
          open={showDropModal}
          onOpenChange={setShowDropModal}
        />
      )}
    </>
  )
}
