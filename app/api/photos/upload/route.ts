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
    const transaction_id = formData.get("transaction_id") as string
    const display_order = formData.get("display_order") as string

    if (!file || !transaction_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate file size (5MB max)
    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
    }

    // Upload file to Supabase Storage using service role client (bypasses RLS)
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}/${transaction_id}/${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("transaction-photos")
      .upload(fileName, file)

    if (uploadError) {
      console.error("[v0] Error uploading to storage:", uploadError)
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("transaction-photos").getPublicUrl(fileName)

    // Insert photo record into database
    const { data: photoData, error: dbError } = await supabase
      .from("transaction_photos")
      .insert({
        transaction_id,
        user_id: user.id,
        photo_url: publicUrl,
        thumbnail_url: publicUrl,
        display_order: Number.parseInt(display_order) || 0,
      })
      .select()
      .single()

    if (dbError) {
      console.error("[v0] Error inserting photo:", dbError)
      // Clean up uploaded file if database insert fails
      await supabase.storage.from("transaction-photos").remove([fileName])
      return NextResponse.json({ error: "Failed to save photo" }, { status: 500 })
    }

    const { data: existingDrop } = await supabase
      .from("drops")
      .select("id")
      .eq("transaction_id", transaction_id)
      .single()

    if (existingDrop) {
      // Add the new photo to the existing drop
      await supabase.from("drop_photos").insert({
        drop_id: existingDrop.id,
        photo_id: photoData.id,
      })
      console.log("[v0] Added photo to existing drop:", existingDrop.id)
    }

    return NextResponse.json({ photo: photoData })
  } catch (error) {
    console.error("[v0] Error in photo upload:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
