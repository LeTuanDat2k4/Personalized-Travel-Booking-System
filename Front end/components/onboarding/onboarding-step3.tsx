"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { UserPreferences } from "@/contexts/preferences-context"

interface OnboardingStep3Props {
  formData: UserPreferences
  updateFormData: (data: Partial<UserPreferences>) => void
}

export function OnboardingStep3({ formData, updateFormData }: OnboardingStep3Props) {
  const amenities = [
    { id: "wifi", label: "Wi-Fi" },
    { id: "pool", label: "Swimming Pool" },
    { id: "ac", label: "Air Conditioning" },
    { id: "kitchen", label: "Kitchen" },
    { id: "washer", label: "Washer" },
    { id: "parking", label: "Parking" },
    { id: "tv", label: "TV" },
    { id: "workspace", label: "Workspace" },
    { id: "beach", label: "Beach Access" },
    { id: "gym", label: "Gym" },
  ]

  // This mapping is for display purposes only - the actual mapping happens in ApiService
  const amenityDisplayToApiMap = {
    ac: "air conditioning",
    wifi: "wi-fi",
    pool: "bể bơi",
    kitchen: "bếp",
    washer: "máy giặt",
  }

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = [...formData.amenities_pref]

    if (currentAmenities.includes(amenity)) {
      updateFormData({
        amenities_pref: currentAmenities.filter((item) => item !== amenity),
      })
    } else {
      updateFormData({
        amenities_pref: [...currentAmenities, amenity],
      })
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-gray-600">
        Select amenities that are important to you so we can recommend the most suitable accommodations.
      </p>

      <div className="grid grid-cols-2 gap-3 mt-4">
        {amenities.map((amenity) => (
          <div key={amenity.id} className="flex items-center space-x-2">
            <Checkbox
              id={amenity.id}
              checked={formData.amenities_pref.includes(amenity.id)}
              onCheckedChange={() => handleAmenityToggle(amenity.id)}
            />
            <Label htmlFor={amenity.id} className="cursor-pointer">
              {amenity.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
