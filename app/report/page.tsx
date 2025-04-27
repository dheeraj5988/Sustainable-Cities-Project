"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MapPin, Upload } from "lucide-react"
import dynamic from "next/dynamic"
import { useAuth } from "@/context/auth-context"
import { useReports } from "@/context/reports-context"
import { toast } from "@/components/ui/use-toast"

// Dynamically import the report map component with no SSR
const ReportMapComponent = dynamic(() => import("@/components/report-map-component"), {
  ssr: false,
})

export default function ReportPage() {
  const { user, userDetails } = useAuth()
  const { addReport, isLoading: isSubmitting } = useReports()
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    type: "",
    image: null as File | null,
  })
  const [userLocation, setUserLocation] = useState<{
    lat: number | null
    lng: number | null
  }>({ lat: null, lng: null })
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [submittedReport, setSubmittedReport] = useState<{ id: string } | null>(null)

  // Redirect if user is admin
  useEffect(() => {
    if (userDetails?.role === "admin") {
      router.push("/admin")
    }
  }, [userDetails, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, image: e.target.files![0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.location || !formData.type) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      // Create new report
      const newReport = await addReport({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        latitude: userLocation.lat || undefined,
        longitude: userLocation.lng || undefined,
        type: formData.type,
        status: "Pending",
      })

      if (newReport) {
        setSubmittedReport(newReport)
        setShowConfirmation(true)

        // Reset form
        setFormData({
          title: "",
          description: "",
          location: "",
          type: "",
          image: null,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to submit report. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting report:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getUserLocation = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setFormData((prev) => ({
            ...prev,
            location: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
          }))
        },
        (error) => {
          console.error("Error getting location:", error)
          toast({
            title: "Location Error",
            description: "Could not get your current location. Please enter it manually.",
            variant: "destructive",
          })
        },
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Report an Issue</h1>
        <p className="text-muted-foreground">Help improve your community by reporting sustainability issues</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Brief title for the issue"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Issue Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pollution">Pollution</SelectItem>
                    <SelectItem value="Waste Management">Waste Management</SelectItem>
                    <SelectItem value="Broken Infrastructure">Broken Infrastructure</SelectItem>
                    <SelectItem value="Water Leakage">Water Leakage</SelectItem>
                    <SelectItem value="Green Space Issue">Green Space Issue</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="flex space-x-2">
                  <Input
                    id="location"
                    name="location"
                    placeholder="Enter address or coordinates"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                  <Button type="button" variant="outline" size="icon" onClick={getUserLocation}>
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Upload Image (Optional)</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-green-50 hover:bg-green-100 border-green-200"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-green-600" />
                      <p className="mb-2 text-sm text-green-800">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-green-600">PNG, JPG or JPEG (MAX. 5MB)</p>
                    </div>
                    <input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {formData.image && <p className="text-sm text-green-600">Selected: {formData.image.name}</p>}
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Why Report Issues?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Your reports help local authorities identify and address sustainability issues in your community. By
              reporting problems, you contribute to:
            </p>

            <ul className="space-y-2 list-disc pl-5">
              <li>Improving air and water quality</li>
              <li>Enhancing waste management systems</li>
              <li>Fixing infrastructure problems quickly</li>
              <li>Preserving and expanding green spaces</li>
              <li>Creating a more sustainable urban environment</li>
            </ul>

            <div className="rounded-lg bg-green-50 p-4 border border-green-200 mt-6">
              <h3 className="font-medium text-green-800 mb-2">What happens after you report?</h3>
              <ol className="space-y-2 list-decimal pl-5 text-green-700">
                <li>Your report is reviewed by our team</li>
                <li>The issue is categorized and assigned to the relevant department</li>
                <li>Local authorities are notified and take appropriate action</li>
                <li>You receive updates on the status of your report</li>
                <li>The issue is resolved, and your community becomes more sustainable</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report Submitted Successfully</DialogTitle>
            <DialogDescription>
              Thank you for contributing to a more sustainable community. Your report has been received with ID:{" "}
              <strong>{submittedReport?.id}</strong> and will be reviewed shortly.
            </DialogDescription>
          </DialogHeader>
          <div className="h-[200px] w-full rounded-md overflow-hidden">
            {showConfirmation && userLocation.lat && userLocation.lng && (
              <ReportMapComponent lat={userLocation.lat} lng={userLocation.lng} />
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                setShowConfirmation(false)
                router.push("/dashboard")
              }}
            >
              View My Reports
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
