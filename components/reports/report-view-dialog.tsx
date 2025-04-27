"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, User, CheckCircle, XCircle, AlertCircle, Wrench } from "lucide-react"
import type { Report } from "@/lib/api/report-service"
import { useAuth } from "@/context/auth-context"
import { useState } from "react"
import { ReportActionDialog } from "./report-action-dialog"
import { WorkerActionDialog } from "./worker-action-dialog"
import { AdminCompleteDialog } from "./admin-complete-dialog"

interface ReportViewDialogProps {
  report: Report
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportViewDialog({ report, open, onOpenChange }: ReportViewDialogProps) {
  const { user } = useAuth()
  const [actionType, setActionType] = useState<"approve" | "reject" | "complete" | null>(null)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [showWorkerDialog, setShowWorkerDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "in_progress":
        return <Wrench className="h-5 w-5 text-blue-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

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

  const handleAction = (type: "approve" | "reject" | "complete") => {
    setActionType(type)
    setShowActionDialog(true)
  }

  const handleWorkerAction = () => {
    setShowWorkerDialog(true)
  }

  const handleCompleteAction = () => {
    setShowCompleteDialog(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>Report Details</DialogTitle>
              <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Report ID</p>
                <p className="font-medium">{report.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Title</p>
                <p className="font-medium">{report.title}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="mt-1">{report.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <p>{report.location}</p>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p>{new Date(report.created_at).toLocaleString()}</p>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <p>
                {report.created_by.name} ({report.created_by.email})
              </p>
            </div>

            {report.assigned_to && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Assignment Details</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <p>Assigned to: {report.assigned_to.name}</p>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <p>Last updated: {new Date(report.updated_at).toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* Admin Actions */}
            {user?.role === "admin" && report.status === "pending" && (
              <div className="flex gap-2 mt-4">
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleAction("approve")}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => handleAction("reject")}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </div>
            )}

            {/* Admin Actions for Resolved Reports */}
            {user?.role === "admin" && report.status === "resolved" && (
              <div className="flex gap-2 mt-4">
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={handleCompleteAction}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Completed
                </Button>
              </div>
            )}

            {/* Worker Actions */}
            {user?.role === "worker" &&
              (report.status === "pending" || report.status === "in_progress") &&
              (!report.assigned_to || report.assigned_to.id === user.id) && (
                <div className="flex gap-2 mt-4">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleWorkerAction}>
                    {report.status === "pending" ? (
                      <>
                        <Wrench className="mr-2 h-4 w-4" />
                        Start Working
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Resolved
                      </>
                    )}
                  </Button>
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>

      {actionType && (
        <ReportActionDialog
          report={report}
          actionType={actionType}
          open={showActionDialog}
          onOpenChange={setShowActionDialog}
          onComplete={() => {
            setShowActionDialog(false)
            onOpenChange(false)
          }}
        />
      )}

      {report && (
        <WorkerActionDialog
          report={report}
          open={showWorkerDialog}
          onOpenChange={setShowWorkerDialog}
          onComplete={() => {
            setShowWorkerDialog(false)
            onOpenChange(false)
          }}
        />
      )}

      {report && (
        <AdminCompleteDialog
          report={report}
          open={showCompleteDialog}
          onOpenChange={setShowCompleteDialog}
          onComplete={() => {
            setShowCompleteDialog(false)
            onOpenChange(false)
          }}
        />
      )}
    </>
  )
}
