import { NextResponse } from "next/server"
import { getUser, getSupabaseClient } from "@/lib/dev-auth"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const {
      data: { user },
      error: authError,
    } = await getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await getSupabaseClient()
    const dropId = params.id

    console.log("[v0] Syncing photos for drop:", dropId)

    // Get the drop and its transaction
    const { data: drop, error: dropError } = await supabase
      .from("drops")
      .select("id, transaction_id")
      .eq("id", dropId)
      .single()

    if (dropError || !drop) {
      console.error("[v0] Drop not found:", dropError)
      return NextResponse.json({ error: "Drop not found" }, { status: 404 })
    }

    console.log("[v0] Found drop with transaction_id:", drop.transaction_id)

    // Get all photos for this transaction
    const { data: transactionPhotos, error: photosError } = await supabase
      .from("transaction_photos")
      .select("id")
      .eq("transaction_id", drop.transaction_id)
      .order("display_order")

    if (photosError) {
      console.error("[v0] Error fetching transaction photos:", photosError)
      return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 })
    }

    console.log("[v0] Found", transactionPhotos?.length || 0, "transaction photos")

    if (!transactionPhotos || transactionPhotos.length === 0) {
      return NextResponse.json({ success: true, message: "No photos to sync", synced: 0 })
    }

    // Delete existing drop_photos for this drop
    const { error: deleteError } = await supabase.from("drop_photos").delete().eq("drop_id", dropId)

    if (deleteError) {
      console.error("[v0] Error deleting existing drop photos:", deleteError)
    }

    // Insert new drop_photos
    const dropPhotos = transactionPhotos.map((photo, index) => ({
      drop_id: dropId,
      photo_id: photo.id,
      display_order: index,
    }))

    const { data: insertedPhotos, error: insertError } = await supabase.from("drop_photos").insert(dropPhotos).select()

    if (insertError) {
      console.error("[v0] Error inserting drop photos:", insertError)
      return NextResponse.json({ error: "Failed to sync photos" }, { status: 500 })
    }

    console.log("[v0] Successfully synced", insertedPhotos?.length || 0, "photos to drop")

    return NextResponse.json({
      success: true,
      message: "Photos synced successfully",
      synced: insertedPhotos?.length || 0,
    })
  } catch (error) {
    console.error("[v0] Error syncing photos:", error)
    return NextResponse.json({ error: "Failed to sync photos" }, { status: 500 })
  }
}
