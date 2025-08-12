"use client"

import { Button } from "@/components/ui/button"
import { AmenityIcon } from "@/components/amenity-icon"
import { useState } from "react"
import { AmenitiesModal } from "@/components/amenities-modal"

interface AmenitiesGridProps {
  amenities: string[]
  propertyName: string
}

export function AmenitiesGrid({ amenities, propertyName }: AmenitiesGridProps) {
  const [showAllAmenities, setShowAllAmenities] = useState(false)

  // Show only the first 9 amenities in the grid
  const visibleAmenities = amenities.slice(0, 9)
  const hasMoreAmenities = amenities.length > 9

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Amenities</h3>
        <p className="text-muted-foreground text-sm">About the property's amenities and services</p>
      </div>

      <div className="border-t border-b py-6 my-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleAmenities.map((amenity, index) => (
            <div key={index} className="flex items-center gap-3">
              <AmenityIcon name={amenity} className="text-gray-500" />
              <span className="text-sm">{amenity}</span>
            </div>
          ))}
        </div>
      </div>

      {hasMoreAmenities && (
        <Button variant="outline" onClick={() => setShowAllAmenities(true)} className="rounded-full">
          View more {amenities.length - visibleAmenities.length} amenities
        </Button>
      )}

      <AmenitiesModal
        amenities={amenities}
        propertyName={propertyName}
        open={showAllAmenities}
        onClose={() => setShowAllAmenities(false)}
      />
    </div>
  )
}
