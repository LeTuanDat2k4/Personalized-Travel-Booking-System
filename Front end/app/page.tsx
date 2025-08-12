import { Suspense } from "react"
import { SearchBarRedesign } from "@/components/search-bar-redesign"
import { PropertyGrid } from "@/components/property-grid"
import { RecommendedProperties } from "@/components/recommended-properties"
import { MapView } from "@/components/map-view"
import { HeroSection } from "@/components/hero-section"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { OnboardingModal } from "@/components/onboarding/onboarding-modal"
import { PersonalizedRecommendations } from "@/components/personalized-recommendations"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto mb-12">
          <SearchBarRedesign />
        </div>

        <div className="mt-12">
          <Suspense fallback={<LoadingSkeleton type="recommendations" />}>
            <PersonalizedRecommendations />
          </Suspense>
        </div>

        <div className="mt-12">
          <Suspense fallback={<LoadingSkeleton type="recommendations" />}>
            <RecommendedProperties />
          </Suspense>
        </div>

        <div className="mt-12">
          <Suspense fallback={<LoadingSkeleton type="properties" />}>
            <PropertyGrid />
          </Suspense>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Explore Locations</h2>
          <div className="sticky top-24">
            <MapView />
          </div>
        </div>
      </div>
      <OnboardingModal />
    </main>
  )
}
