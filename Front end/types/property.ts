export interface Property {
  propertyType: string
  id?: number
  accommodationId?: number
  ownerId?: number
  name: string
  description: string
  type: string
  pricePerNight: number
  availability: boolean
  location: string
  latitude?: number
  longitude?: number
  averageRating?: number
  amenities?: string
  photoUrl?: string
  images?: string[]
  bookings?: any[]
  reviews?: any[]
}
