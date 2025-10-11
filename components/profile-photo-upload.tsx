"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"
import { useRouter } from "next/navigation"

interface ProfilePhotoUploadProps {
  profilePhotoUrl?: string | null
  firstName: string
  userId: string
}

export function ProfilePhotoUpload({ profilePhotoUrl, firstName, userId }: ProfilePhotoUploadProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const bucketResponse = await fetch("/api/setup/create-profile-bucket", {
        method: "POST",
      })

      if (!bucketResponse.ok) {
        console.error("[v0] Failed to create/verify bucket")
      }

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/profile/upload-photo", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload photo")
      }

      // Refresh the page to show the new photo
      router.refresh()
    } catch (error) {
      console.error("[v0] Error uploading profile photo:", error)
      alert("Failed to upload photo. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => fileInputRef.current?.click()}
    >
      <Avatar className="h-24 w-24">
        <AvatarImage src={profilePhotoUrl || undefined} />
        <AvatarFallback className="text-2xl">{firstName[0]}</AvatarFallback>
      </Avatar>

      {/* Hover overlay */}
      {(isHovered || isUploading) && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 transition-opacity">
          {isUploading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
    </div>
  )
}
