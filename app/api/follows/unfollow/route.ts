import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const followingId = formData.get("user_id") as string

    if (!followingId) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const { error } = await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", followingId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error unfollowing user:", error)
    return NextResponse.json({ error: "Failed to unfollow user" }, { status: 500 })
  }
}
