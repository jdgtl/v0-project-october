"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function followUser(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  const followingId = formData.get("user_id") as string

  if (!followingId || followingId === user.id) {
    return { error: "Invalid user ID" }
  }

  const { data: existing } = await supabase
    .from("follows")
    .select("*")
    .eq("follower_id", user.id)
    .eq("following_id", followingId)
    .maybeSingle()

  if (existing) {
    return { error: "Already following this user" }
  }

  const { error } = await supabase.from("follows").insert({
    follower_id: user.id,
    following_id: followingId,
  })

  if (error) {
    console.error("[v0] Error following user:", error.message)
    return { error: error.message }
  }

  revalidatePath(`/profile/${followingId}`)
  return { success: true }
}

export async function unfollowUser(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  const followingId = formData.get("user_id") as string

  if (!followingId) {
    return { error: "Invalid user ID" }
  }

  const { error } = await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", followingId)

  if (error) {
    console.error("[v0] Error unfollowing user:", error.message)
    return { error: error.message }
  }

  revalidatePath(`/profile/${followingId}`)
  return { success: true }
}
