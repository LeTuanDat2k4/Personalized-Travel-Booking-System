"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import ApiService from "@/lib/ApiService"
import { RatingStars } from "@/components/reviews/rating-stars"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ReviewFormProps {
  propertyId: string
  reviewId?: number
  initialRating?: number
  initialComment?: string
  onSuccess: () => void
  isEditing?: boolean
}

export function ReviewForm({
  propertyId,
  reviewId,
  initialRating = 0,
  initialComment = "",
  onSuccess,
  isEditing = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating)
  const [comment, setComment] = useState(initialComment)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  useEffect(() => {
    setRating(initialRating)
    setComment(initialComment)
  }, [initialRating, initialComment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting your review.",
        variant: "destructive",
      })
      return
    }

    if (!comment.trim()) {
      toast({
        title: "Comment required",
        description: "Please enter a comment before submitting your review.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const reviewData = { rating, comment }

      if (isEditing && reviewId) {
        await ApiService.updateReview(reviewId, reviewData)
        toast({ title: "Review updated", description: "Your review has been successfully updated." })
      } else {
        await ApiService.createReview(propertyId, reviewData)
        toast({ title: "Review submitted", description: "Your review has been successfully submitted." })
      }

      onSuccess()

      if (!isEditing) {
        // Reset form if it's a new review submission
        setRating(0)
        setComment("")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Error",
        description: "There was an error submitting your review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!reviewId) return

    setIsSubmitting(true)

    try {
      await ApiService.deleteReview(reviewId)
      toast({ title: "Review deleted", description: "Your review has been successfully deleted." })
      onSuccess()
    } catch (error) {
      console.error("Error deleting review:", error)
      toast({
        title: "Error",
        description: "There was an error deleting your review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setShowConfirmDelete(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit your review" : "Write a review"}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 font-medium">Rating</div>
              <RatingStars rating={rating} onRatingChange={setRating} interactive />
            </div>

            <div>
              <label htmlFor="comment" className="mb-2 block font-medium">
                Your review
              </label>
              <Textarea
                id="comment"
                placeholder="Share your experience with this property..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            {isEditing && reviewId && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowConfirmDelete(true)}
                disabled={isSubmitting}
              >
                Delete
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : isEditing ? "Update" : "Submit"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <AlertDialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
