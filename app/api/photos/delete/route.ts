import { type NextRequest, NextResponse } from "next/server"
import { getUser, getSupabaseClient } from "@/lib/dev-auth"

export async function DELETE(request: NextRequest) {
  try {
    const {
      data: { user },
      error: authError,
    } = await getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get("id")
    const filePath = searchParams.get("filePath")

    if (!photoId) {
      return NextResponse.json({ error: "Missing photo ID" }, { status: 400 })
    }

    const { error: dropPhotoError } = await supabase.from("drop_photos").delete().eq("photo_id", photoId)

    if (dropPhotoError) {
      console.error("[v0] Error deleting from drop_photos:", dropPhotoError)
      // Continue with deletion even if this fails
    }

    if (filePath) {
      const { error: storageError } = await supabase.storage.from("transaction-photos").remove([filePath])

      if (storageError) {
        console.error("[v0] Error deleting from storage:", storageError)
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete from database
    const { error: dbError } = await supabase.from("transaction_photos").delete().eq("id", photoId)

    if (dbError) {
      console.error("[v0] Error deleting photo:", dbError)
      return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in photo delete:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
