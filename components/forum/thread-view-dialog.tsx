"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, MessageSquare, User } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import type { ForumThread } from "@/context/forum-context"

interface ThreadViewDialogProps {
  thread: ForumThread
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ThreadViewDialog({ thread, open, onOpenChange }: ThreadViewDialogProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-500 hover:bg-green-600"
      case "Rejected":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-yellow-500 hover:bg-yellow-600"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl">{thread.title}</DialogTitle>
            <Badge className={getStatusColor(thread.status)}>{thread.status}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{thread.postedByName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{thread.commentCount} comments</span>
            </div>
          </div>

          <Separator />

          <div className="whitespace-pre-wrap">{thread.body}</div>

          {thread.tags && thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {thread.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="bg-green-50 hover:bg-green-100 text-green-800">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {thread.status === "Rejected" && thread.comment && (
            <div className="bg-red-50 p-3 rounded-md border border-red-200">
              <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
              <p className="text-sm text-red-700">{thread.comment}</p>
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Comments</h3>
            {thread.commentCount > 0 ? (
              <div className="space-y-4">
                {/* This would be replaced with actual comments */}
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="flex justify-between">
                    <p className="font-medium text-sm">Community Member</p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                  <p className="text-sm mt-1">This is a great discussion topic. I've been looking into this as well.</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="flex justify-between">
                    <p className="font-medium text-sm">Sustainability Expert</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                  <p className="text-sm mt-1">I can share some resources on this topic if you're interested.</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
