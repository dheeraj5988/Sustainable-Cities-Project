"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, Upload, Wrench } from "lucide-react"
import { type Report, useReports } from "@/context/reports-context"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"

interface WorkerActionDialogProps {
  report: Report
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
}

export function WorkerActionDialog({ report, open, onOpenChange, onComplete }: WorkerActionDialogProps) {
  const [workerNotes, setWorkerNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [solutionImages, setSolutionImages] = useState<string[]>([])
  const { user } = useAuth()
  const { startWorkOnReport, resolveReport } = useReports()

  const isApproved = report.status === "Approved"
  const isInProgress = report.status === "In Progress"

  const handleAction = () => {
    setIsSubmitting(true)

    // Simulate API delay
    setTimeout(() => {
      if (isApproved) {
        startWorkOnReport(report.id)
        toast({
          title: "Work started",
          description: `You have started working on report ${report.id}`,
        })
      } else if (isInProgress) {
        if (!workerNotes.trim()) {
          toast({
            title: "Error",
            description: "Please provide resolution details",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }

        // In a real app, we would upload images here
        // For now, we'll use placeholder images
        const images = ["/placeholder.svg?height=300&width=400", "/placeholder.svg?height=300&width=400"]

        resolveReport(report.id, workerNotes, images)
        toast({
          title: "Report resolved",
          description: `You have successfully resolved report ${report.id}`,
        })
      }

      setIsSubmitting(false)
      onComplete()
    }, 1000)
  }

  const handleImageUpload = () => {
    // In a real app, this would open a file picker
    // For now, we'll just add a placeholder image
    setSolutionImages([...solutionImages, "/placeholder.svg?height=300&width=400"])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isApproved ? "Start Working on Report" : isInProgress ? "Mark Report as Resolved" : "Update Report"}
          </DialogTitle>
          <DialogDescription>
            {isApproved
              ? "Confirm that you are starting work on this report."
              : isInProgress
                ? "Provide details about how you resolved this issue."
                : "Update the status of this report."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isInProgress && (
            <>
              <div className="space-y-2">
                <Label htmlFor="workerNotes">Resolution Details</Label>
                <Textarea
                  id="workerNotes"
                  placeholder="Describe how you resolved the issue..."
                  value={workerNotes}
                  onChange={(e) => setWorkerNotes(e.target.value)}
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Solution Images</Label>
                <div className="grid grid-cols-2 gap-2">
                  {solutionImages.map((image, index) => (
                    <div key={index} className="aspect-video bg-muted rounded-md overflow-hidden">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Solution ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="aspect-video flex flex-col items-center justify-center border-dashed"
                    onClick={handleImageUpload}
                  >
                    <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload Image</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Upload images showing the resolved issue.</p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            disabled={(isInProgress && !workerNotes.trim()) || isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              "Processing..."
            ) : isApproved ? (
              <>
                <Wrench className="mr-2 h-4 w-4" />
                Start Working
              </>
            ) : isInProgress ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Resolved
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
