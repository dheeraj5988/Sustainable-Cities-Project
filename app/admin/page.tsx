import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"

export default async function AdminPage() {
  const supabase = createServerSupabaseClient()

  // Get session and check if user is admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  // Redirect if not admin
  if (profile?.role !== "admin") {
    redirect("/")
  }

  // Get pending reports
  const { data: pendingReports } = await supabase
    .from("reports")
    .select(`
      *,
      created_by_profile:profiles!reports_created_by_fkey(name)
    `)
    .eq("status", "Pending")
    .order("created_at", { ascending: false })

  // Get pending forum threads
  const { data: pendingThreads } = await supabase
    .from("forum_threads")
    .select(`
      *,
      created_by_profile:profiles!forum_threads_created_by_fkey(name)
    `)
    .eq("status", "Pending")
    .order("created_at", { ascending: false })

  // Get all users
  const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage reports, forum threads, and users</p>
      </div>

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">
            Pending Reports
            {pendingReports && pendingReports.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingReports.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="threads">
            Pending Threads
            {pendingThreads && pendingThreads.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingThreads.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4 mt-4">
          {pendingReports?.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">No pending reports to review</p>
          )}

          {pendingReports?.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <CardTitle>{report.title}</CardTitle>
                <CardDescription>
                  Reported by {report.created_by_profile?.name || "Anonymous"} on{" "}
                  {new Date(report.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>{report.description}</p>
                <div className="flex items-center text-sm text-muted-foreground">Location: {report.location}</div>
                <div className="flex items-center text-sm text-muted-foreground">Type: {report.type}</div>
              </CardContent>
              <div className="flex justify-end p-4 space-x-2">
                <Button variant="outline" asChild>
                  <Link href={`/reports/${report.id}`}>View Details</Link>
                </Button>
                <Button variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button variant="default">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="threads" className="space-y-4 mt-4">
          {pendingThreads?.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">No pending threads to review</p>
          )}

          {pendingThreads?.map((thread) => (
            <Card key={thread.id}>
              <CardHeader>
                <CardTitle>{thread.title}</CardTitle>
                <CardDescription>
                  Posted by {thread.created_by_profile?.name || "Anonymous"} on{" "}
                  {new Date(thread.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>{thread.body}</p>
                {thread.tags && thread.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {thread.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <div className="flex justify-end p-4 space-x-2">
                <Button variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button variant="default">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage user accounts and roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Name</th>
                      <th className="text-left py-2 px-4">Email</th>
                      <th className="text-left py-2 px-4">Role</th>
                      <th className="text-left py-2 px-4">Joined</th>
                      <th className="text-left py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="py-2 px-4">{user.name}</td>
                        <td className="py-2 px-4">{user.email}</td>
                        <td className="py-2 px-4">
                          <Badge
                            variant={
                              user.role === "admin" ? "default" : user.role === "worker" ? "secondary" : "outline"
                            }
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-2 px-4">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="py-2 px-4">
                          <Button variant="outline" size="sm">
                            Edit Role
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
