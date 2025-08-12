"use client"

import { useState, useEffect } from "react"
import { MapComponent } from "@/components/map-component"
import type { Property } from "@/types/property"
import { getProperties } from "@/lib/api"

export function MapView() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getProperties()
        setProperties(data)

        // Set the first property with valid coordinates as selected
        const propertyWithCoords = data.find(
          (p) =>
            p.latitude &&
            p.longitude &&
            typeof p.latitude === "number" &&
            typeof p.longitude === "number" &&
            !isNaN(p.latitude) &&
            !isNaN(p.longitude),
        )

        if (propertyWithCoords) {
          setSelectedProperty(propertyWithCoords)
        }
      } catch (error) {
        console.error("Error fetching properties for map:", error)
        setError("Failed to load properties")
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  if (loading) {
    return (
      <div className="bg-muted rounded-xl overflow-hidden h-[500px] relative flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-muted rounded-xl overflow-hidden h-[500px] relative flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading map</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    )
  }

  // If no property has valid coordinates, show placeholder
  if (!selectedProperty?.latitude || !selectedProperty?.longitude) {
    return (
      <div className="bg-muted rounded-xl overflow-hidden h-[500px] relative flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No location data available</p>
          <p className="text-sm text-muted-foreground mt-1">Properties found: {properties.length}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <MapComponent
        latitude={selectedProperty.latitude}
        longitude={selectedProperty.longitude}
        propertyName={selectedProperty.name}
        propertyType={selectedProperty.propertyType}
        zoom={13}
        height="500px"
      />
      <div className="text-sm text-muted-foreground">
        <p>
          Showing location for: <span className="font-medium">{selectedProperty.name}</span>
        </p>
        <p>{selectedProperty.location}</p>
        <p className="text-xs mt-1">
          Coordinates: {selectedProperty.latitude.toFixed(6)}, {selectedProperty.longitude.toFixed(6)}
        </p>
      </div>
    </div>
  )
}
