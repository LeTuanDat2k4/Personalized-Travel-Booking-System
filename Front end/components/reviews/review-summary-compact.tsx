"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ThumbsUp, MessageSquare } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ReviewSummary } from "./review-summary"
import ApiService from "@/lib/ApiService"

interface ReviewSummaryData {
  accommodation_id: number
  negative_percentage: number
  negative_summary: string
  positive_percentage: number
  positive_summary: string
  total_reviews: number
}

interface ReviewSummaryCompactProps {
  accommodationId: string
  className?: string
}

export function ReviewSummaryCompact({ accommodationId, className }: ReviewSummaryCompactProps) {
  const [summaryData, setSummaryData] = useState<ReviewSummaryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFullSummary, setShowFullSummary] = useState(false)

  useEffect(() => {
    const fetchReviewSummary = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await ApiService.getReviewSummary(accommodationId)

        if (response.statusCode === 200) {
          setSummaryData(response.data)
        } else if (response.statusCode === 404) {
          setSummaryData(null)
        } else {
          setError(response.message || "Review summary is currently unavailable.")
        }
      } catch (error) {
        console.error("Error fetching review summary:", error)
        setError("Unable to load review summary")
      } finally {
        setIsLoading(false)
      }
    }

    if (accommodationId) {
      fetchReviewSummary()
    }
  }, [accommodationId])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-2 w-full" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !summaryData || summaryData.total_reviews === 0) {
    return null // Don't show anything if there's an error or no reviews
  }

  const { positive_percentage, total_reviews } = summaryData

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Reviews</span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Progress value={positive_percentage} className="h-2 flex-1" />
              <span className="text-xs text-gray-600">{Math.round(positive_percentage)}%</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ThumbsUp className="h-3 w-3 text-green-600" />
              <span>{Math.round(positive_percentage)}% positive</span>
              <span>•</span>
              <span>{total_reviews} reviews</span>
            </div>
          </div>

          <Dialog open={showFullSummary} onOpenChange={setShowFullSummary}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                View Summary
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Review Summary</DialogTitle>
              </DialogHeader>
              <ReviewSummary accommodationId={accommodationId} summaryData={summaryData}/>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
