import { NextResponse } from "next/server"
import { getUser, getSupabaseClient } from "@/lib/dev-auth"

export async function POST(request: Request) {
  try {
    const {
      data: { user },
      error: authError,
    } = await getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await getSupabaseClient()

    const body = await request.json()
    const { transaction_id, caption, show_amount, show_range, show_merchant, show_date, show_category, photo_ids } =
      body

    console.log("[v0] Creating drop with data:", {
      transaction_id,
      photo_ids,
      photo_ids_length: photo_ids?.length,
      photo_ids_type: typeof photo_ids,
      photo_ids_is_array: Array.isArray(photo_ids),
    })

    // Create drop
    const { data: drop, error: dropError } = await supabase
      .from("drops")
      .insert({
        user_id: user.id,
        transaction_id,
        caption: caption || null,
        show_amount: show_amount ?? true,
        show_range: show_range ?? false,
        show_merchant: show_merchant ?? true,
        show_date: show_date ?? true,
        show_category: show_category ?? true,
        is_public: true,
      })
      .select()
      .single()

    if (dropError) {
      console.error("[v0] Drop creation error:", dropError)
      throw dropError
    }

    console.log("[v0] Drop created successfully:", drop.id)

    if (photo_ids && photo_ids.length > 0) {
      console.log("[v0] Attempting to link photos:", photo_ids)

      const dropPhotos = photo_ids.map((photo_id: string, index: number) => ({
        drop_id: drop.id,
        photo_id,
        display_order: index,
      }))

      console.log("[v0] Drop photos to insert:", dropPhotos)

      const { data: insertedPhotos, error: photosError } = await supabase
        .from("drop_photos")
        .insert(dropPhotos)
        .select()

      if (photosError) {
        console.error("[v0] Error linking photos to drop:", photosError)
        // Don't fail the entire request if photo linking fails
      } else {
        console.log("[v0] Successfully linked photos:", insertedPhotos)
        console.log("[v0] Linked", photo_ids.length, "photos to drop")
      }
    } else {
      console.log("[v0] No photos to link - photo_ids:", photo_ids)
    }

    return NextResponse.json({ success: true, drop })
  } catch (error) {
    console.error("[v0] Error creating drop:", error)
    return NextResponse.json({ error: "Failed to create drop" }, { status: 500 })
  }
}
