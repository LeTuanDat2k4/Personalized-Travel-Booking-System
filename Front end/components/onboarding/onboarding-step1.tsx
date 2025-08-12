"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { UserPreferences } from "@/contexts/preferences-context"

interface OnboardingStep1Props {
  formData: UserPreferences
  updateFormData: (data: Partial<UserPreferences>) => void
}

export function OnboardingStep1({ formData, updateFormData }: OnboardingStep1Props) {
  const popularLocations = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Nha Trang", "Hội An", "Vũng Tàu"]

  const handleLocationSelect = (location: string) => {
    updateFormData({ location_pref_str: location })
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-gray-600">
        Let us know where you want to go so we can recommend the most suitable places for you.
      </p>

      <div className="space-y-2">
        <Label htmlFor="location">Where do you want to go?</Label>
        <Input
          id="location"
          placeholder="Enter your destination"
          value={formData.location_pref_str}
          onChange={(e) => updateFormData({ location_pref_str: e.target.value })}
        />
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-500 mb-2">Popular destinations:</p>
        <div className="flex flex-wrap gap-2">
          {popularLocations.map((location) => (
            <button
              key={location}
              className={`px-3 py-1 rounded-full text-sm ${
                formData.location_pref_str === location ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => handleLocationSelect(location)}
            >
              {location}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
