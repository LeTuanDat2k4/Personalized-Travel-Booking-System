export interface Review {
  id: string
  propertyId: string
  user: {
    id: string
    name: string
    avatar: string
  }
  rating: number
  comment: string
  date: string
}
