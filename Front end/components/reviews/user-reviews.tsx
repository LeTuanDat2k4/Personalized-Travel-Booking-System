"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReviewItem } from "@/components/reviews/review-item"
import ApiService from "@/lib/ApiService"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface UserReviewsProps {
  userId: number
}

export function UserReviews({ userId }: UserReviewsProps) {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("recent")
  const router = useRouter()
  const reviewsPerPage = 5

  const fetchUserReviews = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getUserReviews(userId)

      if (response.statusCode === 200 && response.data) {
        setReviews(response.data)
      } else {
        setReviews([])
      }
    } catch (error) {
      console.error("Error fetching user reviews:", error)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserReviews()
  }, [userId])

  // Sort reviews based on selected criterion
  const sortReviews = (reviews: any[]) => {
    const sortedReviews = [...reviews]

    switch (sortBy) {
      case "recent":
        return sortedReviews.sort((a, b) => {
          const dateA = new Date(a.createdAt[0], a.createdAt[1] - 1, a.createdAt[2]).getTime()
          const dateB = new Date(b.createdAt[0], b.createdAt[1] - 1, b.createdAt[2]).getTime()
          return dateB - dateA // Most recent first
        })
      case "oldest":
        return sortedReviews.sort((a, b) => {
          const dateA = new Date(a.createdAt[0], a.createdAt[1] - 1, a.createdAt[2]).getTime()
          const dateB = new Date(b.createdAt[0], b.createdAt[1] - 1, b.createdAt[2]).getTime()
          return dateA - dateB // Oldest first
        })
      case "highest":
        return sortedReviews.sort((a, b) => b.rating - a.rating) // Highest rating first
      case "lowest":
        return sortedReviews.sort((a, b) => a.rating - b.rating) // Lowest rating first
      default:
        return sortedReviews
    }
  }

  const sortedReviews = sortReviews(reviews)

  // Paginate reviews
  const indexOfLastReview = currentPage * reviewsPerPage
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage
  const currentReviews = sortedReviews.slice(indexOfFirstReview, indexOfLastReview)
  const totalPages = Math.ceil(reviews.length / reviewsPerPage)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)))
  }

  const navigateToProperty = (propertyId: string) => {
    router.push(`/property/${propertyId}`)
  }

  if (loading) {
    return <div>Loading reviews...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Reviews</CardTitle>
        <CardDescription>Reviews you've left for properties</CardDescription>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You haven't written any reviews yet.</p>
            <Button onClick={() => router.push("/properties")}>Find a place to review</Button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most recent</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="highest">Highest rated</SelectItem>
                  <SelectItem value="lowest">Lowest rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {currentReviews.map((review) => (
                <div key={review.reviewId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">
                      <Button
                        variant="link"
                        className="p-0 h-auto text-left"
                        onClick={() => navigateToProperty(review.accommodationId.toString())}
                      >
                        Property #{review.accommodationId}
                      </Button>
                    </div>
                  </div>

                  <ReviewItem
                    review={review}
                    propertyId={review.accommodationId.toString()}
                    onReviewUpdated={fetchUserReviews}
                    showControls={true}
                  />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      aria-disabled={currentPage === 1}
                    />
                  </PaginationItem>

                  <PaginationItem className="flex items-center justify-center">
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      aria-disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
