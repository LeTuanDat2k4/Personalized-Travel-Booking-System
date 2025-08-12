import { Suspense } from "react"
import { notFound } from "next/navigation"
import { PropertyDetail } from "@/components/property-detail"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { SimilarProperties } from "@/components/similar-properties"
import { PropertyReviews } from "@/components/reviews/property-reviews"

interface PropertyPageProps {
  params: {
    id: string
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = params

  if (id === "undefined" || !id || id === "null") {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSkeleton type="propertyDetail" />}>
          <PropertyDetail id={id} />
        </Suspense>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Reviews</h2>
          <Suspense fallback={<div>Loading reviews...</div>}>
            <PropertyReviews propertyId={id} />
          </Suspense>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
          <Suspense fallback={<LoadingSkeleton type="recommendations" />}>
            <SimilarProperties propertyId={id} />
          </Suspense>
        </div>
      </div>
    </main>
  )
}

