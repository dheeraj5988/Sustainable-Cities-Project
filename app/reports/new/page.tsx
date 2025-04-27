"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useReports } from "@/contexts/reports-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const REPORT_TYPES = ["Infrastructure", "Waste", "Water", "Energy", "Transportation", "Pollution", "Other"]

export default function NewReportPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [type, setType] = useState("")
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { createReport } = useReports()
  const router = useRouter()

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude)
          setLongitude(position.coords.longitude)
        },
        (error) => {
          console.error("Error getting location:", error)
          setError("Unable to get your location. Please enter it manually.")
        },
      )
    } else {
      setError("Geolocation is not supported by your browser")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await createReport({
        title,
        description,
        location,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        type,
        status: "Pending",
      })

      if (error) {
        setError(error.message)
      } else {
        router.push("/reports")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while submitting the report")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Report an Issue</CardTitle>
          <CardDescription>Submit a report about an issue in your community</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide details about the issue"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="flex space-x-2">
                <Input
                  id="location"
                  placeholder="Address or description of the location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={handleGetLocation}>
                  Get My Location
                </Button>
              </div>
              {latitude && longitude && (
                <p className="text-xs text-muted-foreground">
                  Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type of Issue</Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Report"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
