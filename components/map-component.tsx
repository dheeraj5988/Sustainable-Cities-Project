"use client"

import { useEffect, useState } from "react"
import type { City } from "@/lib/data"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapComponentProps {
  cities: City[]
  onCitySelect: (city: City) => void
}

export default function MapComponent({ cities, onCitySelect }: MapComponentProps) {
  const [mapInitialized, setMapInitialized] = useState(false)

  useEffect(() => {
    // Initialize map when component mounts
    let map: L.Map
    const markers: L.CircleMarker[] = []

    if (!mapInitialized) {
      // Create map
      map = L.map("map").setView([22.5726, 78.9629], 5)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // Add markers for each city
      cities.forEach((city) => {
        const aqiColor = city.aqi < 80 ? "#22c55e" : city.aqi < 120 ? "#eab308" : "#ef4444"

        const marker = L.circleMarker([city.lat, city.lng], {
          radius: 8,
          fillColor: aqiColor,
          color: "#fff",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
        }).addTo(map)

        marker.on("click", () => {
          onCitySelect(city)
        })

        markers.push(marker)
      })

      setMapInitialized(true)
    }

    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [cities, onCitySelect, mapInitialized])

  return <div id="map" className="h-full w-full z-0"></div>
}
