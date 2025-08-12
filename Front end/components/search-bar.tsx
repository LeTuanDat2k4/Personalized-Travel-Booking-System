"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Search, Users } from "lucide-react"
import { format } from "date-fns"

interface SearchBarProps {
  variant?: "default" | "hero"
}

export function SearchBar({ variant = "default" }: SearchBarProps) {
  const [location, setLocation] = useState("")
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [guests, setGuests] = useState("2")

  const handleSearch = () => {
    console.log("Searching for:", { location, checkIn, checkOut, guests })
    // Implement search functionality
  }

  return (
    <div className={`flex flex-col md:flex-row gap-4 ${variant === "hero" ? "text-black" : ""}`}>
      <div className="flex-1">
        <Input
          placeholder="Where are you going?"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="h-12"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:w-[400px]">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`h-12 justify-start text-left font-normal ${!checkIn ? "text-muted-foreground" : ""}`}
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
              className={`h-12 justify-start text-left font-normal ${!checkOut ? "text-muted-foreground" : ""}`}
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

      <div className="flex gap-4">
        <Select value={guests} onValueChange={setGuests}>
          <SelectTrigger className="h-12 w-[120px]">
            <Users className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Guests" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Guest</SelectItem>
            <SelectItem value="2">2 Guests</SelectItem>
            <SelectItem value="3">3 Guests</SelectItem>
            <SelectItem value="4">4 Guests</SelectItem>
            <SelectItem value="5+">5+ Guests</SelectItem>
          </SelectContent>
        </Select>

        <Button className="h-12 px-6" onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>
    </div>
  )
}
