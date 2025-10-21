import { createClient } from "@/lib/supabase/server"

/**
 * Get the authenticated user
 */
export async function getUser() {
  const supabase = await createClient()
  return await supabase.auth.getUser()
}

/**
 * Get Supabase client
 */
export async function getSupabaseClient() {
  return await createClient()
}
