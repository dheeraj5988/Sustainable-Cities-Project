"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"

interface Report {
  id: string
  title: string
  description: string
  location: string
  status: string
  created_at: string
  type: string
  created_by: {
    name: string
    email: string
  }
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, router])

  useEffect(() => {
    const fetchAllReports = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from("reports")
          .select(`
            *,
            created_by:profiles!reports_created_by_fkey (
              name,
              email
            )
          `)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching reports:", error)
          setError("Failed to load reports")
        } else {
          setReports(data || [])
        }
      } catch (err) {
        console.error("Error:", err)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllReports()
  }, [user])

  // Filter reports by status
  const pendingReports = reports.filter((report) => report.status.toLowerCase() === "pending")
  const approvedReports = reports.filter((report) => report.status.toLowerCase() === "approved")
  const rejectedReports = reports.filter((report) => report.status.toLowerCase() === "rejected")
  const inProgressReports = reports.filter((report) => report.status.toLowerCase() === "in progress")
  const resolvedReports = reports.filter((report) => report.status.toLowerCase() === "resolved")
  const completedReports = reports.filter((report) => report.status.toLowerCase() === "completed")

  // Format report ID with leading zeros
  const formatReportId = (id: string) => {
    const numericPart = id.substring(0, 4)
    return `RPT-${numericPart.padStart(4, "0")}`
  }

  // Format date to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage and moderate sustainability reports</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">
            Welcome, <span className="text-green-700">{user?.email}</span>
          </h2>
          <p className="text-muted-foreground">You have admin privileges</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Reports ({reports.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingReports.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedReports.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedReports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} formatReportId={formatReportId} formatDate={formatDate} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingReports.map((report) => (
              <ReportCard key={report.id} report={report} formatReportId={formatReportId} formatDate={formatDate} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedReports.map((report) => (
              <ReportCard key={report.id} report={report} formatReportId={formatReportId} formatDate={formatDate} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rejectedReports.map((report) => (
              <ReportCard key={report.id} report={report} formatReportId={formatReportId} formatDate={formatDate} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ReportCard({
  report,
  formatReportId,
  formatDate,
}: {
  report: Report
  formatReportId: (id: string) => string
  formatDate: (date: string) => string
}) {
  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>
      case "in progress":
        return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>
      case "resolved":
        return <Badge className="bg-purple-500 hover:bg-purple-600">Resolved</Badge>
      case "completed":
        return <Badge className="bg-green-700 hover:bg-green-800">Completed</Badge>
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>
    }
  }

  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow bg-gray-900 text-white border-gray-800">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="font-mono text-sm text-gray-400">{formatReportId(report.id)}</div>
            {getStatusBadge(report.status)}
          </div>
          <div className="text-gray-400 text-sm mb-2">{formatDate(report.created_at)}</div>
          <h3 className="text-lg font-bold mb-1">{report.title}</h3>
          <p className="text-gray-300 text-sm mb-3">{report.description.substring(0, 100)}...</p>
          <div className="flex items-center text-sm text-gray-400">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{report.location}</span>
          </div>
        </div>
        {report.status.toLowerCase() === "rejected" && (
          <div className="bg-red-900 p-3 mt-2">
            <p className="text-xs text-red-300">
              <span className="font-bold">Reason:</span> Insufficient details provided. Please resubmit with exact
              location and photos.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
