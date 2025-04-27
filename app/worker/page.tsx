"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, MapPin, Wrench } from "lucide-react"
import { useReports, type Report } from "@/context/reports-context"
import { useAuth } from "@/context/auth-context"
import { ReportViewDialog } from "@/components/reports/report-view-dialog"

export default function WorkerDashboardPage() {
  const { user } = useAuth()
  const { reports } = useReports()
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Get reports assigned to this worker or available for assignment
  const assignedReports = user
    ? reports.filter(
        (report) => report.assignedTo === user.email && ["Approved", "In Progress", "Resolved"].includes(report.status),
      )
    : []

  const availableReports = user ? reports.filter((report) => !report.assignedTo && report.status === "Approved") : []

  // Filter reports by status
  const pendingReports = availableReports
  const inProgressReports = assignedReports.filter((report) => report.status === "In Progress")
  const resolvedReports = assignedReports.filter((report) => report.status === "Resolved")
  const allWorkerReports = [...assignedReports, ...availableReports]

  // Handle report click to view details
  const handleReportClick = (report: Report) => {
    setSelectedReport(report)
    setIsViewDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Worker Dashboard</h1>
        <p className="text-muted-foreground">Manage and resolve sustainability reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-600">{pendingReports.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">Available Reports</p>
            <p className="text-sm text-muted-foreground">Reports you can work on</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-600">{inProgressReports.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">In Progress</p>
            <p className="text-sm text-muted-foreground">Reports you're working on</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-green-600">{resolvedReports.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">Resolved</p>
            <p className="text-sm text-muted-foreground">Reports you've resolved</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">Available Reports ({pendingReports.length})</TabsTrigger>
          <TabsTrigger value="inProgress">In Progress ({inProgressReports.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedReports.length})</TabsTrigger>
          <TabsTrigger value="all">All Reports ({allWorkerReports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {pendingReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground">No available reports</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingReports.map((report) => (
                <WorkerReportCard key={report.id} report={report} onView={() => handleReportClick(report)} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inProgress" className="space-y-4">
          {inProgressReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground">No reports in progress</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {inProgressReports.map((report) => (
                <WorkerReportCard key={report.id} report={report} onView={() => handleReportClick(report)} />
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
            <div className="space-y-4">
              {resolvedReports.map((report) => (
                <WorkerReportCard key={report.id} report={report} onView={() => handleReportClick(report)} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {allWorkerReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground">No reports available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {allWorkerReports.map((report) => (
                <WorkerReportCard key={report.id} report={report} onView={() => handleReportClick(report)} />
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

interface WorkerReportCardProps {
  report: Report
  onView: () => void
}

function WorkerReportCard({ report, onView }: WorkerReportCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "In Progress":
        return "bg-blue-500 hover:bg-blue-600"
      case "Resolved":
        return "bg-green-500 hover:bg-green-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-4 w-4 mr-2" />
      case "In Progress":
        return <Wrench className="h-4 w-4 mr-2" />
      case "Resolved":
        return <CheckCircle className="h-4 w-4 mr-2" />
      default:
        return null
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold">{report.id}</h3>
                <Badge className={getStatusColor(report.status)}>
                  {getStatusIcon(report.status)}
                  {report.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{new Date(report.submittedAt).toLocaleDateString()}</p>
            </div>
            <p className="font-medium">{report.type}</p>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{report.description}</p>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{report.location}</span>
            </div>
          </div>
          <div>
            <Button onClick={onView} className="bg-green-600 hover:bg-green-700">
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
