import type { Property } from "@/types/property"

// Content-based filtering
export function getContentBasedRecommendations(
  userPreferences: {
    location?: string
    propertyType?: string
    priceRange?: [number, number]
    amenities?: string[]
  },
  properties: Property[],
): Property[] {
  // Filter properties based on user preferences
  let recommendations = [...properties]

  if (userPreferences.location) {
    recommendations = recommendations.filter((property) => property.location.includes(userPreferences.location!))
  }

  if (userPreferences.propertyType) {
    recommendations = recommendations.filter((property) => property.propertyType === userPreferences.propertyType)
  }

  if (userPreferences.priceRange) {
    const [min, max] = userPreferences.priceRange
    recommendations = recommendations.filter((property) => property.price >= min && property.price <= max)
  }

  // Sort by rating (highest first)
  recommendations.sort((a, b) => b.rating - a.rating)

  return recommendations
}

// Collaborative filtering
export function getCollaborativeRecommendations(
  userId: string,
  userBookingHistory: string[],
  similarUsers: { userId: string; similarity: number }[],
  allBookings: { userId: string; propertyId: string }[],
  properties: Property[],
): Property[] {
  // Get properties booked by similar users but not by the current user
  const similarUserIds = similarUsers.map((user) => user.userId)

  // Find properties booked by similar users
  const similarUserBookings = allBookings.filter((booking) => similarUserIds.includes(booking.userId))

  // Filter out properties already booked by the current user
  const recommendedPropertyIds = similarUserBookings
    .filter((booking) => !userBookingHistory.includes(booking.propertyId))
    .map((booking) => booking.propertyId)

  // Remove duplicates
  const uniqueRecommendedPropertyIds = [...new Set(recommendedPropertyIds)]

  // Get the actual property objects
  const recommendations = properties.filter((property) => uniqueRecommendedPropertyIds.includes(property.id))

  return recommendations
}

// Hybrid recommendation system
export function getHybridRecommendations(
  userId: string,
  userPreferences: {
    location?: string
    propertyType?: string
    priceRange?: [number, number]
    amenities?: string[]
  },
  userBookingHistory: string[],
  similarUsers: { userId: string; similarity: number }[],
  allBookings: { userId: string; propertyId: string }[],
  properties: Property[],
): Property[] {
  // Get recommendations from both approaches
  const contentBasedRecs = getContentBasedRecommendations(userPreferences, properties)
  const collaborativeRecs = getCollaborativeRecommendations(
    userId,
    userBookingHistory,
    similarUsers,
    allBookings,
    properties,
  )

  // Combine and deduplicate
  const allRecs = [...contentBasedRecs, ...collaborativeRecs]
  const uniquePropertyIds = [...new Set(allRecs.map((property) => property.id))]

  // Get final recommendations
  const recommendations = uniquePropertyIds.map((id) => properties.find((property) => property.id === id)!)

  return recommendations
}
