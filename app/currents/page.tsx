import { getSupabaseClient } from "@/lib/dev-auth"
import { redirect } from "next/navigation"
import { NavHeader } from "@/components/nav-header"
import { getUser } from "@/lib/dev-auth"
import { CurrentsFeed } from "@/components/currents-feed"

export default async function CurrentsPage() {
  const supabase = await getSupabaseClient()

  const {
    data: { user },
  } = await getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: following } = await supabase.from("follows").select("following_id").eq("follower_id", user.id)

  const followingIds = following?.map((f) => f.following_id) || []

  // Fetch drops from users the current user follows
  let followingDrops: any[] = []
  if (followingIds.length > 0) {
    const { data } = await supabase
      .from("drops")
      .select(
        `
        *,
        transaction:transactions(
          id,
          merchant_name,
          amount,
          date,
          logo_url,
          category
        ),
        user:users!drops_user_id_fkey(
          id,
          username,
          first_name,
          last_name,
          profile_photo_url
        ),
        drop_photos(
          photo:transaction_photos(
            id,
            photo_url,
            thumbnail_url
          )
        )
      `,
      )
      .eq("is_public", true)
      .in("user_id", followingIds)
      .order("created_at", { ascending: false })

    followingDrops = data || []
  }

  const { data: globalData } = await supabase
    .from("drops")
    .select(
      `
      *,
      transaction:transactions(
        id,
        merchant_name,
        amount,
        date,
        logo_url,
        category
      ),
      user:users!drops_user_id_fkey(
        id,
        username,
        first_name,
        last_name,
        profile_photo_url
      ),
      drop_photos(
        photo:transaction_photos(
          id,
          photo_url,
          thumbnail_url
        )
      )
    `,
    )
    .eq("is_public", true)
    // NOTE: Removed .neq("user_id", user.id) to include own drops for testing
    .order("created_at", { ascending: false })
    .limit(50)

  const globalDrops = globalData || []

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Currents</h1>
          <p className="text-muted-foreground">Discover drops from the community</p>
        </div>

        <CurrentsFeed
          followingDrops={followingDrops}
          globalDrops={globalDrops}
          hasFollowing={followingIds.length > 0}
        />
      </div>
    </div>
  )
}
