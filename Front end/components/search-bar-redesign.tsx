"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Minus, Plus, Search, User } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  className?: string
  onSearch?: (searchParams: {
    location: string
    checkIn?: Date
    checkOut?: Date
    guests: number
  }) => void
}

export function SearchBarRedesign({ className, onSearch }: SearchBarProps) {
  const [location, setLocation] = useState("")
  const [dateRange, setDateRange] = useState<{
    from?: Date
    to?: Date
  }>({})
  const [guests, setGuests] = useState(1)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        location,
        checkIn: dateRange.from,
        checkOut: dateRange.to,
        guests,
      })
    }
    console.log("Searching for:", { location, dateRange, guests })
  }

  const incrementGuests = () => {
    setGuests((prev) => Math.min(prev + 1, 16))
  }

  const decrementGuests = () => {
    setGuests((prev) => Math.max(prev - 1, 1))
  }

  return (
    <div className={cn("flex flex-col md:flex-row items-stretch gap-2", className)}>
      {/* Location Input */}
      <div className="relative flex-grow">
        <Input
          placeholder="Where are you going?"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="h-14 pl-4 pr-4 text-base font-medium text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black placeholder:text-gray-500"
        />
      </div>

      {/* Date Range Picker */}
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-14 px-4 border-gray-200 rounded-xl justify-start text-left font-normal",
              !dateRange.from && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-5 w-5 text-gray-400" />
            {dateRange.from ? (
              dateRange.to ? (
                <span className="font-medium text-black">
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
      <div className="flex items-center h-14 border border-gray-200 rounded-xl px-4">
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

        <div className="flex items-center mx-3">
          <User className="h-5 w-5 text-gray-400 mr-2" />
          <span>
            {guests} {guests === 1 ? "Guest" : "Guests"}
          </span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={incrementGuests}
          disabled={guests >= 16}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Increase guests</span>
        </Button>
      </div>

      {/* Search Button */}
      <Button onClick={handleSearch} className="h-14 px-6 bg-black hover:bg-gray-800 text-white rounded-xl">
        <Search className="mr-2 h-5 w-5" />
        Search
      </Button>
    </div>
  )
}
