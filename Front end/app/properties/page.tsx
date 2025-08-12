"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { PropertyCard } from "@/components/property-card"
import { Pagination } from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import ApiService from "@/lib/ApiService"
import type { Property } from "@/types/property"
import { mapPropertyFromBackend } from "@/lib/api"

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [propertyType, setPropertyType] = useState("")
  const [priceRange, setPriceRange] = useState("")

  const propertiesPerPage = 8

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await ApiService.getAllProperties()
        if (response.statusCode === 200 && response.accommodationList) {
          const mappedProperties = response.accommodationList.map(mapPropertyFromBackend)
          setProperties(mappedProperties)
          setFilteredProperties(mappedProperties)
        }
      } catch (error) {
        console.error("Error fetching properties:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  useEffect(() => {
    // Filter properties based on search term, property type, and price range
    let filtered = [...properties]

    if (searchTerm) {
      filtered = filtered.filter(
        (property) =>
          property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (propertyType) {
      filtered = filtered.filter((property) => property.propertyType === propertyType)
    }

    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number)
      filtered = filtered.filter((property) => property.price >= min && property.price <= max)
    }

    setFilteredProperties(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchTerm, propertyType, priceRange, properties])

  // Get current properties for pagination
  const indexOfLastProperty = currentPage * propertiesPerPage
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage
  const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty)
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // The filtering is already handled by the useEffect
  }

  const handleReset = () => {
    setSearchTerm("")
    setPropertyType("")
    setPriceRange("")
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Properties</h1>
        <div className="flex justify-center items-center h-64">
          <p>Loading properties...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Properties</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by name or location"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger>
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="APARTMENT">Apartment</SelectItem>
              <SelectItem value="HOSTEL">Hostel</SelectItem>
              <SelectItem value="HOTEL">Hotel</SelectItem>
              <SelectItem value="VILLA">Villa</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Prices</SelectItem>
              <SelectItem value="0-500000">Under $500,000</SelectItem>
              <SelectItem value="500000-1000000">$500,000 - $1,000,000</SelectItem>
              <SelectItem value="1000000-2000000">$1,000,000 - $2,000,000</SelectItem>
              <SelectItem value="2000000-5000000">$2,000,000 - $5,000,000</SelectItem>
              <SelectItem value="5000000-100000000">$5,000,000+</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Search
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </form>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">No properties found</h2>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-gray-500">
            Showing {indexOfFirstProperty + 1}-{Math.min(indexOfLastProperty, filteredProperties.length)} of{" "}
            {filteredProperties.length} properties
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  )
}
