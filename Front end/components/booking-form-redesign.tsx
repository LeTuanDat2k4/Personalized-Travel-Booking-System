"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, Minus, Plus, User } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import ApiService from "@/lib/ApiService"
import type { Property } from "@/types/property"
import { cn } from "@/lib/utils"

interface BookingFormRedesignProps {
  property: Property
}

export function BookingFormRedesign({ property }: BookingFormRedesignProps) {
  const router = useRouter()
  const [dateRange, setDateRange] = useState<{
    from?: Date
    to?: Date
  }>({})
  const [guests, setGuests] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const nights = dateRange.from && dateRange.to ? differenceInDays(dateRange.to, dateRange.from) : 0
  const subtotal = nights * property.price
  const serviceFee = subtotal * 0.12
  const total = subtotal + serviceFee

  const incrementGuests = () => {
    setGuests((prev) => Math.min(prev + 1, 16))
  }

  const decrementGuests = () => {
    setGuests((prev) => Math.max(prev - 1, 1))
  }

  const handleBooking = async () => {
    if (!dateRange.from || !dateRange.to) {
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
          checkIn: dateRange.from.toISOString(),
          checkOut: dateRange.to.toISOString(),
          guests: guests,
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
        checkInDate: format(dateRange.from, "yyyy-MM-dd"),
        checkOutDate: format(dateRange.to, "yyyy-MM-dd"),
        numOfAdults: guests,
        numOfChildren: 0,
        totalOfGuest: guests,
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
    <Card className="border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex justify-between items-center">
          <span className="text-xl font-bold">${property.price}</span>
          <span className="text-sm font-normal text-muted-foreground">per night</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {/* Date Range Picker */}
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full h-14 px-4 justify-start text-left font-normal border-0 border-b border-gray-200 rounded-none",
                  !dateRange.from && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-5 w-5 text-gray-400" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <span>
                      {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                    </span>
                  ) : (
                    format(dateRange.from, "MMM d")
                  )
                ) : (
                  "Select dates"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range || {})
                  if (range?.to) {
                    setCalendarOpen(false)
                  }
                }}
                initialFocus
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {/* Guest Selector */}
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <span>
                {guests} {guests === 1 ? "Guest" : "Guests"}
              </span>
            </div>

            <div className="flex items-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={decrementGuests}
                disabled={guests <= 1}
              >
                <Minus className="h-4 w-4" />
                <span className="sr-only">Decrease guests</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full ml-1"
                onClick={incrementGuests}
                disabled={guests >= 16}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Increase guests</span>
              </Button>
            </div>
          </div>
        </div>

        {nights > 0 && (
          <div className="space-y-3 pt-4">
            <div className="flex justify-between">
              <span className="text-gray-600">
                ${property.price} x {nights} nights
              </span>
              <span>${subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service fee</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold pt-3 border-t border-gray-200">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-xl"
          disabled={!dateRange.from || !dateRange.to || isLoading}
          onClick={handleBooking}
        >
          {isLoading ? "Processing..." : dateRange.from && dateRange.to ? "Reserve" : "Select dates"}
        </Button>
      </CardFooter>
    </Card>
  )
}
