"use client"

import { useState, useEffect } from "react"
import { PropertyCard } from "@/components/property-card"
import { getSimilarProperties } from "@/lib/api"
import type { Property } from "@/types/property"

interface SimilarPropertiesProps {
  propertyId: string
}

export function SimilarProperties({ propertyId }: SimilarPropertiesProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSimilarProperties = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getSimilarProperties(propertyId)
        setProperties(data)
      } catch (error) {
        console.error("Error fetching similar properties:", error)
        setError("Unable to load similar properties")
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarProperties()
  }, [propertyId])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-muted-foreground py-8">{error}</div>
  }

  if (properties.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No similar properties found</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}
