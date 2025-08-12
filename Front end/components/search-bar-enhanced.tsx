"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { MapPin, CalendarIcon, Users, Search } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export function SearchBarEnhanced() {
  const [location, setLocation] = useState("")
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [guests, setGuests] = useState(1)
  const router = useRouter()

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (location) params.set("location", location)
    if (checkIn) params.set("checkIn", checkIn.toISOString())
    if (checkOut) params.set("checkOut", checkOut.toISOString())
    if (guests) params.set("guests", guests.toString())

    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border p-2">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        {/* Location */}
        <div className="relative">
          <Label htmlFor="location" className="sr-only">
            Location
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              placeholder="Where are you going?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10 border-0 focus-visible:ring-0 h-14"
            />
          </div>
        </div>

        {/* Check-in */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "h-14 justify-start text-left font-normal border-0 hover:bg-gray-50 dark:hover:bg-gray-700",
                !checkIn && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {checkIn ? format(checkIn, "MMM dd") : "Check in"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkIn}
              onSelect={setCheckIn}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Check-out */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "h-14 justify-start text-left font-normal border-0 hover:bg-gray-50 dark:hover:bg-gray-700",
                !checkOut && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {checkOut ? format(checkOut, "MMM dd") : "Check out"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkOut}
              onSelect={setCheckOut}
              disabled={(date) => date < new Date() || (checkIn && date <= checkIn)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Guests & Search */}
        <div className="flex">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="h-14 justify-start text-left font-normal border-0 hover:bg-gray-50 dark:hover:bg-gray-700 flex-1"
              >
                <Users className="mr-2 h-4 w-4" />
                {guests} {guests === 1 ? "Guest" : "Guests"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Guests</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      disabled={guests <= 1}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{guests}</span>
                    <Button variant="outline" size="sm" onClick={() => setGuests(guests + 1)}>
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button onClick={handleSearch} className="h-14 px-6 ml-2 rounded-xl">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
