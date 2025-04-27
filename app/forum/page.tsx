"use client"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Calendar, User, Tag } from "lucide-react"

export default async function ForumPage() {
  const supabase = createServerSupabaseClient()

  // Get approved forum threads
  const { data: threads } = await supabase
    .from("forum_threads")
    .select(`
      *,
      created_by_profile:profiles!forum_threads_created_by_fkey(name)
    `)
    .eq("status", "Approved")
    .order("created_at", { ascending: false })

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community Forum</h1>
          <p className="text-muted-foreground">Discuss sustainability initiatives and ideas with your community</p>
        </div>
        {session && (
          <Button asChild>
            <Link href="/forum/new">Start a Discussion</Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        {threads?.map((thread) => (
          <Card key={thread.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{thread.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="flex items-center">
                    <MessageSquare className="mr-1 h-3 w-3" />
                    {thread.comment_count}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="line-clamp-3 text-muted-foreground">{thread.body}</p>
              <div className="flex flex-wrap gap-2">
                {thread.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center">
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="mr-1 h-4 w-4" />
                Posted by: {thread.created_by_profile?.name || "Anonymous"}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                {new Date(thread.created_at).toLocaleDateString()}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/forum/${thread.id}`}>View Discussion</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}

        {threads?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No discussions found</p>
            {session && (
              <Button className="mt-4" asChild>
                <Link href="/forum/new">Start the First Discussion</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
