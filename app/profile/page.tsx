import { redirect } from "next/navigation"
import { getSupabaseClient } from "@/lib/dev-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Settings } from "lucide-react"
import { NavHeader } from "@/components/nav-header"
import { getUser } from "@/lib/dev-auth"
import { ProfilePhotoUpload } from "@/components/profile-photo-upload"

export default async function ProfilePage() {
  const supabase = await getSupabaseClient()

  const {
    data: { user },
  } = await getUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (!user) {
    return (
      <>
        <NavHeader />
        <div className="container mx-auto max-w-4xl px-6 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-lg font-medium">No user session found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Auth bypass is enabled, but you need to login at least once to create a session.
              </p>
              <Link href="/auth/login" className="mt-4 inline-block">
                <Button>Go to Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  // Get profile
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/welcome")
  }

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

  return (
    <>
      <NavHeader />
      <div className="container mx-auto max-w-4xl px-6 py-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <ProfilePhotoUpload
                  profilePhotoUrl={profile.profile_photo_url}
                  firstName={profile.first_name}
                  userId={profile.id}
                />
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
                <Link href="/profile/edit">
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
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
                    <p className="mt-1 text-sm text-muted-foreground">Share your first transaction to get started</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
