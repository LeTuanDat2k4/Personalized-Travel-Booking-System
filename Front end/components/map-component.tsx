"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

interface MapComponentProps {
  latitude: number
  longitude: number
  propertyName: string
  propertyType: string
  zoom?: number
  height?: string
}


const DynamicMap = dynamic(() => import("./leaflet-map").then((mod) => mod.LeafletMap), {
  ssr: false,
  loading: () => (
    <div
      className="rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center"
      style={{ height: "400px", width: "100%" }}
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
})

export function MapComponent({
  latitude,
  longitude,
  propertyName,
  propertyType,
  zoom = 15,
  height = "400px",
}: MapComponentProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check if coordinates are valid
  if (typeof latitude !== "number" || typeof longitude !== "number" || isNaN(latitude) || isNaN(longitude)) {
    return (
      <div
        className="rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center"
        style={{ height, width: "100%" }}
      >
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">Invalid location coordinates</p>
          <p className="text-xs text-gray-500 mt-1">
            Lat: {latitude}, Lng: {longitude}
          </p>
        </div>
      </div>
    )
  }

  if (!isMounted) {
    return (
      <div
        className="rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center"
        style={{ height, width: "100%" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Initializing map...</p>
        </div>
      </div>
    )
  }

  return (
    <DynamicMap
      latitude={latitude}
      longitude={longitude}
      propertyName={propertyName}
      propertyType={propertyType}
      zoom={zoom}
      height={height}
    />
  )
}
