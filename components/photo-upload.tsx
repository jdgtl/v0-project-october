"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface PhotoUploadProps {
  transactionId: string
  userId: string
  existingPhotos?: Array<{ id: string; photo_url: string; thumbnail_url?: string }>
  onPhotosChange?: () => void
  maxPhotos?: number
}

export function PhotoUpload({
  transactionId,
  userId,
  existingPhotos = [],
  onPhotosChange,
  maxPhotos = 3,
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState(existingPhotos)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const remainingSlots = maxPhotos - photos.length
    if (remainingSlots <= 0) {
      alert(`Maximum ${maxPhotos} photos allowed`)
      return
    }

    setUploading(true)

    try {
      const filesToUpload = Array.from(files).slice(0, remainingSlots)

      for (const file of filesToUpload) {
        const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes
        if (file.size > MAX_FILE_SIZE) {
          alert(`File "${file.name}" exceeds 5MB limit`)
          continue
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
          alert(`File "${file.name}" is not an image`)
          continue
        }

        const formData = new FormData()
        formData.append("file", file)
        formData.append("transaction_id", transactionId)
        formData.append("display_order", photos.length.toString())

        const response = await fetch("/api/photos/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to save photo")
        }

        const { photo: photoData } = await response.json()
        setPhotos((prev) => [...prev, photoData])
      }

      onPhotosChange?.()
    } catch (error) {
      console.error("[v0] Error uploading photos:", error)
      alert("Failed to upload photos. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (photoId: string, photoUrl: string) => {
    try {
      const urlParts = photoUrl.split("/transaction-photos/")
      const filePath = urlParts.length > 1 ? urlParts[1] : null

      const response = await fetch(`/api/photos/delete?id=${photoId}&filePath=${encodeURIComponent(filePath || "")}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete photo")
      }

      setPhotos((prev) => prev.filter((p) => p.id !== photoId))
      onPhotosChange?.()
    } catch (error) {
      console.error("[v0] Error deleting photo:", error)
      alert("Failed to delete photo. Please try again.")
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg border bg-card">
            <img src={photo.photo_url || "/placeholder.svg"} alt="Transaction" className="h-full w-full object-cover" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => handleDelete(photo.id, photo.photo_url)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            {uploading ? (
              <div className="text-sm text-muted-foreground">Uploading...</div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Add Photo</span>
              </>
            )}
          </label>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {photos.length} of {maxPhotos} photos • JPG, PNG up to 5MB
      </p>
    </div>
  )
}
