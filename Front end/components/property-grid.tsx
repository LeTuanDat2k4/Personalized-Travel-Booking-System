"use client"

import { useState, useEffect } from "react"
import { PropertyCard } from "@/components/property-card"
import { getProperties } from "@/lib/api"
import type { Property } from "@/types/property"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

interface PropertyGridProps {
  title?: string
  subtitle?: string
  limit?: number
  showViewAll?: boolean
  showLoadMore?: boolean
}

export function PropertyGrid({
  title = "Popular Properties",
  subtitle = "Popular places to stay that we recommend for you",
  limit = 8,
  showViewAll = true,
  showLoadMore = true,
}: PropertyGridProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [visibleProperties, setVisibleProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getProperties()

        // Add some sample discounts to properties for demo purposes
        const enhancedData = data.map((property, index) => ({
          ...property,
          discount: index % 3 === 0 ? 15 : 0, // Add 15% discount to every third property
        }))

        setProperties(enhancedData)
        setVisibleProperties(enhancedData.slice(0, limit))
      } catch (error) {
        console.error("Error fetching properties:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [limit])

  const handleLoadMore = () => {
    setVisibleProperties(properties.slice(0, visibleProperties.length + 4))
  }

  if (loading) {
    return <div>Loading properties...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>

        {showViewAll && (
          <Link href="/properties" className="flex items-center text-sm font-medium text-primary">
            View all <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visibleProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {showLoadMore && visibleProperties.length < properties.length && (
        <div className="flex justify-center mt-8">
          <Button variant="outline" onClick={handleLoadMore} className="rounded-full px-6">
            Show me more
          </Button>
        </div>
      )}
    </div>
  )
}
