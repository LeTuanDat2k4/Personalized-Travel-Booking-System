"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Property } from "@/types/property"
import { cn } from "@/lib/utils"
import { useWishlist } from "@/contexts/wishlist-context"
import ApiService from "@/lib/ApiService"
import { useRouter } from "next/navigation"

interface PropertyCardProps {
  property: Property
  featured?: boolean
}

export function PropertyCard({ property, featured = false }: PropertyCardProps) {
  const router = useRouter()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isCheckingWishlist, setIsCheckingWishlist] = useState(true)

  // Ensure property.images is always an array
  const images =
    Array.isArray(property.images) && property.images.length > 0
      ? property.images
      : ["/placeholder.svg?height=300&width=400"]

  useEffect(() => {
    let isMounted = true
    const checkWishlistStatus = async () => {
      if (ApiService.isAuthenticated()) {
        try {
          // Use the context's isInWishlist method instead of making a separate API call
          const inWishlist = isInWishlist(property.id)
          if (isMounted) {
            setIsFavorite(inWishlist)
          }
        } catch (error) {
          console.error("Error checking wishlist status:", error)
        }
      }
      if (isMounted) {
        setIsCheckingWishlist(false)
      }
    }

    checkWishlistStatus()

    return () => {
      isMounted = false
    }
  }, [property.id, isInWishlist])

  const toggleFavorite = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!ApiService.isAuthenticated()) {
        router.push(`/auth/login?redirect=${encodeURIComponent(`/property/${property.id}`)}`)
        return
      }

      try {
        if (isFavorite) {
          await removeFromWishlist(property.id)
        } else {
          await addToWishlist(property.id)
        }
        setIsFavorite(!isFavorite)
      } catch (error) {
        console.error("Error toggling wishlist:", error)
      }
    },
    [isFavorite, property.id, router, addToWishlist, removeFromWishlist],
  )

  const handleImageNav = (index: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex(index)
  }

  return (
    <Link href={`/property/${property.id}`}>
      <div className="group rounded-xl overflow-hidden border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={images[currentImageIndex] || "/placeholder.svg?height=300&width=400"}
            alt={property.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white/90 rounded-full z-10"
            onClick={toggleFavorite}
            disabled={isCheckingWishlist}
          >
            <Heart className={cn("h-5 w-5", isFavorite ? "fill-red-500 text-red-500" : "text-gray-600")} />
            <span className="sr-only">{isFavorite ? "Remove from wishlist" : "Add to wishlist"}</span>
          </Button>
          {property.discount && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white font-medium px-2 py-1 text-xs rounded-md">
              -{property.discount}% today
            </Badge>
          )}

          {/* Image navigation dots */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                  onClick={(e) => handleImageNav(index, e)}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="space-y-2">
            <div className="flex items-center text-xs text-gray-500">
              <span>Entire {property.propertyType?.toLowerCase() || "property"}</span>
              <span className="mx-1">•</span>
              <span>{property.bedrooms || 1} beds</span>
            </div>

            <h3 className="font-medium text-base line-clamp-1">{property.name}</h3>

            <div className="flex items-center text-xs text-gray-500">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{property.location}</span>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div>
              <span className="font-bold text-base">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "VND",
                  maximumFractionDigits: 0,
                  notation: property.price > 999999 ? "compact" : "standard",
                }).format(property.price)}
              </span>
              <span className="text-gray-500 text-xs"> /night</span>
            </div>
            <div className="flex items-center">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="text-sm font-medium">{property.rating || 0}</span>
              <span className="text-xs text-gray-500 ml-1">({property.reviewCount || 0})</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
