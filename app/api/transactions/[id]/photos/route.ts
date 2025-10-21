import { type NextRequest, NextResponse } from "next/server"
import { getUser, getSupabaseClient } from "@/lib/dev-auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const {
      data: { user },
      error: authError,
    } = await getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await getSupabaseClient()
    const transactionId = params.id

    const { data: photos, error } = await supabase
      .from("transaction_photos")
      .select("*")
      .eq("transaction_id", transactionId)
      .order("display_order")

    if (error) {
      console.error("[v0] Error fetching photos:", error)
      return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 })
    }

    return NextResponse.json({ photos })
  } catch (error) {
    console.error("[v0] Error in photos fetch:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
