"use client"

import { useEffect, useRef } from "react"

interface LeafletMapProps {
  latitude: number
  longitude: number
  propertyName: string
  propertyType: string
  zoom?: number
  height?: string
}

export function LeafletMap({
  latitude,
  longitude,
  propertyName,
  propertyType,
  zoom = 15,
  height = "400px",
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    let L: any
    let map: any

    const initializeMap = async () => {
      if (!mapRef.current) return

      try {
        // Dynamically import Leaflet and CSS
        const leafletModule = await import("leaflet")
        L = leafletModule.default

        // Import CSS
        await import("../app/leaflet.css")

        // Fix for default markers in webpack
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        })

        // Remove previous map instance if exists
        if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        }

        // Create new map instance
        map = L.map(mapRef.current).setView([latitude, longitude], zoom)
        mapInstanceRef.current = map


        // Add OpenStreetMap tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map)

        // Create custom marker icon
        const customIcon = L.divIcon({
          className: "custom-marker-icon",
          html: `<div class="marker-pin bg-blue-600 text-white flex items-center justify-center rounded-full shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-home">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40],
        })

        // Add marker with popup
        L.marker([latitude, longitude], { icon: customIcon })
          .addTo(map)
          .bindPopup(
            `<div class="p-2">
              <b class="text-sm font-semibold">${propertyName}</b><br>
              <span class="text-xs text-gray-600">${propertyType}</span><br>
              <small class="text-xs text-gray-500">${latitude.toFixed(6)}, ${longitude.toFixed(6)}</small>
            </div>`,
          )
          .openPopup()
      } catch (error) {
        console.error("Error initializing map:", error)
      }
    }

    initializeMap()

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [latitude, longitude, propertyName, propertyType, zoom])

  return (
    <>
      <div ref={mapRef} style={{ height, width: "100%" }} className="rounded-xl overflow-hidden z-0" />
      <style jsx global>{`
        .custom-marker-icon {
          background: none !important;
          border: none !important;
        }
        .marker-pin {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translateY(-20px);
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        .leaflet-popup-content {
          margin: 8px 12px;
          line-height: 1.4;
        }
      `}</style>
    </>
  )
}
