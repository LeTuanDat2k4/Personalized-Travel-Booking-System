"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ThumbsUp, ThumbsDown, MessageSquare, TrendingUp, TrendingDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ApiService from "@/lib/ApiService"

interface ReviewSummaryData {
  accommodation_id: number
  negative_percentage: number
  negative_summary: string
  positive_percentage: number
  positive_summary: string
  total_reviews: number
}

interface ReviewSummaryProps {
  accommodationId: string
  className?: string
}

export function ReviewSummary({ accommodationId, summaryData: initialData, className }: ReviewSummaryProps & { summaryData?: ReviewSummaryData }) {
  const [summaryData, setSummaryData] = useState<ReviewSummaryData | null>(initialData ?? null)
  const [isLoading, setIsLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReviewSummary = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await ApiService.getReviewSummary(accommodationId)

        if (response.statusCode === 200) {
          setSummaryData(response.data)
        } else if (response.statusCode === 404) {
          // No summary generated yet – treat like “no reviews”
          setSummaryData({
            accommodation_id: Number(accommodationId),
            negative_percentage: 0,
            negative_summary: "",
            positive_percentage: 0,
            positive_summary: "",
            total_reviews: 0,
          })
        } else {
          setError(response.message || "Review summary is currently unavailable.")
        }
      } catch (error) {
        console.error("Error fetching review summary:", error)
        setError("Unable to load review summary. Please try again later.")
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
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <Alert>
            <MessageSquare className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!summaryData || summaryData.total_reviews === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-500">Be the first to share your experience!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { positive_percentage, negative_percentage, positive_summary, negative_summary, total_reviews } = summaryData

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Review Summary
          <Badge variant="secondary" className="ml-auto">
            {total_reviews} {total_reviews === 1 ? "review" : "reviews"}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Sentiment */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ThumbsUp className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">Positive</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{Math.round(positive_percentage)}%</div>
          </div>

          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ThumbsDown className="h-5 w-5 text-red-600" />
              <span className="font-semibold text-red-800">Negative</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{Math.round(negative_percentage)}%</div>
          </div>
        </div>

        {/* Sentiment Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Overall Sentiment</span>
            <span>{total_reviews} total reviews</span>
          </div>
          <div className="relative">
            <Progress value={positive_percentage} className="h-3" />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
              {Math.round(positive_percentage)}% positive
            </div>
          </div>
        </div>

        <Separator />

        {/* Positive Summary */}
        {positive_summary && positive_percentage > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <h4 className="font-semibold text-green-800">What Guests Loved</h4>
              <Badge variant="outline" className="text-green-600 border-green-300">
                {Math.round(positive_percentage)}%
              </Badge>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 leading-relaxed">{positive_summary}</p>
            </div>
          </div>
        )}

        {/* Negative Summary */}
        {negative_summary && negative_percentage > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <h4 className="font-semibold text-red-800">Areas for Improvement</h4>
              <Badge variant="outline" className="text-red-600 border-red-300">
                {Math.round(negative_percentage)}%
              </Badge>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 leading-relaxed">{negative_summary}</p>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">{total_reviews}</div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{Math.round(positive_percentage)}%</div>
              <div className="text-sm text-gray-600">Positive</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">{Math.round(negative_percentage)}%</div>
              <div className="text-sm text-gray-600">Negative</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
