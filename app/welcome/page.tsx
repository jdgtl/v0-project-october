"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function WelcomePage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get user data from auth metadata
    const getUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.user_metadata?.first_name) {
        setFirstName(user.user_metadata.first_name)
      }
      if (user?.user_metadata?.last_name) {
        setLastName(user.user_metadata.last_name)
      }
    }
    getUserData()
  }, [supabase.auth])

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      // Create user profile
      const { error: profileError } = await supabase.from("users").insert({
        id: user.id,
        email: user.email!,
        first_name: firstName,
        last_name: lastName || null,
        username: username || null,
        bio: bio || null,
      })

      if (profileError) throw profileError

      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Complete your profile</CardTitle>
            <CardDescription>Tell us a bit about yourself to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCompleteProfile}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input
                    id="first-name"
                    type="text"
                    placeholder="John"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input
                    id="last-name"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username (optional)</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Choose a unique username for your profile URL</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio (optional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating profile..." : "Continue"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
