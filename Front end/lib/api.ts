import ApiService from "./ApiService"
import type { Property } from "@/types/property"
import type { Review } from "@/types/review"

// Update the mapPropertyFromBackend function to generate multiple images
export const mapPropertyFromBackend = (accommodation: any): Property => {
  // Generate multiple images for demo purposes
  const images = accommodation.photoUrl
    ? [
        accommodation.photoUrl,
        "/placeholder.svg?height=600&width=800&text=Interior",
        "/placeholder.svg?height=600&width=800&text=Bedroom",
        "/placeholder.svg?height=600&width=800&text=Bathroom",
      ]
    : [
        "/placeholder.svg?height=600&width=800",
        "/placeholder.svg?height=600&width=800&text=Interior",
        "/placeholder.svg?height=600&width=800&text=Bedroom",
        "/placeholder.svg?height=600&width=800&text=Bathroom",
      ]

  return {
    id: accommodation.accommodationId.toString(),
    name: accommodation.name || "Unnamed Property",
    description: accommodation.description || "No description available",
    price: accommodation.pricePerNight || 0,
    location: accommodation.location || "Unknown location",
    images: images,
    rating: accommodation.averageRating || 0,
    reviewCount: Math.floor(Math.random() * 100) + 5, // Random review count for demo
    guests: 4, // Default value as not provided in the API
    bedrooms: Math.floor(Math.random() * 5) + 1, // Random bedroom count for demo
    bathrooms: Math.floor(Math.random() * 3) + 1, // Random bathroom count for demo
    propertyType: accommodation.type || "Cabin",
    isFavorite: false,
    discount: 0, // Will be set in PropertyGrid for some properties
    amenities: accommodation.amenities ? accommodation.amenities.split(", ") : [],
    latitude: accommodation.latitude,
    longitude: accommodation.longitude,
  }
}

// API functions
export async function getProperties(): Promise<Property[]> {
  try {
    const response = await ApiService.getAllProperties()
    if (response.statusCode === 200 && response.accommodationList) {
      return response.accommodationList.map(mapPropertyFromBackend)
    }
    return []
  } catch (error) {
    console.error("Error fetching properties:", error)
    return []
  }
}

export async function getPropertyById(id: string): Promise<Property> {
  // Validate the ID before making the API call
  if (!id || id === "undefined" || id === "null") {
    throw new Error(`Invalid property ID: ${id}`)
  }

  try {
    const response = await ApiService.getPropertyById(id)
    if (response.statusCode === 200 && response.accommodation) {
      return mapPropertyFromBackend(response.accommodation)
    }
    throw new Error(`Property with ID ${id} not found`)
  } catch (error) {
    console.error(`Error fetching property with ID ${id}:`, error)
    throw error
  }
}

export async function getRecommendedProperties() {
  try {
    // For authenticated users
    if (ApiService.isAuthenticated()) {
      const response = await ApiService.getRecommendations(12)
      if (response.statusCode === 200 && response.accommodationList) {
        const recommendations = response.accommodationList.map(mapPropertyFromBackend)

        // Split recommendations into different categories
        return {
          forYou: recommendations.slice(0, 4),
          similar: recommendations.slice(4, 8),
          trending: recommendations.slice(8, 12),
        }
      }
    }

    // For new users, use default recommendations
    const response = await ApiService.getAllAvailableProperties()
    if (response.statusCode === 200 && response.accommodationList) {
      const properties = response.accommodationList.map(mapPropertyFromBackend)
      return {
        forYou: properties.slice(0, 4),
        similar: properties.slice(4, 8),
        trending: properties.slice(8, 12),
      }
    }

    return {
      forYou: [],
      similar: [],
      trending: [],
    }
  } catch (error) {
    console.error("Error fetching recommendations:", error)
    return {
      forYou: [],
      similar: [],
      trending: [],
    }
  }
}

// Update the getSimilarProperties function to handle authentication errors and provide fallback data
export async function getSimilarProperties(propertyId: string): Promise<Property[]> {
  try {
    // First try to get authenticated recommendations
    if (ApiService.isAuthenticated()) {
      try {
        const response = await ApiService.getRecommendations(8)
        if (response.statusCode === 200 && response.accommodationList) {
          const recommendations = response.accommodationList
            .map(mapPropertyFromBackend)
            .filter((p) => p.id !== propertyId)
          return recommendations.slice(0, 4)
        }
      } catch (error) {
        console.log("Authenticated recommendations failed, falling back to alternative method")
      }
    }

    // Fallback: Get general properties instead
    const allProperties = await getProperties()
    // Filter out the current property and get properties with similar type or location
    const currentProperty = allProperties.find((p) => p.id === propertyId)

    if (currentProperty) {
      // First try to match by property type
      let similarProperties = allProperties.filter(
        (p) => p.id !== propertyId && p.propertyType === currentProperty.propertyType,
      )

      // If we don't have enough, add properties from similar location
      if (similarProperties.length < 4) {
        const locationTerms = currentProperty.location.split(",").map((term) => term.trim().toLowerCase())
        const locationMatches = allProperties.filter(
          (p) =>
            p.id !== propertyId &&
            p.propertyType !== currentProperty.propertyType &&
            locationTerms.some((term) => p.location.toLowerCase().includes(term) && term.length > 2),
        )

        // Add location matches until we have 4 properties
        similarProperties = [
          ...similarProperties,
          ...locationMatches.filter((p) => !similarProperties.some((sp) => sp.id === p.id)),
        ].slice(0, 4)
      }

      // If we still don't have enough, just add random properties
      if (similarProperties.length < 4) {
        const randomProperties = allProperties
          .filter((p) => p.id !== propertyId && !similarProperties.some((sp) => sp.id === p.id))
          .sort(() => 0.5 - Math.random())

        similarProperties = [...similarProperties, ...randomProperties].slice(0, 4)
      }

      return similarProperties
    }

    // If we couldn't find the current property, return random properties
    return allProperties
      .filter((p) => p.id !== propertyId)
      .sort(() => 0.5 - Math.random())
      .slice(0, 4)
  } catch (error) {
    console.error("Error fetching similar properties:", error)
    return []
  }
}

// Mock reviews data since the API doesn't provide reviews
const mockReviews: Review[] = [
  {
    id: "1",
    propertyId: "1",
    user: {
      id: "101",
      name: "John Smith",
      avatar: "/placeholder.svg?height=40&width=40&text=JS",
    },
    rating: 5,
    comment: "Amazing property! The views were incredible and the amenities were top-notch. We'll definitely be back.",
    date: "June 15, 2023",
  },
  {
    id: "2",
    propertyId: "1",
    user: {
      id: "102",
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40&text=SJ",
    },
    rating: 4,
    comment: "Beautiful place with great beach access. The only downside was that the WiFi was a bit spotty.",
    date: "July 3, 2023",
  },
  {
    id: "3",
    propertyId: "1",
    user: {
      id: "103",
      name: "Michael Brown",
      avatar: "/placeholder.svg?height=40&width=40&text=MB",
    },
    rating: 5,
    comment:
      "Perfect getaway! The house was clean, spacious, and had everything we needed. The host was very responsive.",
    date: "August 12, 2023",
  },
  {
    id: "4",
    propertyId: "1",
    user: {
      id: "104",
      name: "Emily Davis",
      avatar: "/placeholder.svg?height=40&width=40&text=ED",
    },
    rating: 5,
    comment: "We had a wonderful stay. The property is exactly as pictured and the location is unbeatable.",
    date: "September 5, 2023",
  },
]

export async function getPropertyReviews(propertyId: string): Promise<Review[]> {
  // Using mock reviews since the API doesn't provide reviews
  return mockReviews.map((review) => ({
    ...review,
    propertyId,
  }))
}

export async function getHostProperties() {
  try {
    if (ApiService.isAuthenticated()) {
      const response = await ApiService.getAllProperties()
      if (response.statusCode === 200 && response.accommodationList) {
        // Filter to show only first 3 properties as if they belong to the host
        return response.accommodationList.slice(0, 3).map(mapPropertyFromBackend)
      }
    }
    return []
  } catch (error) {
    console.error("Error fetching host properties:", error)
    return []
  }
}

export async function getHostBookings() {
  try {
    if (ApiService.isAuthenticated()) {
      const response = await ApiService.getAllBookings()
      if (response.statusCode === 200 && response.bookings) {
        return response.bookings
      }

      // Fallback to mock data if no bookings
      return [
        {
          id: "b1",
          propertyId: "1",
          propertyName: "Luxury Beach Villa",
          guestName: "John Smith",
          checkIn: "2023-10-15",
          checkOut: "2023-10-20",
          guests: 4,
          status: "confirmed",
          total: 1250,
        },
        {
          id: "b2",
          propertyId: "2",
          propertyName: "Mountain Retreat Cabin",
          guestName: "Sarah Johnson",
          checkIn: "2023-11-05",
          checkOut: "2023-11-10",
          guests: 2,
          status: "pending",
          total: 875,
        },
        {
          id: "b3",
          propertyId: "3",
          propertyName: "Downtown Modern Loft",
          guestName: "Michael Brown",
          checkIn: "2023-09-20",
          checkOut: "2023-09-25",
          guests: 2,
          status: "completed",
          total: 750,
        },
      ]
    }
    return []
  } catch (error) {
    console.error("Error fetching host bookings:", error)
    return []
  }
}

export async function getHostStats() {
  // Mock stats since the API doesn't provide this information
  return {
    totalProperties: 3,
    activeBookings: 2,
    occupancyRate: 78,
    monthlyEarnings: 2875,
  }
}

export async function searchProperties(searchParams: {
  location: string
  checkIn?: string
  checkOut?: string
  types?: string[]
}) {
  try {
    // Use the static method directly
    const response = await ApiService.searchProperties(searchParams)
    if (response.statusCode === 200 && response.accommodationList) {
      return response.accommodationList.map(mapPropertyFromBackend)
    }
    return []
  } catch (error) {
    console.error("Error searching properties:", error)
    return []
  }
}
