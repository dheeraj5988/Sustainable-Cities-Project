"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { ReportDetailsDialog } from "@/components/reports/report-details-dialog"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

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
}

export default function WorkerDashboardPage() {
  const { user, userDetails } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!user || !userDetails || userDetails.role !== "worker") {
      router.push("/login")
      return
    }

    const fetchReports = async () => {
      try {
        setIsLoading(true)

        // Get reports assigned to this worker or available for assignment
        const { data, error } = await supabase
          .from("reports")
          .select("*, created_by_profile:profiles!created_by(*), assigned_to_profile:profiles!assigned_to(*)")
          .or(`assigned_to.eq.${user.id},status.eq.Approved`)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching reports:", error)
          setError("Failed to load reports")
        } else {
          // Format the reports to match our interface
          const formattedReports = data.map((report: any) => ({
            id: report.id,
            title: report.title,
            description: report.description,
            location: report.location,
            type: report.type,
            status: report.status,
            created_at: report.created_at,
            updated_at: report.updated_at,
            created_by: report.created_by,
            assigned_to: report.assigned_to,
            resolution_details: report.resolution_details,
            resolution_images: report.resolution_images,
            latitude: report.latitude,
            longitude: report.longitude,
            created_by_profile: report.created_by_profile,
            assigned_to_profile: report.assigned_to_profile,
          }))
          setReports(formattedReports)
        }
      } catch (err) {
        console.error("Error:", err)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [user, userDetails, router, supabase])

  // Filter reports by status
  const availableReports = reports.filter((report) => report.status === "Approved" && !report.assigned_to)
  const inProgressReports = reports.filter(
    (report) => report.status === "In Progress" && report.assigned_to === user?.id,
  )
  const resolvedReports = reports.filter((report) => report.status === "Resolved" && report.assigned_to === user?.id)
  const allReports = [...availableReports, ...inProgressReports, ...resolvedReports]

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report)
    setIsDetailsOpen(true)
  }

  const formatReportId = (id: string) => {
    // Extract first 4 characters of UUID and format as RPT-XXXX
    return `RPT-${id.substring(0, 4).toUpperCase()}`
  }

  return (
    <div className="min-h-screen bg-[#0a1f1c]">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Worker Dashboard</h1>
          <p className="text-gray-400">Manage and resolve sustainability reports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#0e2726] p-4 rounded-lg">
            <h2 className="text-4xl font-bold text-yellow-500">{availableReports.length}</h2>
            <p className="text-white font-medium">Available Reports</p>
            <p className="text-sm text-gray-400">Reports you can work on</p>
          </div>
          <div className="bg-[#0e2726] p-4 rounded-lg">
            <h2 className="text-4xl font-bold text-blue-500">{inProgressReports.length}</h2>
            <p className="text-white font-medium">In Progress</p>
            <p className="text-sm text-gray-400">Reports you're working on</p>
          </div>
          <div className="bg-[#0e2726] p-4 rounded-lg">
            <h2 className="text-4xl font-bold text-green-500">{resolvedReports.length}</h2>
            <p className="text-white font-medium">Resolved</p>
            <p className="text-sm text-gray-400">Reports you've resolved</p>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-[#0e2726] text-gray-400">
            <TabsTrigger value="available" className="data-[state=active]:text-white">
              Available Reports ({availableReports.length})
            </TabsTrigger>
            <TabsTrigger value="inProgress" className="data-[state=active]:text-white">
              In Progress ({inProgressReports.length})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="data-[state=active]:text-white">
              Resolved ({resolvedReports.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:text-white">
              All Reports ({allReports.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            {availableReports.length === 0 ? (
              <div className="bg-[#0e2726] p-6 rounded-lg text-center">
                <p className="text-gray-400">No available reports</p>
              </div>
            ) : (
              availableReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  formatReportId={formatReportId}
                  onViewDetails={() => handleViewDetails(report)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="inProgress" className="space-y-4">
            {inProgressReports.length === 0 ? (
              <div className="bg-[#0e2726] p-6 rounded-lg text-center">
                <p className="text-gray-400">No reports in progress</p>
              </div>
            ) : (
              inProgressReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  formatReportId={formatReportId}
                  onViewDetails={() => handleViewDetails(report)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            {resolvedReports.length === 0 ? (
              <div className="bg-[#0e2726] p-6 rounded-lg text-center">
                <p className="text-gray-400">No resolved reports</p>
              </div>
            ) : (
              resolvedReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  formatReportId={formatReportId}
                  onViewDetails={() => handleViewDetails(report)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {allReports.length === 0 ? (
              <div className="bg-[#0e2726] p-6 rounded-lg text-center">
                <p className="text-gray-400">No reports available</p>
              </div>
            ) : (
              allReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  formatReportId={formatReportId}
                  onViewDetails={() => handleViewDetails(report)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedReport && (
        <ReportDetailsDialog
          report={selectedReport}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          formatReportId={formatReportId}
          onStatusChange={(updatedReport) => {
            setReports(reports.map((r) => (r.id === updatedReport.id ? updatedReport : r)))
            setSelectedReport(updatedReport)
          }}
        />
      )}
    </div>
  )
}

interface ReportCardProps {
  report: Report
  formatReportId: (id: string) => string
  onViewDetails: () => void
}

function ReportCard({ report, formatReportId, onViewDetails }: ReportCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-yellow-500 text-white">Approved</Badge>
      case "In Progress":
        return <Badge className="bg-blue-500 text-white">In Progress</Badge>
      case "Resolved":
        return <Badge className="bg-green-500 text-white">Resolved</Badge>
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "/")
  }

  return (
    <div className="bg-[#0e2726] rounded-lg p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-400">{formatReportId(report.id)}</span>
            {getStatusBadge(report.status)}
            <span className="text-gray-400 ml-auto">{formatDate(report.created_at)}</span>
          </div>
          <h3 className="text-white font-medium text-lg">{report.type}</h3>
          <p className="text-gray-400 mb-2 line-clamp-2">{report.description}</p>
          <div className="flex items-center text-gray-400">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{report.location}</span>
          </div>
        </div>
        <div className="mt-4 md:mt-0 md:ml-4">
          <Button onClick={onViewDetails} className="bg-green-600 hover:bg-green-700 text-white">
            View Details
          </Button>
        </div>
      </div>
    </div>
  )
}
