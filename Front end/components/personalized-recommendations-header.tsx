"use client"

import { usePreferences } from "@/contexts/preferences-context"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

interface PersonalizedRecommendationsHeaderProps {
  count: number
}

export function PersonalizedRecommendationsHeader({ count }: PersonalizedRecommendationsHeaderProps) {
  const { preferences } = usePreferences()

  const getPreferencesSummary = () => {
    if (!preferences) return ""

    const parts = []
    if (preferences.location_pref_str) parts.push(preferences.location_pref_str)
    if (preferences.property_type_pref_str) parts.push(preferences.property_type_pref_str.toLowerCase())

    const amenities = preferences.amenities_pref?.slice(0, 2).join(", ")
    if (amenities) parts.push(`with ${amenities}`)

    return parts.join(" · ")
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
      <div>
        <h2 className="text-2xl font-bold">Recommendations for you</h2>
        <p className="text-sm text-gray-500">{getPreferencesSummary() || "Based on your preferences"}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">{count} properties found</span>
        <Button variant="outline" size="sm" className="h-8">
          <Settings className="h-3.5 w-3.5 mr-1.5" />
          Adjust preferences
        </Button>
      </div>
    </div>
  )
}
