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
import { CheckCircle, XCircle } from "lucide-react"
import { type ForumThread, useForum } from "@/context/forum-context"
import { toast } from "@/components/ui/use-toast"

interface ThreadActionDialogProps {
  thread: ForumThread
  actionType: "approve" | "reject"
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
}

export function ThreadActionDialog({ thread, actionType, open, onOpenChange, onComplete }: ThreadActionDialogProps) {
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { approveThread, rejectThread } = useForum()

  const handleAction = () => {
    setIsSubmitting(true)

    // Simulate API delay
    setTimeout(() => {
      if (actionType === "approve") {
        approveThread(thread.id)
        toast({
          title: "Thread approved",
          description: "The thread is now visible to all users",
        })
      } else {
        rejectThread(thread.id, comment)
        toast({
          title: "Thread rejected",
          description: "The thread has been rejected and hidden from public view",
        })
      }
      setIsSubmitting(false)
      onComplete()
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{actionType === "approve" ? "Approve Thread" : "Reject Thread"}</DialogTitle>
          <DialogDescription>
            {actionType === "approve"
              ? "Are you sure you want to approve this thread?"
              : "Please provide a reason for rejecting this thread."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {actionType === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="comment">Rejection Reason</Label>
              <Textarea
                id="comment"
                placeholder="Please provide details about why this thread is being rejected..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            disabled={(actionType === "reject" && !comment.trim()) || isSubmitting}
            className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
          >
            {isSubmitting ? (
              "Processing..."
            ) : actionType === "approve" ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
