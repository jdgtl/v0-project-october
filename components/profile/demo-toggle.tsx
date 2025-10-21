"use client"

import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"

interface DemoToggleProps {
  isOwner: boolean
  onToggle: (value: boolean) => void
}

export function DemoToggle({ isOwner, onToggle }: DemoToggleProps) {
  return (
    <div className="fixed right-6 top-6 z-50">
      <Card className="border-2 border-primary/20 bg-background/95 p-4 shadow-lg backdrop-blur">
        <div className="flex items-center gap-3">
          {isOwner ? <Eye className="h-5 w-5 text-primary" /> : <EyeOff className="h-5 w-5 text-muted-foreground" />}
          <div className="flex items-center gap-2">
            <Switch id="demo-mode" checked={isOwner} onCheckedChange={onToggle} />
            <Label htmlFor="demo-mode" className="cursor-pointer text-sm font-medium">
              {isOwner ? "Owner View" : "Visitor View"}
            </Label>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {isOwner ? "Hover cards to see Edit buttons" : "Viewing as a visitor"}
        </p>
      </Card>
    </div>
  )
}
