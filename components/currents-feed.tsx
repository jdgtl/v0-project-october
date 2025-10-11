"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { Calendar, Eye, Users } from "lucide-react"
import Link from "next/link"

interface Drop {
  id: string
  caption: string | null
  created_at: string
  is_public: boolean
  view_count: number
  transaction: {
    id: string
    merchant_name: string
    amount: number
    date: string
    logo_url: string | null
    category: string[] | null
  }
  user: {
    id: string
    username: string
    first_name: string | null
    last_name: string | null
    profile_photo_url: string | null
  }
  drop_photos?: Array<{
    photo: {
      id: string
      photo_url: string
      thumbnail_url: string | null
    }
  }>
}

interface CurrentsFeedProps {
  followingDrops: Drop[]
  globalDrops: Drop[]
  hasFollowing: boolean
}

export function CurrentsFeed({ followingDrops, globalDrops, hasFollowing }: CurrentsFeedProps) {
  const [activeTab, setActiveTab] = useState<"global" | "following">(hasFollowing ? "following" : "global")

  const validFollowingDrops = followingDrops.filter((drop) => drop.transaction && drop.user)
  const validGlobalDrops = globalDrops.filter((drop) => drop.transaction && drop.user)

  const drops = activeTab === "global" ? validGlobalDrops : validFollowingDrops

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "global" | "following")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="following">Following {hasFollowing && `(${validFollowingDrops.length})`}</TabsTrigger>
        </TabsList>
      </Tabs>

      {drops.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center space-y-4">
            <Users className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">{activeTab === "following" ? "Your feed is empty" : "No drops yet"}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeTab === "following"
                  ? "Follow other users to see their drops here"
                  : "Be the first to share a drop!"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {drops.map((drop) => {
            const transaction = drop.transaction
            const dropUser = drop.user

            if (!transaction?.date) return null

            const formattedDate = format(new Date(transaction.date), "MMM d, yyyy")
            const formattedAmount = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(transaction.amount)

            const firstPhoto = drop.drop_photos?.[0]?.photo
            const photoUrl = firstPhoto?.thumbnail_url || firstPhoto?.photo_url

            return (
              <Link key={drop.id} href={`/drops/${drop.id}`}>
                <Card
                  className={`group overflow-hidden transition-all hover:shadow-lg cursor-pointer ${photoUrl ? "pb-6 pt-0" : "py-6"}`}
                >
                  {photoUrl && (
                    <div className="relative aspect-video w-full overflow-hidden">
                      <img
                        src={photoUrl || "/placeholder.svg"}
                        alt={transaction.merchant_name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <CardContent className={photoUrl ? "px-6 pt-6 pb-0" : "p-6"}>
                    {/* User info */}
                    <div className="flex items-center gap-2 mb-4">
                      {dropUser.profile_photo_url ? (
                        <img
                          src={dropUser.profile_photo_url || "/placeholder.svg"}
                          alt={dropUser.username}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {dropUser.first_name?.[0] || dropUser.username?.[0] || "?"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {dropUser.first_name} {dropUser.last_name || ""}
                        </p>
                        <p className="text-xs text-muted-foreground">@{dropUser.username}</p>
                      </div>
                    </div>

                    {/* Transaction info */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold">{transaction.merchant_name}</h3>
                        <Badge variant="default" className="text-xs">
                          Public
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">{formattedAmount}</p>
                      </div>
                    </div>

                    {drop.caption && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{drop.caption}</p>}

                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        <span>{formattedDate}</span>
                      </div>
                      {drop.view_count > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Eye className="h-3 w-3" />
                          <span>{drop.view_count} views</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
