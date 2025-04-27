"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cities, states, type State, type City } from "@/lib/data"
import { AQIBadge } from "@/components/ui/aqi-badge"
import { MapPin, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import dynamic from "next/dynamic"

// Dynamically import the map component with no SSR
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-muted/20">
      <p>Loading map...</p>
    </div>
  ),
})

export default function MapPage() {
  const [selectedState, setSelectedState] = useState<State | null>(null)
  const [selectedCity, setSelectedCity] = useState<City | null>(null)

  const handleStateClick = (state: State) => {
    setSelectedState(state)
  }

  const closeStatePanel = () => {
    setSelectedState(null)
  }

  const closeCityPanel = () => {
    setSelectedCity(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">India Map View</h1>
        <p className="text-muted-foreground">Explore sustainability metrics across Indian states and cities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
        <div className="md:col-span-2 relative">
          <Card className="h-full">
            <CardContent className="p-0">
              <MapComponent cities={cities} onCitySelect={setSelectedCity} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {selectedCity ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">
                  {selectedCity.name}, {selectedCity.state}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={closeCityPanel} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Air Quality Index</span>
                  </div>
                  <AQIBadge aqi={selectedCity.aqi} size="md" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Sustainability Score</p>
                    <p className="text-2xl font-bold">{selectedCity.sustainabilityScore}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Green Space</p>
                    <p className="text-2xl font-bold">{selectedCity.greenSpace}%</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground">Population</p>
                  <p className="text-xl font-bold">{selectedCity.population.toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Carbon Emissions</p>
                  <p className="text-xl font-bold">{selectedCity.carbonEmissions} tons/capita</p>
                </div>
              </CardContent>
            </Card>
          ) : selectedState ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">{selectedState.name}</CardTitle>
                <Button variant="ghost" size="icon" onClick={closeStatePanel} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Air Quality Index</span>
                  </div>
                  <AQIBadge aqi={selectedState.aqi} size="md" />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Population</p>
                  <p className="text-xl font-bold">{selectedState.population.toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Green Cover</p>
                  <p className="text-xl font-bold">{selectedState.greenSpace}%</p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium">Key Cities</p>
                  <div className="mt-2 space-y-2">
                    {selectedState.keyCities.map((city) => (
                      <div key={city} className="flex items-center rounded-md bg-green-50 p-2">
                        <MapPin className="mr-2 h-4 w-4 text-green-600" />
                        <span>{city}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>States</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {states.map((state) => (
                    <Button
                      key={state.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleStateClick(state)}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      {state.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
