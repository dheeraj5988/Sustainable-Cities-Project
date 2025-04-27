"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { useReports } from "@/context/reports-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, MapPin, Plus } from "lucide-react"
import Link from "next/link"
import { ReportViewDialog } from "@/components/reports/report-view-dialog"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorAlert } from "@/components/error-alert"
import type { Report } from "@/lib/api/report-service"

export default function DashboardPage() {
  const { user } = useAuth()
  const { reports, isLoading, error, fetchReports } = useReports()
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  // Get reports based on user role
  const userReports = user?.role === "citizen" ? reports.filter((report) => report.created_by.id === user.id) : reports

  // Filter reports by status
  const pendingReports = userReports.filter((report) => report.status === "pending")
  const inProgressReports = userReports.filter((report) => report.status === "in_progress")
  const resolvedReports = userReports.filter((report) => report.status === "resolved")

  // Handle report click to view details
  const handleReportClick = (report: Report) => {
    setSelectedReport(report)
    setIsViewDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <ErrorAlert message={error} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {user?.role === "admin" ? "Admin Dashboard" : "My Dashboard"}
        </h1>
        <p className="text-muted-foreground">
          {user?.role === "admin"
            ? "Manage and moderate sustainability reports"
            : "Track your contributions to sustainable communities"}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">
            Welcome, <span className="text-green-700">{user?.name}</span>
          </h2>
          <p className="text-muted-foreground">
            {user?.role === "admin" ? "You have admin privileges" : "Thank you for your contributions"}
          </p>
        </div>
        {user?.role === "citizen" && (
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/report">
              <Plus className="mr-2 h-4 w-4" />
              Report an Issue
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Reports ({userReports.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingReports.length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({inProgressReports.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedReports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {userReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No reports found</p>
                {user?.role === "citizen" && (
                  <Button asChild className="mt-4 bg-green-600 hover:bg-green-700">
                    <Link href="/report">Report an Issue</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userReports.map((report) => (
                <ReportCard key={report.id} report={report} onClick={() => handleReportClick(report)} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground">No pending reports</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingReports.map((report) => (
                <ReportCard key={report.id} report={report} onClick={() => handleReportClick(report)} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          {inProgressReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground">No reports in progress</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inProgressReports.map((report) => (
                <ReportCard key={report.id} report={report} onClick={() => handleReportClick(report)} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {resolvedReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground">No resolved reports</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resolvedReports.map((report) => (
                <ReportCard key={report.id} report={report} onClick={() => handleReportClick(report)} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedReport && (
        <ReportViewDialog report={selectedReport} open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} />
      )}
    </div>
  )
}

function ReportCard({ report, onClick }: { report: Report; onClick: () => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-500 hover:bg-green-600"
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "in_progress":
        return "bg-blue-500 hover:bg-blue-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{report.title}</CardTitle>
          <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
        </div>
        <CardDescription>{new Date(report.created_at).toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium">{report.description.substring(0, 100)}...</p>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{report.location}</span>
        </div>
        <div className="text-sm text-muted-foreground">Reported by: {report.created_by.name}</div>
      </CardContent>
    </Card>
  )
}
