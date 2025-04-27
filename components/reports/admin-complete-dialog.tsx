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
import { CheckCircle } from "lucide-react"
import { type Report, useReports } from "@/context/reports-context"
import { toast } from "@/components/ui/use-toast"

interface AdminCompleteDialogProps {
  report: Report
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
}

export function AdminCompleteDialog({ report, open, onOpenChange, onComplete }: AdminCompleteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { completeReport } = useReports()

  const handleComplete = () => {
    setIsSubmitting(true)

    // Simulate API delay
    setTimeout(() => {
      completeReport(report.id)
      toast({
        title: "Report completed",
        description: `Report ${report.id} has been marked as completed.`,
      })
      setIsSubmitting(false)
      onComplete()
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Report as Completed</DialogTitle>
          <DialogDescription>
            Confirm that this report has been successfully resolved and can be marked as completed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-md border border-green-200">
            <p className="text-sm text-green-800">
              This action will mark the report as completed and notify the user who submitted it.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleComplete} disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
            {isSubmitting ? (
              "Processing..."
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Completed
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
