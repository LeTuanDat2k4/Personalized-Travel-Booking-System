"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import type { UserPreferences } from "@/contexts/preferences-context"

interface OnboardingStep2Props {
  formData: UserPreferences
  updateFormData: (data: Partial<UserPreferences>) => void
}

export function OnboardingStep2({ formData, updateFormData }: OnboardingStep2Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <p className="text-center text-gray-600">
        Let us know your budget so we can recommend accommodations that fit your wallet.
      </p>

      <div className="space-y-4">
        <div className="flex justify-between">
          <Label htmlFor="budget">Budget per night</Label>
          <span className="font-medium text-primary">{formatCurrency(formData.budget_pref)}</span>
        </div>

        <Slider
          id="budget"
          min={100000}
          max={10000000}
          step={100000}
          value={[formData.budget_pref]}
          onValueChange={(value) => updateFormData({ budget_pref: value[0] })}
          className="py-4"
        />

        <div className="flex justify-between text-sm text-gray-500">
          <span>{formatCurrency(100000)}</span>
          <span>{formatCurrency(10000000)}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div
          className={`p-4 border rounded-lg text-center cursor-pointer transition-all ${
            formData.budget_pref <= 500000 ? "border-primary bg-primary/5" : "hover:border-gray-400"
          }`}
          onClick={() => updateFormData({ budget_pref: 500000 })}
        >
          <p className="font-medium">Budget</p>
          <p className="text-sm text-gray-500">Under 500K</p>
        </div>
        <div
          className={`p-4 border rounded-lg text-center cursor-pointer transition-all ${
            formData.budget_pref > 500000 && formData.budget_pref <= 2000000
              ? "border-primary bg-primary/5"
              : "hover:border-gray-400"
          }`}
          onClick={() => updateFormData({ budget_pref: 1500000 })}
        >
          <p className="font-medium">Mid-range</p>
          <p className="text-sm text-gray-500">500K - 2M</p>
        </div>
        <div
          className={`p-4 border rounded-lg text-center cursor-pointer transition-all ${
            formData.budget_pref > 2000000 ? "border-primary bg-primary/5" : "hover:border-gray-400"
          }`}
          onClick={() => updateFormData({ budget_pref: 3000000 })}
        >
          <p className="font-medium">Luxury</p>
          <p className="text-sm text-gray-500">Over 2M</p>
        </div>
      </div>
    </div>
  )
}
