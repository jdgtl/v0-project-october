import { type NextRequest, NextResponse } from "next/server"
import { getUser, getSupabaseClient } from "@/lib/dev-auth"

export async function POST(request: NextRequest) {
  try {
    const {
      data: { user },
      error: authError,
    } = await getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await getSupabaseClient()
    const formData = await request.formData()

    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 })
    }

    // Validate file size (5MB max)
    const MAX_FILE_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
    }

    // Delete old profile photo if it exists
    const { data: currentProfile } = await supabase.from("users").select("profile_photo_url").eq("id", user.id).single()

    if (currentProfile?.profile_photo_url) {
      // Extract file path from URL and delete
      const oldFileName = currentProfile.profile_photo_url.split("/profile-photos/").pop()
      if (oldFileName) {
        await supabase.storage.from("profile-photos").remove([oldFileName])
      }
    }

    // Upload new file
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage.from("profile-photos").upload(fileName, file)

    if (uploadError) {
      console.error("[v0] Error uploading profile photo:", uploadError)
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-photos").getPublicUrl(fileName)

    // Update user profile
    const { error: updateError } = await supabase
      .from("users")
      .update({ profile_photo_url: publicUrl })
      .eq("id", user.id)

    if (updateError) {
      console.error("[v0] Error updating profile:", updateError)
      // Clean up uploaded file
      await supabase.storage.from("profile-photos").remove([fileName])
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({ profile_photo_url: publicUrl })
  } catch (error) {
    console.error("[v0] Error in profile photo upload:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
