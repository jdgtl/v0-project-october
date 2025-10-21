"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface StickyNavProps {
  profile: {
    display_name: string
    avatar_url: string
  }
  currentPage?: "feed" | "spots" | "values"
}

export function StickyNav({ profile, currentPage = "feed" }: StickyNavProps) {
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 120)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!isSticky) return null

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto max-w-[1200px] px-6 py-3">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.display_name} />
            <AvatarFallback>{profile.display_name[0]}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-foreground">{profile.display_name}</span>
          <div className="ml-auto flex gap-2">
            <Link href="/profile/alex">
              <Badge
                variant={currentPage === "feed" ? "secondary" : "ghost"}
                className="cursor-pointer hover:bg-accent"
              >
                Feed
              </Badge>
            </Link>
            <Link href="/spots">
              <Badge
                variant={currentPage === "spots" ? "secondary" : "ghost"}
                className="cursor-pointer hover:bg-accent"
              >
                Spots
              </Badge>
            </Link>
            <Badge variant="ghost" className="cursor-pointer hover:bg-accent">
              Values
            </Badge>
          </div>
        </div>
      </div>
    </nav>
  )
}
