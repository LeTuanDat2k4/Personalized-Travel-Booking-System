"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import ApiService from "@/lib/ApiService"
import { format } from "date-fns"
import Image from "next/image"

export default function FindBookingPage() {
  const [bookingCode, setBookingCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bookingCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a booking confirmation code",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await ApiService.getBookingByConfirmationCode(bookingCode)

      if (response.statusCode === 200 && response.booking) {
        setBooking(response.booking)
      } else {
        toast({
          title: "Booking not found",
          description: "We couldn't find a booking with that confirmation code. Please check and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error finding booking:", error)
      toast({
        title: "Error",
        description: "An error occurred while searching for your booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Find My Booking</h1>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Enter your booking details</CardTitle>
            <CardDescription>Enter your booking confirmation code to view your reservation details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bookingCode">Booking Confirmation Code</Label>
                  <Input
                    id="bookingCode"
                    placeholder="e.g. 745e7d57-1143-465b-a7da-d49184dc8587"
                    value={bookingCode}
                    onChange={(e) => setBookingCode(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Searching..." : "Find Booking"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {booking && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Booking Found</CardTitle>
              <CardDescription>Here are your booking details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative h-48 md:h-full">
                      <Image
                        src={booking.accommodation.photoUrl || "/placeholder.svg?height=300&width=400"}
                        alt={booking.accommodation.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4 md:col-span-2">
                      <div>
                        <h3 className="text-lg font-semibold">{booking.accommodation.name}</h3>
                        <p className="text-sm text-muted-foreground">{booking.accommodation.location}</p>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4">
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

                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground">Guests</p>
                        <p>
                          {booking.totalOfGuest} {booking.totalOfGuest === 1 ? "guest" : "guests"}
                        </p>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground">Booking Code</p>
                        <p className="font-mono">{booking.bookingConfirmationCode}</p>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground">Total Price</p>
                        <p className="font-bold">${booking.totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Print Booking Details
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
