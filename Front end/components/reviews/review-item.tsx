"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { RatingStars } from "@/components/reviews/rating-stars"
import { ReviewForm } from "@/components/reviews/review-form"
import ApiService from "@/lib/ApiService"

interface ReviewItemProps {
  review: {
    reviewId: number
    userId: number
    username: string
    accommodationId: number
    rating: number
    comment: string
    createdAt: number[]
    updatedAt: number[] | null
  }
  propertyId: string
  onReviewUpdated: () => void
  showControls?: boolean
}

export function ReviewItem({ review, propertyId, onReviewUpdated, showControls = false }: ReviewItemProps) {
  const [isEditing, setIsEditing] = useState(false)

  const formatDate = (dateArray: number[]) => {
    if (!dateArray || dateArray.length < 3) return ""
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray
    return new Date(year, month - 1, day, hour, minute, second)
  }

  const createdDate = formatDate(review.createdAt)
  const updatedDate = review.updatedAt ? formatDate(review.updatedAt) : null
  const isReviewAuthor = ApiService.isAuthenticated() && review.userId === ApiService.getCurrentUserId()

  const handleEditSuccess = () => {
    setIsEditing(false)
    onReviewUpdated()
  }

  if (isEditing) {
    return (
      <div className="mb-8">
        <ReviewForm
          propertyId={propertyId}
          reviewId={review.reviewId}
          initialRating={review.rating}
          initialComment={review.comment}
          onSuccess={handleEditSuccess}
          isEditing
        />
        <Button variant="ghost" className="mt-2" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <div className="mb-6 pb-6 border-b last:border-b-0">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${review.username.charAt(0)}`} />
            <AvatarFallback>{review.username.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{review.username}</div>
            <div className="text-sm text-muted-foreground">
              {createdDate ? formatDistanceToNow(createdDate, { addSuffix: true }) : ""}
              {updatedDate ? " (edited)" : ""}
            </div>
          </div>
        </div>

        {(showControls || isReviewAuthor) && (
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit review</span>
            </Button>
          </div>
        )}
      </div>

      <div className="mt-2">
        <RatingStars rating={review.rating} size="sm" />
      </div>

      <p className="mt-3">{review.comment}</p>
    </div>
  )
}
