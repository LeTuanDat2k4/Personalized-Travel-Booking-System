import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

interface RecommendationBadgeProps {
  reason: string
  className?: string
}

export function RecommendationBadge({ reason, className }: RecommendationBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 ${className}`}>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-2 py-0.5 text-xs">
              Recommended
            </Badge>
            <Info className="h-3.5 w-3.5 text-green-600" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{reason}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
