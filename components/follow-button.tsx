"use client"

import { Button } from "@/components/ui/button"
import { useTransition } from "react"
import { followUser, unfollowUser } from "@/app/profile/[id]/actions"
import { useToast } from "@/hooks/use-toast"

interface FollowButtonProps {
  userId: string
  isFollowing: boolean
}

export function FollowButton({ userId, isFollowing }: FollowButtonProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleFollow = () => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append("user_id", userId)

      const result = isFollowing ? await unfollowUser(formData) : await followUser(formData)

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: isFollowing ? "Unfollowed user" : "Following user",
        })
      }
    })
  }

  return (
    <Button
      type="button"
      onClick={handleFollow}
      disabled={isPending}
      variant={isFollowing ? "outline" : "default"}
      className="cursor-pointer"
    >
      {isPending ? (isFollowing ? "Unfollowing..." : "Following...") : isFollowing ? "Unfollow" : "Follow"}
    </Button>
  )
}
