"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { getPropertyReviews } from "@/lib/api"
import type { Review } from "@/types/review"

interface PropertyReviewsProps {
  propertyId: string
}

export function PropertyReviews({ propertyId }: PropertyReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getPropertyReviews(propertyId)
        setReviews(data)
      } catch (error) {
        console.error("Error fetching reviews:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [propertyId])

  if (loading) {
    return <div>Loading reviews...</div>
  }

  if (reviews.length === 0) {
    return <div>No reviews yet.</div>
  }

  // Calculate average ratings
  const avgRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length

  // Count ratings by star
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => Math.round(review.rating) === star).length,
    percentage: (reviews.filter((review) => Math.round(review.rating) === star).length / reviews.length) * 100,
  }))

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-1">
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold mb-2">{avgRating.toFixed(1)}</div>
            <div className="flex mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${star <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">{reviews.length} reviews</div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="space-y-2">
            {ratingCounts.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-2">
                <div className="w-12 text-sm">{star} stars</div>
                <Progress value={percentage} className="h-2 flex-1" />
                <div className="w-12 text-sm text-right">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reviews.map((review) => (
          <div key={review.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={review.user.avatar || "/placeholder.svg"} alt={review.user.name} />
                <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{review.user.name}</div>
                <div className="text-sm text-muted-foreground">{review.date}</div>
              </div>
            </div>

            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>

            <p className="text-sm">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
