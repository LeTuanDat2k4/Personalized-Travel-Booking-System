"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReviewForm } from "@/components/reviews/review-form"
import { ReviewList } from "@/components/reviews/review-list"
import ApiService from "@/lib/ApiService"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface PropertyReviewsProps {
  propertyId: string
}

export function PropertyReviews({ propertyId }: PropertyReviewsProps) {
  const [activeTab, setActiveTab] = useState("view")
  const router = useRouter()
  const isAuthenticated = ApiService.isAuthenticated()

  const handleReviewSuccess = () => {
    setActiveTab("view")
  }

  const handleLoginClick = () => {
    router.push(`/auth/login?redirect=${encodeURIComponent(`/property/${propertyId}`)}`)
  }

  return (
    <div>
      <Tabs defaultValue="view" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="view">Read Reviews</TabsTrigger>
          <TabsTrigger value="write" disabled={!isAuthenticated}>
            Write a Review
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view">
          <ReviewList propertyId={propertyId} />
        </TabsContent>

        <TabsContent value="write">
          {isAuthenticated ? (
            <ReviewForm propertyId={propertyId} onSuccess={handleReviewSuccess} />
          ) : (
            <div className="p-8 text-center">
              <p className="mb-4">Please log in to leave a review</p>
              <Button onClick={handleLoginClick}>Log In</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {!isAuthenticated && (
        <div className="mt-6 p-4 bg-muted rounded-lg text-center">
          <p className="mb-2">Want to share your experience?</p>
          <Button onClick={handleLoginClick}>Log in to write a review</Button>
        </div>
      )}
    </div>
  )
}
