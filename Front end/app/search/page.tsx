"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { PropertyCard } from "@/components/property-card"
import { Pagination } from "@/components/ui/pagination"
import { SearchBarEnhanced } from "@/components/search-bar-enhanced"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Users, Filter, Loader2, AlertCircle } from "lucide-react"
import ApiService from "@/lib/ApiService"
import { mapPropertyFromBackend } from "@/lib/api"
import type { Property } from "@/types/property"
import { format, parse, isValid } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("recommended")
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [authRequired, setAuthRequired] = useState(false)

  // Get search parameters from URL
  const location = searchParams.get("location") || ""
  const checkInParam = searchParams.get("checkIn")
  const checkOutParam = searchParams.get("checkOut")
  const guestsParam = searchParams.get("guests")
  const typeParam = searchParams.get("type")

  // Parse dates from URL parameters
 const checkIn = useMemo(() => {
  if (!checkInParam) return new Date()
  const date = new Date(checkInParam)
  return isValid(date) ? date : new Date()
}, [checkInParam])

const checkOut = useMemo(() => {
  if (!checkOutParam) return new Date(new Date().setDate(new Date().getDate() + 2))
  const date = new Date(checkOutParam)
  return isValid(date) ? date : new Date(new Date().setDate(new Date().getDate() + 2))
}, [checkOutParam])

  const guests = useMemo(() => {
    return guestsParam ? Number.parseInt(guestsParam, 10) : 1
  }, [guestsParam])

  const propertyType = useMemo(() => {
    return typeParam || ""
  }, [typeParam])

  const propertiesPerPage = 8

  // Fetch properties based on search parameters
  const fetchProperties = useCallback(async () => {
    if (!location) {
      setLoading(false)
      setProperties([])
      setFilteredProperties([])
      return
    }

    setLoading(true)
    setError(null)
    setAuthRequired(false)

    try {
      // Check if user is authenticated
      if (!ApiService.isAuthenticated()) {
        setAuthRequired(true)
        setLoading(false)
        return
      }

      // Format dates for API
      const checkInFormatted = format(checkIn, "yyyy-MM-dd")
      const checkOutFormatted = format(checkOut, "yyyy-MM-dd")

      // Prepare search parameters
      const searchParamsObj = {
        location,
        checkIn: checkInFormatted,
        checkOut: checkOutFormatted,
        types: propertyType && propertyType !== "ANY" ? [propertyType] : undefined,
      }

      // Call the search API using the static method
      const response = await ApiService.searchProperties(searchParamsObj)

      if (response.statusCode === 200 && response.accommodationList) {
        const mappedProperties = response.accommodationList.map(mapPropertyFromBackend)
        setProperties(mappedProperties)
        setFilteredProperties(mappedProperties)
      } else {
        setError(response.message || "Failed to fetch properties")
        setProperties([])
        setFilteredProperties([])
      }
    } catch (error: any) {
      console.error("Error searching properties:", error)

      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 403) {
          setAuthRequired(true)
        } else {
          setError(
            `Error ${error.response.status}: ${error.response.data?.message || "An error occurred while searching"}`,
          )
        }
      } else {
        setError("An error occurred while searching. Please try again.")
      }

      setProperties([])
      setFilteredProperties([])
    } finally {
      setLoading(false)
      setIsInitialLoad(false)
    }
  }, [location, checkIn, checkOut, propertyType])

  // Initial data fetch
  useEffect(() => {
    if (isInitialLoad) {
      fetchProperties()
    }
  }, [fetchProperties, isInitialLoad])

  // Sort properties when sort option changes
  useEffect(() => {
    if (properties.length === 0) return

    // Sort properties based on selected option
    const sorted = [...properties]

    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price)
        break
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating)
        break
      // Default is "recommended" - no sorting needed
    }

    setFilteredProperties(sorted)
    setCurrentPage(1) // Reset to first page when sorting changes
  }, [sortBy, properties])

  // Get current properties for pagination
  const currentProperties = useMemo(() => {
    const indexOfLastProperty = currentPage * propertiesPerPage
    const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage
    return filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty)
  }, [currentPage, filteredProperties, propertiesPerPage])

  const totalPages = useMemo(() => {
    return Math.ceil(filteredProperties.length / propertiesPerPage)
  }, [filteredProperties.length, propertiesPerPage])

  const handlePageChange = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const handleSearch = useCallback((searchParams: any) => {
    // Build query parameters for URL
    const params = new URLSearchParams()
    if (searchParams.location) params.append("location", searchParams.location)
    if (searchParams.checkIn) params.append("checkIn", format(searchParams.checkIn, "yyyy-MM-dd"))
    if (searchParams.checkOut) params.append("checkOut", format(searchParams.checkOut, "yyyy-MM-dd"))
    params.append("guests", searchParams.guests.toString())
    if (searchParams.propertyType) params.append("type", searchParams.propertyType)

    // Update URL without reloading the page
    window.history.pushState({}, "", `/search?${params.toString()}`)

    // Reload the page to fetch new results
    window.location.reload()
  }, [])

  const handleLogin = useCallback(() => {
    const currentPath = window.location.pathname + window.location.search
    router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`)
  }, [router])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <SearchBarEnhanced defaultLocation={location} onSearch={handleSearch} />
      </div>

      {authRequired ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center mb-6">
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              You need to be logged in to search for properties. Please log in to continue.
            </AlertDescription>
          </Alert>
          <Button onClick={handleLogin}>Log In</Button>
        </div>
      ) : (
        <>
          {/* Search filters summary */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <h1 className="text-2xl font-bold mr-2">Search Results</h1>

            {location && (
              <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                <MapPin className="h-4 w-4" />
                {location}
              </Badge>
            )}

            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              <Calendar className="h-4 w-4" />
              {isValid(checkIn) && isValid(checkOut) ? (
                  <>
                    {format(checkIn, "MMM d")} - {format(checkOut, "MMM d")}
                  </>
                ) : (
                  "Invalid dates"
                )}
            </Badge>

            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              <Users className="h-4 w-4" />
              {guests} {guests === 1 ? "Guest" : "Guests"}
            </Badge>

            {propertyType && propertyType !== "ANY" && (
              <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                <Filter className="h-4 w-4" />
                {propertyType.charAt(0) + propertyType.slice(1).toLowerCase()}
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
              <p className="text-gray-500">Searching for properties...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => (window.location.href = "/")}>Return to Home</Button>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">No properties found</h2>
              <p className="text-gray-500 mb-6">We couldn't find any properties matching your search criteria.</p>
              <Button onClick={() => (window.location.href = "/")}>Return to Home</Button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-500">
                  Showing {(currentPage - 1) * propertiesPerPage + 1}-
                  {Math.min(currentPage * propertiesPerPage, filteredProperties.length)} of {filteredProperties.length}{" "}
                  properties
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">Recommended</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
