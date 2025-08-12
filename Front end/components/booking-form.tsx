"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Users } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import ApiService from "@/lib/ApiService"
import type { Property } from "@/types/property"

interface BookingFormProps {
  property: Property
}

export function BookingForm({ property }: BookingFormProps) {
  const router = useRouter()
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [guests, setGuests] = useState("2")
  const [isLoading, setIsLoading] = useState(false)

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0
  const subtotal = nights * property.price
  const serviceFee = subtotal * 0.12
  const total = subtotal + serviceFee

  const handleBooking = async () => {
    if (!checkIn || !checkOut) {
      toast({
        title: "Please select dates",
        description: "You need to select check-in and check-out dates to make a booking.",
        variant: "destructive",
      })
      return
    }

    if (!ApiService.isAuthenticated()) {
      // Save booking details to session storage and redirect to login
      sessionStorage.setItem(
        "pendingBooking",
        JSON.stringify({
          propertyId: property.id,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          guests: Number.parseInt(guests),
        }),
      )

      router.push(`/auth/login?redirect=${encodeURIComponent(`/property/${property.id}`)}`)
      return
    }

    setIsLoading(true)

    try {
      // Get user profile to get the user ID
      const userResponse = await ApiService.getUserProfile()

      if (userResponse.statusCode !== 200) {
        throw new Error("Failed to get user profile")
      }

      const userId = userResponse.user.userId

      // Create booking object
      const booking = {
        checkInDate: format(checkIn, "yyyy-MM-dd"),
        checkOutDate: format(checkOut, "yyyy-MM-dd"),
        numOfAdults: Number.parseInt(guests),
        numOfChildren: 0,
        totalOfGuest: Number.parseInt(guests),
        totalPrice: total,
      }

      // Book the property
      const response = await ApiService.bookProperty(property.id, userId, booking)

      if (response.statusCode === 200) {
        toast({
          title: "Booking successful",
          description: `Your booking has been confirmed with code: ${response.bookingConfirmationCode}`,
        })

        // Redirect to bookings page or confirmation page
        router.push("/bookings")
      } else {
        toast({
          title: "Booking failed",
          description: response.message || "An error occurred during booking.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Booking error:", error)
      toast({
        title: "Booking failed",
        description: "An error occurred during booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>${property.price}</span>
          <span className="text-sm font-normal text-muted-foreground">per night</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`justify-start text-left font-normal ${!checkIn ? "text-muted-foreground" : ""}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn ? format(checkIn, "PPP") : "Check in"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} initialFocus />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`justify-start text-left font-normal ${!checkOut ? "text-muted-foreground" : ""}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOut ? format(checkOut, "PPP") : "Check out"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <Select value={guests} onValueChange={setGuests}>
          <SelectTrigger>
            <Users className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Guests" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Guest</SelectItem>
            <SelectItem value="2">2 Guests</SelectItem>
            <SelectItem value="3">3 Guests</SelectItem>
            <SelectItem value="4">4 Guests</SelectItem>
            <SelectItem value="5">5+ Guests</SelectItem>
          </SelectContent>
        </Select>

        {nights > 0 && (
          <div className="space-y-2 pt-4">
            <div className="flex justify-between">
              <span>
                ${property.price} x {nights} nights
              </span>
              <span>${subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Service fee</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="lg" disabled={!checkIn || !checkOut || isLoading} onClick={handleBooking}>
          {isLoading ? "Processing..." : checkIn && checkOut ? "Reserve" : "Select dates"}
        </Button>
      </CardFooter>
    </Card>
  )
}
