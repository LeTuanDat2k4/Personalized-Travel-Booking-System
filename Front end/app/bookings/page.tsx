"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import ApiService from "@/lib/ApiService"
import { format } from "date-fns"

export default function BookingsPage() {
  return (
    <ProtectedRoute>
      <BookingsContent />
    </ProtectedRoute>
  )
}

function BookingsContent() {
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Get user profile to get the user ID
        const userResponse = await ApiService.getUserProfile()

        if (userResponse.statusCode !== 200) {
          throw new Error("Failed to get user profile")
        }

        const userId = userResponse.user.userId

        // Get user bookings
        const bookingsResponse = await ApiService.getUserBookings(userId)

        if (bookingsResponse.statusCode === 200 && bookingsResponse.user && bookingsResponse.user.bookings) {
          setBookings(bookingsResponse.user.bookings)
        } else {
          setBookings([])
        }
      } catch (error) {
        console.error("Error fetching bookings:", error)
        toast({
          title: "Error",
          description: "Failed to load your bookings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const handleCancelBooking = async (bookingId: number) => {
    try {
      const response = await ApiService.cancelBooking(bookingId)

      if (response.statusCode === 200) {
        toast({
          title: "Booking cancelled",
          description: "Your booking has been successfully cancelled.",
        })

        // Remove the cancelled booking from the list
        setBookings(bookings.filter((booking) => booking.id !== bookingId))
      } else {
        toast({
          title: "Cancellation failed",
          description: response.message || "An error occurred during cancellation.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Cancellation error:", error)
      toast({
        title: "Cancellation failed",
        description: "An error occurred during cancellation. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Bookings</h1>
        <div className="flex justify-center items-center h-64">
          <p>Loading your bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Bookings</h1>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-4">You don't have any bookings yet.</p>
            <Button onClick={() => router.push("/")}>Find a place to stay</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{booking.accommodation.name}</CardTitle>
                    <CardDescription>{booking.accommodation.location}</CardDescription>
                  </div>
                  <Badge variant="outline">{booking.status || "Confirmed"}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Booking Code</p>
                    <p className="font-mono">{booking.bookingConfirmationCode}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Check-in</p>
                      <p>
                        {format(
                          new Date(booking.checkInDate[0], booking.checkInDate[1] - 1, booking.checkInDate[2]),
                          "MMM d, yyyy",
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Check-out</p>
                      <p>
                        {format(
                          new Date(booking.checkOutDate[0], booking.checkOutDate[1] - 1, booking.checkOutDate[2]),
                          "MMM d, yyyy",
                        )}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Guests</p>
                    <p>
                      {booking.totalOfGuest} {booking.totalOfGuest === 1 ? "guest" : "guests"}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Price</p>
                      <p className="font-bold">${booking.totalPrice.toLocaleString()}</p>
                    </div>
                    <Button variant="outline" onClick={() => handleCancelBooking(booking.id)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
