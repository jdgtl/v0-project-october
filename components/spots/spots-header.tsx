"use client"

import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SpotsHeaderProps {
  numRegulars: number
  numNew: number
  timeframe: "30d" | "90d" | "all"
  onTimeframeChange: (value: "30d" | "90d" | "all") => void
}

export function SpotsHeader({ numRegulars, numNew, timeframe, onTimeframeChange }: SpotsHeaderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground">Spots</h1>
        <p className="mt-2 text-pretty text-lg text-muted-foreground">Places that define you.</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="font-medium">
            {numRegulars} regular spots
          </Badge>
          <Badge variant="secondary" className="font-medium">
            {numNew} new discoveries
          </Badge>
        </div>

        <Select value={timeframe} onValueChange={(value: any) => onTimeframeChange(value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
