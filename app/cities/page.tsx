"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cities, type City } from "@/lib/data"
import { AQIBadge } from "@/components/ui/aqi-badge"
import { SustainabilityScore } from "@/components/ui/sustainability-score"
import { Button } from "@/components/ui/button"
import { MapPin, Search } from "lucide-react"
import Link from "next/link"

export default function CitiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")

  const filteredCities = cities.filter(
    (city) =>
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.state.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sortedCities = [...filteredCities].sort((a, b) => {
    switch (sortBy) {
      case "aqi":
        return a.aqi - b.aqi
      case "sustainabilityScore":
        return b.sustainabilityScore - a.sustainabilityScore
      case "greenSpace":
        return b.greenSpace - a.greenSpace
      case "population":
        return b.population - a.population
      default:
        return a.name.localeCompare(b.name)
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">City Dashboard</h1>
        <p className="text-muted-foreground">Compare sustainability metrics across major Indian cities</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search cities or states..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="aqi">AQI (Low to High)</SelectItem>
            <SelectItem value="sustainabilityScore">Sustainability Score</SelectItem>
            <SelectItem value="greenSpace">Green Space</SelectItem>
            <SelectItem value="population">Population</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedCities.map((city) => (
          <CityCard key={city.id} city={city} />
        ))}
      </div>
    </div>
  )
}

function CityCard({ city }: { city: City }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{city.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{city.state}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Air Quality Index</span>
          </div>
          <AQIBadge aqi={city.aqi} size="md" />
        </div>

        <div className="flex justify-between items-center">
          <SustainabilityScore score={city.sustainabilityScore} />
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Green Space</p>
            <p className="text-lg font-bold">{city.greenSpace}%</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-sm text-muted-foreground">Carbon</p>
            <p className="text-base font-medium">{city.carbonEmissions} tons/capita</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Population</p>
            <p className="text-base font-medium">{(city.population / 1000000).toFixed(1)}M</p>
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full mt-2" asChild>
          <Link href={`/map?city=${city.id}`}>
            <MapPin className="mr-2 h-4 w-4" />
            View on Map
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
