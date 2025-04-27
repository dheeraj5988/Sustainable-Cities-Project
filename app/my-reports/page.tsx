"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export default function MyReportsPage() {
  const { user, loading } = useAuth()
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }

    const fetchReports = async () => {
      if (user) {
        setIsLoading(true)
        const { data, error } = await supabase
          .from("reports")
          .select("*")
          .eq("created_by", user.id)
          .order("created_at", { ascending: false })

        if (!error && data) {
          setReports(data)
        }
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [loading, user, router])

  // Status badge colors
  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    Approved: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    Rejected: "bg-red-100 text-red-800 hover:bg-red-100",
    "In Progress": "bg-purple-100 text-purple-800 hover:bg-purple-100",
    Completed: "bg-green-100 text-green-800 hover:bg-green-100",
  }

  if (loading || isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Reports</h1>
          <p className="text-muted-foreground">View and track the status of your submitted reports</p>
        </div>
        <Button asChild>
          <Link href="/reports/new">Report an Issue</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
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

        {reports.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">You haven't submitted any reports yet</p>
            <Button className="mt-4" asChild>
              <Link href="/reports/new">Submit Your First Report</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
