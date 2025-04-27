import { createServerSupabaseClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, User } from "lucide-react"

export default async function ReportsPage() {
  const supabase = createServerSupabaseClient()

  // Get reports
  const { data: reports } = await supabase
    .from("reports")
    .select(`
      *,
      created_by_profile:profiles!reports_created_by_fkey(name),
      assigned_to_profile:profiles!reports_assigned_to_fkey(name)
    `)
    .order("created_at", { ascending: false })

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Status badge colors
  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    Approved: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    Rejected: "bg-red-100 text-red-800 hover:bg-red-100",
    "In Progress": "bg-purple-100 text-purple-800 hover:bg-purple-100",
    Completed: "bg-green-100 text-green-800 hover:bg-green-100",
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community Reports</h1>
          <p className="text-muted-foreground">View and track issues reported by citizens</p>
        </div>
        {session && (
          <Button asChild>
            <Link href="/reports/new">Report an Issue</Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports?.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="line-clamp-2">{report.title}</CardTitle>
                <Badge className={statusColors[report.status] || ""}>{report.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="line-clamp-3 text-sm text-muted-foreground">{report.description}</p>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-4 w-4" />
                {report.location}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="mr-1 h-4 w-4" />
                Reported by: {report.created_by_profile?.name || "Anonymous"}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                {new Date(report.created_at).toLocaleDateString()}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/reports/${report.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}

        {reports?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No reports found</p>
            {session && (
              <Button className="mt-4" asChild>
                <Link href="/reports/new">Submit the First Report</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
