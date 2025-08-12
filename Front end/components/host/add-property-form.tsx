"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { MapComponent } from "@/components/map-component"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Check, Loader2, MapPin, Upload } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import ApiService from "@/lib/ApiService"

// Define amenities with their display names and API values
const AMENITIES = [
  { id: "wifi", label: "Wi-Fi", apiValue: "wi-fi" },
  { id: "ac", label: "Air Conditioning", apiValue: "air conditioning" },
  { id: "kitchen", label: "Kitchen", apiValue: "bếp" },
  { id: "washer", label: "Washer", apiValue: "máy giặt" },
  { id: "pool", label: "Swimming Pool", apiValue: "bể bơi" },
  { id: "tv", label: "TV", apiValue: "tv" },
  { id: "parking", label: "Free Parking", apiValue: "chỗ đỗ xe miễn phí tại nơi ở" },
  { id: "workspace", label: "Dedicated Workspace", apiValue: "không gian riêng để làm việc" },
  { id: "pets", label: "Pets Allowed", apiValue: "cho phép thú cưng" },
  { id: "elevator", label: "Elevator", apiValue: "thang máy" },
]

// Property types
const PROPERTY_TYPES = [
  { value: "APARTMENT", label: "Apartment" },
  { value: "HOTEL", label: "Hotel" },
  { value: "VILLA", label: "Villa" },
  { value: "HOSTEL", label: "Hostel" },
]

export function AddPropertyForm() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [propertyType, setPropertyType] = useState("")
  const [price, setPrice] = useState("")
  const [location, setLocation] = useState("")
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false)

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPhotoFile(file)

      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle amenity selection
  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities((prev) => {
      if (prev.includes(amenityId)) {
        return prev.filter((id) => id !== amenityId)
      } else {
        return [...prev, amenityId]
      }
    })
  }

  // Geocode the location to get latitude and longitude
  const geocodeLocation = async () => {
    if (!location.trim()) {
      setError("Please enter a location")
      return
    }

    setIsGeocodingLocation(true)
    setError(null)

    try {
      // Using Nominatim OpenStreetMap API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`,
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        setLatitude(Number.parseFloat(lat))
        setLongitude(Number.parseFloat(lon))
        toast({
          title: "Location found",
          description: "Coordinates have been updated on the map.",
        })
      } else {
        setError("Location not found. Please try a different address.")
      }
    } catch (error) {
      console.error("Error geocoding location:", error)
      setError("Error finding location. Please try again.")
    } finally {
      setIsGeocodingLocation(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!name || !description || !propertyType || !price || !location || !latitude || !longitude || !photoFile) {
      setError("Please fill in all required fields and upload a photo")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)
      formData.append("type", propertyType)
      formData.append("pricePerNight", price)
      formData.append("availability", "true")
      formData.append("location", location)
      formData.append("latitude", latitude.toString())
      formData.append("longitude", longitude.toString())

      // Convert selected amenity IDs to their API values and join with commas
      const amenitiesString = selectedAmenities
        .map((id) => AMENITIES.find((a) => a.id === id)?.apiValue || id)
        .join(",")
      formData.append("amenities", amenitiesString)

      // Add the photo file
      if (photoFile) {
        formData.append("photo", photoFile)
      }

      // Submit the form
      const response = await ApiService.addProperty(formData)

      if (response.statusCode === 200) {
        toast({
          title: "Property added successfully",
          description: "Your new property has been added.",
        })

        // Redirect to the host dashboard
        router.push("/host/dashboard")
      } else {
        setError(response.message || "Failed to add property")
      }
    } catch (error) {
      console.error("Error adding property:", error)
      setError("An error occurred while adding the property. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column - Property details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Property Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter property name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your property"
              className="min-h-[150px]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type *</Label>
              <Select value={propertyType} onValueChange={setPropertyType} required>
                <SelectTrigger id="propertyType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price Per Night (USD) *</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <div className="flex space-x-2">
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter full address"
                className="flex-1"
                required
              />
              <Button
                type="button"
                onClick={geocodeLocation}
                disabled={isGeocodingLocation || !location.trim()}
                variant="outline"
              >
                {isGeocodingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <MapPin className="h-4 w-4 mr-2" />
                )}
                Find
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Coordinates</Label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                value={latitude !== null ? latitude.toString() : ""}
                onChange={(e) => setLatitude(Number.parseFloat(e.target.value))}
                placeholder="Latitude"
                type="number"
                step="0.000001"
                disabled={!location}
              />
              <Input
                value={longitude !== null ? longitude.toString() : ""}
                onChange={(e) => setLongitude(Number.parseFloat(e.target.value))}
                placeholder="Longitude"
                type="number"
                step="0.000001"
                disabled={!location}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Property Photo *</Label>
            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {photoPreview ? (
                <div className="relative w-full">
                  <img
                    src={photoPreview || "/placeholder.svg"}
                    alt="Property preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white font-medium">Click to change</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload a property photo</p>
                </>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
          </div>
        </div>

        {/* Right column - Map and amenities */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <Label className="mb-2 block">Location Preview</Label>
              {latitude && longitude ? (
                <MapComponent
                  latitude={latitude}
                  longitude={longitude}
                  propertyName={name || "New Property"}
                  propertyType={propertyType || "Property"}
                  height="300px"
                />
              ) : (
                <div className="h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Enter a location and click "Find" to see the map</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="grid grid-cols-2 gap-2">
              {AMENITIES.map((amenity) => (
                <div key={amenity.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity.id}`}
                    checked={selectedAmenities.includes(amenity.id)}
                    onCheckedChange={() => handleAmenityToggle(amenity.id)}
                  />
                  <Label htmlFor={`amenity-${amenity.id}`} className="cursor-pointer">
                    {amenity.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.push("/host/dashboard")} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Property...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Add Property
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
