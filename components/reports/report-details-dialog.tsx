"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, User, CheckCircle, Wrench, X } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface Report {
  id: string
  title: string
  description: string
  location: string
  type: string
  status: string
  created_at: string
  updated_at: string
  created_by: string
  assigned_to: string | null
  resolution_details: string | null
  resolution_images: string[] | null
  latitude: number | null
  longitude: number | null
  created_by_profile?: any
  assigned_to_profile?: any
}

interface ReportDetailsDialogProps {
  report: Report
  open: boolean
  onOpenChange: (open: boolean) => void
  formatReportId: (id: string) => string
  onStatusChange: (updatedReport: Report) => void
}

export function ReportDetailsDialog({
  report,
  open,
  onOpenChange,
  formatReportId,
  onStatusChange,
}: ReportDetailsDialogProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resolutionDetails, setResolutionDetails] = useState("")
  const [isResolving, setIsResolving] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-yellow-500 text-white">Approved</Badge>
      case "In Progress":
        return <Badge className="bg-blue-500 text-white">In Progress</Badge>
      case "Resolved":
        return <Badge className="bg-green-500 text-white">Resolved</Badge>
      case "Completed":
        return <Badge className="bg-purple-500 text-white">Completed</Badge>
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(/\//g, "/")
  }

  const handleStartWorking = async () => {
    if (!user) return

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from("reports")
        .update({
          status: "In Progress",
          assigned_to: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", report.id)
        .select("*, created_by_profile:profiles!created_by(*), assigned_to_profile:profiles!assigned_to(*)")
        .single()

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update report status",
          variant: "destructive",
        })
        console.error("Error updating report:", error)
      } else {
        toast({
          title: "Success",
          description: "You are now working on this report",
        })
        onStatusChange(data)
      }
    } catch (err) {
      console.error("Error:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResolve = async () => {
    if (!resolutionDetails.trim()) {
      toast({
        title: "Error",
        description: "Please provide resolution details",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from("reports")
        .update({
          status: "Resolved",
          resolution_details: resolutionDetails,
          updated_at: new Date().toISOString(),
        })
        .eq("id", report.id)
        .select("*, created_by_profile:profiles!created_by(*), assigned_to_profile:profiles!assigned_to(*)")
        .single()

      if (error) {
        toast({
          title: "Error",
          description: "Failed to resolve report",
          variant: "destructive",
        })
        console.error("Error resolving report:", error)
      } else {
        toast({
          title: "Success",
          description: "Report has been marked as resolved",
        })
        setIsResolving(false)
        onStatusChange(data)
      }
    } catch (err) {
      console.error("Error:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0e2726] text-white border-gray-700 max-w-lg">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-white">Report Details</DialogTitle>
            {getStatusBadge(report.status)}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Report ID</p>
              <p className="font-medium text-white">{formatReportId(report.id)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Type</p>
              <p className="font-medium text-white">{report.type}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400">Description</p>
            <p className="mt-1 text-white">{report.description}</p>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="h-4 w-4 text-gray-400" />
            <p>{report.location}</p>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="h-4 w-4 text-gray-400" />
            <p>{formatDate(report.created_at)}</p>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <User className="h-4 w-4 text-gray-400" />
            <p>{report.created_by_profile?.email || "User"}</p>
          </div>

          {report.assigned_to && (
            <div className="border-t border-gray-700 pt-4">
              <p className="text-sm font-medium mb-2 text-white">Assignment Details</p>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <User className="h-4 w-4 text-gray-400" />
                <p>Assigned to: {report.assigned_to_profile?.name || "Worker"}</p>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-300">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p>Assigned on: {formatDate(report.updated_at)}</p>
              </div>
            </div>
          )}

          {report.resolution_details && (
            <div className="border-t border-gray-700 pt-4">
              <p className="text-sm font-medium mb-2 text-white">Resolution Details</p>
              <p className="text-gray-300">{report.resolution_details}</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-300">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p>Resolved on: {formatDate(report.updated_at)}</p>
              </div>
            </div>
          )}

          {/* Worker Actions */}
          {user?.id && report.status === "Approved" && !report.assigned_to && (
            <div className="pt-4 border-t border-gray-700">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleStartWorking}
                disabled={isSubmitting}
              >
                <Wrench className="mr-2 h-4 w-4" />
                Start Working
              </Button>
            </div>
          )}

          {user?.id && report.status === "In Progress" && report.assigned_to === user.id && !isResolving && (
            <div className="pt-4 border-t border-gray-700">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setIsResolving(true)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Resolved
              </Button>
            </div>
          )}

          {isResolving && (
            <div className="pt-4 border-t border-gray-700">
              <Label htmlFor="resolution" className="text-white">
                Resolution Details
              </Label>
              <Textarea
                id="resolution"
                placeholder="Describe how you resolved this issue..."
                className="mt-2 bg-[#172e2c] border-gray-700 text-white"
                value={resolutionDetails}
                onChange={(e) => setResolutionDetails(e.target.value)}
              />

              <div className="flex gap-2 mt-4">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleResolve}
                  disabled={isSubmitting}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit Resolution
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => setIsResolving(false)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
