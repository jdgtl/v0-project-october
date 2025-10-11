import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Settings } from "lucide-react"

export default async function ProfilePage({ params }: { params: { id: string } }) {
  if (params.id === "edit") {
    notFound()
  }

  const supabase = await createClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id)

  // Get profile user
  const { data: profile, error } = await supabase
    .from("users")
    .select("*")
    .or(isUUID ? `id.eq.${params.id},username.eq.${params.id}` : `username.eq.${params.id}`)
    .single()

  if (error || !profile) {
    notFound()
  }

  const isOwnProfile = currentUser?.id === profile.id

  // Get drops
  const { data: drops } = await supabase
    .from("drops")
    .select(
      `
      *,
      transaction:transactions(*)
    `,
    )
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false })

  // Get follower/following counts
  const { count: followersCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", profile.id)

  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", profile.id)

  // Check if current user follows this profile
  const { data: followData } = currentUser
    ? await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", currentUser.id)
        .eq("following_id", profile.id)
        .single()
    : { data: null }

  const isFollowing = !!followData

  return (
    <div className="min-h-svh bg-background">
      <div className="container mx-auto max-w-4xl px-6 py-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.profile_photo_url || undefined} />
                  <AvatarFallback className="text-2xl">{profile.first_name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold">
                      {profile.first_name} {profile.last_name || ""}
                    </h1>
                    {profile.username && <p className="text-muted-foreground">@{profile.username}</p>}
                  </div>
                  {profile.bio && <p className="text-muted-foreground">{profile.bio}</p>}
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="font-semibold">{followersCount || 0}</span>{" "}
                      <span className="text-muted-foreground">Followers</span>
                    </div>
                    <div>
                      <span className="font-semibold">{followingCount || 0}</span>{" "}
                      <span className="text-muted-foreground">Following</span>
                    </div>
                    <div>
                      <span className="font-semibold">{drops?.length || 0}</span>{" "}
                      <span className="text-muted-foreground">Drops</span>
                    </div>
                  </div>
                </div>
                {isOwnProfile ? (
                  <Button variant="outline" asChild>
                    <Link href="/profile/edit">
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Link>
                  </Button>
                ) : (
                  <form action={`/api/follows/${isFollowing ? "unfollow" : "follow"}`} method="POST">
                    <input type="hidden" name="user_id" value={profile.id} />
                    <Button type="submit" variant={isFollowing ? "outline" : "default"}>
                      {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Drops */}
          <Tabs defaultValue="drops">
            <TabsList>
              <TabsTrigger value="drops">Drops</TabsTrigger>
            </TabsList>
            <TabsContent value="drops" className="mt-6">
              {drops && drops.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {drops.map((drop: any) => (
                    <Link key={drop.id} href={`/drops/${drop.id}`}>
                      <Card className="group transition-all hover:shadow-lg">
                        <CardContent className="p-6">
                          <div className="space-y-2">
                            {drop.show_merchant && (
                              <h3 className="font-semibold">{drop.transaction.merchant_name || "Unknown Merchant"}</h3>
                            )}
                            {drop.show_amount && (
                              <p className="text-xl font-bold text-primary">
                                {drop.show_range
                                  ? `$${Math.floor(drop.transaction.amount / 100) * 100} - $${Math.ceil(drop.transaction.amount / 100) * 100}`
                                  : new Intl.NumberFormat("en-US", {
                                      style: "currency",
                                      currency: "USD",
                                    }).format(drop.transaction.amount)}
                              </p>
                            )}
                            {drop.caption && (
                              <p className="line-clamp-2 text-sm text-muted-foreground">{drop.caption}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
                  <div className="text-center">
                    <p className="text-lg font-medium">No drops yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {isOwnProfile
                        ? "Share your first transaction to get started"
                        : "This user hasn't shared any drops"}
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
