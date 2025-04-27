import { createServerSupabaseClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, FileText, MessageSquare, AlertTriangle } from "lucide-react"

export default async function Home() {
  const supabase = createServerSupabaseClient()

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get counts
  const { count: reportsCount } = await supabase.from("reports").select("*", { count: "exact", head: true })

  const { count: threadsCount } = await supabase
    .from("forum_threads")
    .select("*", { count: "exact", head: true })
    .eq("status", "Approved")

  const { count: pendingReportsCount } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "Pending")

  return (
    <div className="space-y-8">
      <section className="py-12 md:py-24 lg:py-32 bg-green-50 dark:bg-green-950 rounded-lg">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Building Sustainable Cities Together
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Report issues, track progress, and collaborate with your community to create a more sustainable urban
                environment.
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/reports/new">Report an Issue</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/forum">Join the Discussion</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportsCount}</div>
                <p className="text-xs text-muted-foreground">Issues reported by citizens</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Forum Discussions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{threadsCount}</div>
                <p className="text-xs text-muted-foreground">Active community discussions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingReportsCount}</div>
                <p className="text-xs text-muted-foreground">Reports awaiting review</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">How It Works</h2>
              <p className="text-muted-foreground">Join our community effort to build a more sustainable city</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Report Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Submit reports about infrastructure problems, waste management issues, or other concerns in your
                  neighborhood.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Track Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Follow the status of your reports as city workers address the issues and provide updates.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Discuss Solutions</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Participate in community forums to discuss sustainability initiatives and collaborate on solutions.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-8 text-center">
            {!session ? (
              <Button asChild>
                <Link href="/signup">
                  Join Our Community <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/reports/new">
                  Submit a Report <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
