"use client"

import { SearchBarEnhanced } from "@/components/search-bar-enhanced"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Users } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Text */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Find Your Perfect
              <span className="text-primary block">Stay Anywhere</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover unique accommodations around the world. From cozy apartments to luxury villas, find the perfect
              place for your next adventure.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <SearchBarEnhanced />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-8">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>200+ Cities</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4" />
              <span>50k+ Reviews</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>1M+ Guests</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="text-lg px-8">
              Start Exploring
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
              Become a Host
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
