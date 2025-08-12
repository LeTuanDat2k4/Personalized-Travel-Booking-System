"use client"

import { useEffect, useState } from "react"
import { PropertyCard } from "@/components/property-card"
import { usePreferences } from "@/contexts/preferences-context"
import ApiService from "@/lib/ApiService"
import { Skeleton } from "@/components/ui/skeleton"

export function PersonalizedRecommendations() {
  const { preferences, hasCompletedOnboarding } = usePreferences()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!preferences || !hasCompletedOnboarding) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.log("Sending recommendation request with preferences:", preferences)
        const response = await ApiService.getNewUserRecommendations(preferences)
        console.log("Recommendations API response:", response)

        if (response.statusCode === 200 && response.accommodationList && response.accommodationList.length > 0) {
          // Map API response to the format expected by PropertyCard
          const mappedProperties = response.accommodationList.map((item) => ({
            id: item.accommodationId,
            name: item.name,
            description: item.description,
            propertyType: item.type,
            price: Math.round(item.pricePerNight),
            location: item.location,
            rating: item.averageRating || 0,
            reviewCount: 0, // Default if not provided
            bedrooms: 1, // Default if not provided
            images: item.photoUrl ? [item.photoUrl] : ["/placeholder.svg?height=300&width=400"],
            amenities: item.amenities ? item.amenities.split(", ") : [],
            // Add any other required fields with defaults
            discount: Math.random() > 0.7 ? Math.floor(Math.random() * 20) + 5 : null, // Random discount for some properties
          }))

          setProperties(mappedProperties)
        } else {
          console.warn("No recommendations found or invalid response format:", response)
          setError("Unable to load recommendations. Please try again later.")
        }
      } catch (err) {
        console.error("Error fetching personalized recommendations:", err)
        if (err.response) {
          console.error("API error details:", err.response.data)
        }
        setError("An error occurred while loading recommendations. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [preferences, hasCompletedOnboarding])

  if (!preferences || !hasCompletedOnboarding) {
    return null
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Recommendations for you</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden border">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Recommendations for you</h2>
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Recommendations for you</h2>
        <div className="p-4 bg-gray-50 text-gray-600 rounded-lg">
          No personalized recommendations available at this time. Please check back later.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recommendations for you</h2>
        <p className="text-sm text-gray-500">Based on your preferences</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  )
}
