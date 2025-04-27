"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Copy, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface WorkerInvite {
  id: string
  code: string
  email: string | null
  created_by: string
  is_used: boolean
  used_by: string | null
  created_at: string
  expires_at: string
  creator_name?: string
  user_name?: string
}

export default function AdminInvitesPage() {
  const { user } = useAuth()
  const [invites, setInvites] = useState<WorkerInvite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newInviteEmail, setNewInviteEmail] = useState("")
  const [expiryDays, setExpiryDays] = useState(7)

  useEffect(() => {
    fetchInvites()
  }, [])

  const fetchInvites = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("worker_invites")
        .select(`
          *,
          creator:profiles!worker_invites_created_by_fkey(name),
          user:profiles!worker_invites_used_by_fkey(name)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch invitation codes",
          variant: "destructive",
        })
        return
      }

      // Format the data
      const formattedInvites = data.map((invite) => ({
        ...invite,
        creator_name: invite.creator?.name,
        user_name: invite.user?.name,
      }))

      setInvites(formattedInvites || [])
    } catch (error) {
      console.error("Error fetching invites:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateInviteCode = () => {
    // Generate a random code (8 characters, alphanumeric)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const createInvite = async () => {
    if (!user) return

    setIsCreating(true)
    try {
      const code = generateInviteCode()
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + expiryDays)

      const { data, error } = await supabase
        .from("worker_invites")
        .insert({
          code,
          email: newInviteEmail || null,
          created_by: user.id,
          expires_at: expiryDate.toISOString(),
        })
        .select()
        .single()

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create invitation code",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Worker invitation code created successfully",
      })

      // Refresh the list
      fetchInvites()
      setNewInviteEmail("")
    } catch (error) {
      console.error("Error creating invite:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const deleteInvite = async (id: string) => {
    try {
      const { error } = await supabase.from("worker_invites").delete().eq("id", id)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete invitation code",
          variant: "destructive",
        })
        return
      }

      // Update local state
      setInvites((prevInvites) => prevInvites.filter((invite) => invite.id !== id))

      toast({
        title: "Success",
        description: "Invitation code deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting invite:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Copied!",
      description: "Invitation code copied to clipboard",
    })
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
        <h1 className="text-3xl font-bold tracking-tight">Worker Invitations</h1>
        <p className="text-muted-foreground">Manage worker invitation codes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Invitation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="worker@example.com"
                value={newInviteEmail}
                onChange={(e) => setNewInviteEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Leave blank to allow any email</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry">Expires After (Days)</Label>
              <Input
                id="expiry"
                type="number"
                min="1"
                max="90"
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number.parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={createInvite} disabled={isCreating} className="w-full">
                {isCreating ? <LoadingSpinner size="sm" /> : <Plus className="mr-2 h-4 w-4" />}
                Generate Invite Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Invitation Codes ({invites.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Code</th>
                  <th className="text-left py-3 px-4">Email Restriction</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Created</th>
                  <th className="text-left py-3 px-4">Expires</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => (
                  <tr key={invite.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono">{invite.code}</td>
                    <td className="py-3 px-4">{invite.email || "Any email"}</td>
                    <td className="py-3 px-4">
                      {invite.is_used ? (
                        <Badge className="bg-green-100 text-green-800">Used by {invite.user_name || "Unknown"}</Badge>
                      ) : new Date(invite.expires_at) < new Date() ? (
                        <Badge className="bg-red-100 text-red-800">Expired</Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">{format(new Date(invite.created_at), "MMM d, yyyy")}</td>
                    <td className="py-3 px-4">{format(new Date(invite.expires_at), "MMM d, yyyy")}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {!invite.is_used && new Date(invite.expires_at) >= new Date() && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(invite.code)}
                            title="Copy code"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                        {!invite.is_used && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteInvite(invite.id)}
                            className="text-red-500"
                            title="Delete code"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {invites.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      No invitation codes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
