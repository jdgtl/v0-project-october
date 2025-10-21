import { redirect } from "next/navigation"
import { getSupabaseClient } from "@/lib/dev-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import NavHeader from "@/components/nav-header"
import Link from "next/link"
import { getUser } from "@/lib/dev-auth"

export default async function EditProfilePage() {
  const supabase = await getSupabaseClient()

  const {
    data: { user },
  } = await getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle()

  if (!profile) {
    redirect("/welcome")
  }

  async function updateProfile(formData: FormData) {
    "use server"
    const supabase = await getSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const firstName = formData.get("first_name") as string
    const lastName = formData.get("last_name") as string
    const bio = formData.get("bio") as string

    await supabase
      .from("users")
      .update({
        first_name: firstName,
        last_name: lastName,
        bio: bio,
      })
      .eq("id", user.id)

    redirect("/profile")
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateProfile} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={profile.username} disabled className="bg-muted" />
                <p className="text-sm text-muted-foreground">Username cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  defaultValue={profile.first_name || ""}
                  placeholder="Your first name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  defaultValue={profile.last_name || ""}
                  placeholder="Your last name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  defaultValue={profile.bio || ""}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit">Save Changes</Button>
                <Link href="/profile">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
