"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingStarsProps {
  rating: number
  onRatingChange?: (rating: number) => void
  interactive?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function RatingStars({ rating, onRatingChange, interactive = false, size = "md", className }: RatingStarsProps) {
  const maxRating = 5

  // Size classes for the star icons
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  const handleClick = (newRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(newRating)
    }
  }

  const handleMouseEnter = (starIndex: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex)
    }
  }

  return (
    <div className={cn("flex items-center", interactive ? "cursor-pointer" : "", className)}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1
        const filled = starValue <= rating

        return (
          <Star
            key={index}
            className={cn(
              sizeClasses[size],
              "transition-colors",
              filled ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
              interactive && "hover:text-yellow-400",
            )}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            data-testid={`star-${starValue}`}
          />
        )
      })}
    </div>
  )
}
