"use client"

import { useState, useEffect } from "react"
import { ReviewItem } from "@/components/reviews/review-item"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ApiService from "@/lib/ApiService"

interface ReviewListProps {
  propertyId: string
  showControls?: boolean
}

export function ReviewList({ propertyId, showControls = false }: ReviewListProps) {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("recent")
  const reviewsPerPage = 5

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getAccommodationReviews(propertyId)

      if (response.statusCode === 200 && response.data) {
        setReviews(response.data)
      } else {
        setReviews([])
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [propertyId])

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

  if (loading) {
    return <div className="p-4">Loading reviews...</div>
  }

  if (reviews.length === 0) {
    return <div className="p-4 text-muted-foreground">No reviews yet. Be the first to leave a review!</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">
          {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
        </h3>

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

      <div>
        {currentReviews.map((review) => (
          <ReviewItem
            key={review.reviewId}
            review={review}
            propertyId={propertyId}
            onReviewUpdated={fetchReviews}
            showControls={showControls}
          />
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
    </div>
  )
}
