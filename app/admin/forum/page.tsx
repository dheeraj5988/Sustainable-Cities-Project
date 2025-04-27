"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, MessageSquare, XCircle } from "lucide-react"
import { useForum, type ForumThread } from "@/context/forum-context"
import { ThreadViewDialog } from "@/components/forum/thread-view-dialog"
import { ThreadActionDialog } from "@/components/forum/thread-action-dialog"

export default function AdminForumPage() {
  const { threads } = useForum()
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [showActionDialog, setShowActionDialog] = useState(false)

  // Filter threads by status
  const pendingThreads = threads.filter((thread) => thread.status === "Pending")
  const approvedThreads = threads.filter((thread) => thread.status === "Approved")
  const rejectedThreads = threads.filter((thread) => thread.status === "Rejected")

  // Handle thread click to view details
  const handleThreadClick = (thread: ForumThread) => {
    setSelectedThread(thread)
    setIsViewDialogOpen(true)
  }

  // Handle thread action (approve/reject)
  const handleAction = (thread: ForumThread, type: "approve" | "reject") => {
    setSelectedThread(thread)
    setActionType(type)
    setShowActionDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Forum Moderation</h1>
        <p className="text-muted-foreground">Review and moderate community forum threads</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-600">{pendingThreads.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">Pending Threads</p>
            <p className="text-sm text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-green-600">{approvedThreads.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">Approved Threads</p>
            <p className="text-sm text-muted-foreground">Visible to all users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-red-600">{rejectedThreads.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">Rejected Threads</p>
            <p className="text-sm text-muted-foreground">Hidden from public view</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingThreads.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedThreads.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedThreads.length})</TabsTrigger>
          <TabsTrigger value="all">All Threads ({threads.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingThreads.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground">No pending threads to review</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingThreads.map((thread) => (
                <AdminThreadCard
                  key={thread.id}
                  thread={thread}
                  onView={() => handleThreadClick(thread)}
                  onApprove={() => handleAction(thread, "approve")}
                  onReject={() => handleAction(thread, "reject")}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedThreads.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground">No approved threads</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {approvedThreads.map((thread) => (
                <AdminThreadCard
                  key={thread.id}
                  thread={thread}
                  onView={() => handleThreadClick(thread)}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedThreads.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground">No rejected threads</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {rejectedThreads.map((thread) => (
                <AdminThreadCard
                  key={thread.id}
                  thread={thread}
                  onView={() => handleThreadClick(thread)}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {threads.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground">No threads found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {threads.map((thread) => (
                <AdminThreadCard
                  key={thread.id}
                  thread={thread}
                  onView={() => handleThreadClick(thread)}
                  onApprove={thread.status === "Pending" ? () => handleAction(thread, "approve") : undefined}
                  onReject={thread.status === "Pending" ? () => handleAction(thread, "reject") : undefined}
                  showActions={thread.status === "Pending"}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedThread && (
        <>
          <ThreadViewDialog thread={selectedThread} open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} />
          {actionType && (
            <ThreadActionDialog
              thread={selectedThread}
              actionType={actionType}
              open={showActionDialog}
              onOpenChange={setShowActionDialog}
              onComplete={() => {
                setShowActionDialog(false)
              }}
            />
          )}
        </>
      )}
    </div>
  )
}

interface AdminThreadCardProps {
  thread: ForumThread
  onView: () => void
  onApprove?: () => void
  onReject?: () => void
  showActions?: boolean
}

function AdminThreadCard({ thread, onView, onApprove, onReject, showActions = true }: AdminThreadCardProps) {
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
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold">{thread.id}</h3>
                <Badge className={getStatusColor(thread.status)}>{thread.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{new Date(thread.createdAt).toLocaleDateString()}</p>
            </div>
            <p className="font-medium">{thread.title}</p>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{thread.body}</p>
            <div className="flex items-center text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{thread.commentCount} comments</span>
            </div>
            <p className="text-xs mt-2">Posted by: {thread.postedByName}</p>
          </div>
          <div className="flex md:flex-col gap-2">
            <Button variant="outline" onClick={onView} className="flex-1">
              View Details
            </Button>
            {showActions && onApprove && (
              <Button onClick={onApprove} className="flex-1 bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            )}
            {showActions && onReject && (
              <Button variant="destructive" onClick={onReject} className="flex-1">
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
