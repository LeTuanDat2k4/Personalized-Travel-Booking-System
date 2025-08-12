"use client"

import { useState, useEffect } from "react"
import type { Property } from "@/types/property"
import { PropertyCard } from "@/components/property-card"
import { getRecommendedProperties } from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function RecommendedProperties() {
  const [recommendations, setRecommendations] = useState<{
    forYou: Property[]
    similar: Property[]
    trending: Property[]
  }>({
    forYou: [],
    similar: [],
    trending: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await getRecommendedProperties()
        setRecommendations(data)
      } catch (error) {
        console.error("Error fetching recommendations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  if (loading) {
    return <div>Loading recommendations...</div>
  }

  return (
    <Tabs defaultValue="forYou">
      <TabsList className="mb-6">
        <TabsTrigger value="forYou">For You</TabsTrigger>
        <TabsTrigger value="similar">Similar to Previous</TabsTrigger>
        <TabsTrigger value="trending">Trending</TabsTrigger>
      </TabsList>

      <TabsContent value="forYou" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recommendations.forYou.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="similar" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recommendations.similar.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="trending" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recommendations.trending.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}
