"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Heart, Share, MapPin, Star, Users, Bed, Bath, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPropertyById } from "@/lib/api"
import type { Property } from "@/types/property"
import { BookingFormRedesign } from "@/components/booking-form-redesign"
import { MapComponent } from "@/components/map-component"
import { AmenitiesGrid } from "@/components/amenities-grid"
import { useWishlist } from "@/contexts/wishlist-context"
import ApiService from "@/lib/ApiService"
import { useRouter } from "next/navigation"
import { ReviewSummary } from "@/components/reviews/review-summary"
import { PropertyReviews } from "@/components/reviews/property-reviews"

interface PropertyDetailProps {
  id: string
}

export function PropertyDetail({ id }: PropertyDetailProps) {
  const router = useRouter()
  const { addToWishlist, removeFromWishlist } = useWishlist()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isCheckingWishlist, setIsCheckingWishlist] = useState(true)

  useEffect(() => {
    // Validate the ID before making the API call
    if (!id || id === "undefined" || id === "null") {
      setError("Invalid property ID")
      setLoading(false)
      return
    }

    const fetchProperty = async () => {
      try {
        const data = await getPropertyById(id)
        setProperty(data)
        setError(null)
      } catch (error) {
        console.error("Error fetching property details:", error)
        setError("Failed to load property details. Please try again later.")
        // Redirect to 404 page if property not found
        if (error instanceof Error && error.message.includes("not found")) {
          router.push("/404")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [id, router])

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!id || id === "undefined" || id === "null") {
        setIsCheckingWishlist(false)
        return
      }

      if (ApiService.isAuthenticated()) {
        try {
          const inWishlist = await ApiService.isInWishlist(id)
          setIsFavorite(inWishlist)
        } catch (error) {
          console.error("Error checking wishlist status:", error)
        }
      }
      setIsCheckingWishlist(false)
    }

    checkWishlistStatus()
  }, [id])

  const toggleFavorite = async () => {
    if (!id || id === "undefined" || id === "null") {
      return
    }

    if (!ApiService.isAuthenticated()) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/property/${id}`)}`)
      return
    }

    try {
      if (isFavorite) {
        await removeFromWishlist(id)
      } else {
        await addToWishlist(id)
      }
      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error("Error toggling wishlist:", error)
    }
  }

  if (loading) {
    return <div className="animate-pulse p-4 rounded-lg bg-gray-100">Loading property details...</div>
  }

  if (error) {
    return (
      <div className="p-6 rounded-lg bg-red-50 border border-red-200">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
        <Button className="mt-4" variant="outline" onClick={() => router.push("/")}>
          Return to Home
        </Button>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="p-6 rounded-lg bg-amber-50 border border-amber-200">
        <h2 className="text-xl font-semibold text-amber-700 mb-2">Property Not Found</h2>
        <p className="text-amber-600">The property you're looking for could not be found.</p>
        <Button className="mt-4" variant="outline" onClick={() => router.push("/")}>
          Return to Home
        </Button>
      </div>
    )
  }

  // Default amenities if none are provided
  const defaultAmenities = [
    "Wifi",
    "TV",
    "Kitchen",
    "Air Conditioning",
    "Heating",
    "Washer",
    "Dryer",
    "Pool",
    "Hot Tub",
    "Free Parking",
  ]

  // Use property amenities if available, otherwise use defaults
  const amenities = property.amenities && property.amenities.length > 0 ? property.amenities : defaultAmenities

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{property.name}</h1>
          <div className="flex items-center mt-2 text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{property.location}</span>
            <div className="mx-2">•</div>
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span>{property.rating}</span>
              <span className="ml-1">({property.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={toggleFavorite} disabled={isCheckingWishlist}>
            <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            {isFavorite ? "Saved" : "Save"}
          </Button>
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-2 rounded-xl overflow-hidden aspect-[4/3] relative">
          <Image
            src={property.images[0] || "/placeholder.svg?height=600&width=800"}
            alt={property.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 md:col-span-2">
          {property.images.slice(1, 5).map((image, index) => (
            <div key={index} className="rounded-xl overflow-hidden aspect-square relative">
              <Image
                src={image || `/placeholder.svg?height=300&width=300&text=Image ${index + 2}`}
                alt={`${property.name} - Image ${index + 2}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-4 mb-6">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {property.guests} guests
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              {property.bedrooms} bedrooms
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              {property.bathrooms} bathrooms
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              {property.propertyType}
            </Badge>
          </div>

          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-4">
              <p className="text-muted-foreground">{property.description}</p>
            </TabsContent>

            <TabsContent value="amenities" className="mt-4">
              <AmenitiesGrid amenities={amenities} propertyName={property.name} />
            </TabsContent>

            <TabsContent value="location" className="mt-4">
              {property.latitude && property.longitude ? (
                <div className="space-y-4">
                  <MapComponent
                    latitude={property.latitude}
                    longitude={property.longitude}
                    propertyName={property.name}
                    propertyType={property.propertyType}
                  />
                  <p className="text-muted-foreground">
                    Located in {property.location}, this property offers easy access to local attractions.
                  </p>
                </div>
              ) : (
                <div className="bg-muted rounded-xl overflow-hidden h-[300px] relative flex items-center justify-center">
                  <p className="text-muted-foreground">Map location not available</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <div className="space-y-6">
                {/* Review Summary */}
                <ReviewSummary accommodationId={id} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <BookingFormRedesign property={property} />
        </div>
      </div>
    </div>
  )
}
