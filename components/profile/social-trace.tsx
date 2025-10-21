import { Card } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

interface SocialTraceProps {
  influence: {
    total_inspired: number
  }
}

export function SocialTrace({ influence }: SocialTraceProps) {
  if (!influence.total_inspired) return null

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">Social Trace</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your purchases have inspired{" "}
            <span className="font-semibold text-foreground">{influence.total_inspired}</span> others
          </p>
        </div>
      </div>
    </Card>
  )
}
