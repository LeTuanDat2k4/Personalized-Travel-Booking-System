"use client"

import type { UserPreferences } from "@/contexts/preferences-context"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Home, Building, Hotel, Tent } from "lucide-react"

interface OnboardingStep4Props {
  formData: UserPreferences
  updateFormData: (data: Partial<UserPreferences>) => void
}

export function OnboardingStep4({ formData, updateFormData }: OnboardingStep4Props) {
  const propertyTypes = [
    { id: "HOTEL", label: "Hotel", icon: <Hotel className="h-6 w-6" /> },
    { id: "APARTMENT", label: "Apartment", icon: <Building className="h-6 w-6" /> },
    { id: "HOSTEL", label: "Hostel", icon: <Home className="h-6 w-6" /> },
    { id: "RESORT", label: "Resort", icon: <Tent className="h-6 w-6" /> },
  ]

  return (
    <div className="space-y-4">
      <p className="text-center text-gray-600">
        Choose the type of accommodation you prefer so we can recommend the most suitable options.
      </p>

      <RadioGroup
        value={formData.property_type_pref_str}
        onValueChange={(value) => updateFormData({ property_type_pref_str: value })}
        className="grid grid-cols-2 gap-4 mt-4"
      >
        {propertyTypes.map((type) => (
          <div key={type.id} className="relative">
            <RadioGroupItem value={type.id} id={type.id} className="peer sr-only" />
            <Label
              htmlFor={type.id}
              className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
            >
              <div className="mb-2 text-gray-600 peer-data-[state=checked]:text-primary">{type.icon}</div>
              <span className="font-medium">{type.label}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>

      <div className="mt-6">
        <p className="text-sm text-gray-600 mb-2">How frequently do you travel?</p>
        <div className="flex items-center">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={formData.travel_frequency_score}
            onChange={(e) => updateFormData({ travel_frequency_score: Number.parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>Rarely</span>
          <span>Sometimes</span>
          <span>Frequently</span>
        </div>
      </div>
    </div>
  )
}
