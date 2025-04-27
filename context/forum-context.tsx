"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "./auth-context"
import { toast } from "@/components/ui/use-toast"

// Define forum thread type
export interface ForumThread {
  id: string
  title: string
  body: string
  postedByName: string
  postedByEmail: string
  createdAt: string
  status: string
  commentCount: number
  tags?: string[]
  comment?: string
}

// Define forum context type
interface ForumContextType {
  threads: ForumThread[]
  isLoading: boolean
  error: string | null
  addThread: (threadData: { title: string; body: string; tags?: string[] }) => Promise<ForumThread | null>
  approveThread: (id: string) => Promise<boolean>
  rejectThread: (id: string, comment: string) => Promise<boolean>
  getThreadById: (id: string) => ForumThread | undefined
  getUserThreads: (userEmail: string) => ForumThread[]
  getApprovedThreads: () => ForumThread[]
  fetchThreads: () => Promise<void>
  addComment: (threadId: string, content: string) => Promise<boolean>
  getComments: (threadId: string) => Promise<any[]>
}

// Create the context
const ForumContext = createContext<ForumContextType | undefined>(undefined)

// Forum provider component
export function ForumProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Fetch threads on mount
  useEffect(() => {
    fetchThreads()
  }, [])

  // Fetch all threads
  const fetchThreads = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // With RLS, this query will automatically filter based on user role
      const { data, error: supabaseError } = await supabase
        .from("forum_threads")
        .select(`
          *,
          profiles:created_by(*)
        `)
        .order("created_at", { ascending: false })

      if (supabaseError) {
        setError(supabaseError.message || "Failed to fetch threads")
        return
      }

      if (data) {
        const formattedThreads = data.map((thread) => ({
          id: thread.id,
          title: thread.title,
          body: thread.body,
          postedByName: thread.profiles?.name || "Anonymous",
          postedByEmail: thread.profiles?.email || "",
          createdAt: thread.created_at,
          status: thread.status || "Pending",
          commentCount: thread.comment_count || 0,
          tags: thread.tags,
          comment: thread.comment,
        }))

        setThreads(formattedThreads)
      }
    } catch (error) {
      console.error("Error fetching threads:", error)
      setError("An unexpected error occurred while fetching threads")
    } finally {
      setIsLoading(false)
    }
  }

  // Add a new thread
  const addThread = async (threadData: {
    title: string
    body: string
    tags?: string[]
  }): Promise<ForumThread | null> => {
    if (!user) return null

    setIsLoading(true)
    setError(null)

    try {
      const newThread = {
        title: threadData.title,
        body: threadData.body,
        created_by: user.id,
        tags: threadData.tags || [],
        status: user.role === "admin" ? "Approved" : "Pending",
        comment_count: 0,
      }

      const { data, error: supabaseError } = await supabase
        .from("forum_threads")
        .insert([newThread])
        .select(`
          *,
          profiles:created_by(*)
        `)
        .single()

      if (supabaseError) {
        setError(supabaseError.message || "Failed to create thread")
        return null
      }

      if (data) {
        const formattedThread = {
          id: data.id,
          title: data.title,
          body: data.body,
          postedByName: data.profiles?.name || user.name,
          postedByEmail: data.profiles?.email || user.email,
          createdAt: data.created_at,
          status: data.status || "Pending",
          commentCount: 0,
          tags: data.tags,
        }

        setThreads((prev) => [formattedThread, ...prev])
        toast({
          title: "Thread created",
          description:
            user.role === "admin" ? "Your thread has been published" : "Your thread has been submitted for approval",
        })
        return formattedThread
      }

      return null
    } catch (error) {
      console.error("Error creating thread:", error)
      setError("An unexpected error occurred while creating the thread")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Approve a thread
  const approveThread = async (id: string): Promise<boolean> => {
    if (!user || user.role !== "admin") return false

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: supabaseError } = await supabase
        .from("forum_threads")
        .update({ status: "Approved" })
        .eq("id", id)
        .select()
        .single()

      if (supabaseError) {
        setError(supabaseError.message || "Failed to approve thread")
        return false
      }

      if (data) {
        setThreads((prev) => prev.map((thread) => (thread.id === id ? { ...thread, status: "Approved" } : thread)))
        toast({
          title: "Thread approved",
          description: "The thread has been approved and is now visible to all users",
        })
        return true
      }

      return false
    } catch (error) {
      console.error("Error approving thread:", error)
      setError("An unexpected error occurred while approving the thread")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Reject a thread
  const rejectThread = async (id: string, comment: string): Promise<boolean> => {
    if (!user || user.role !== "admin") return false

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: supabaseError } = await supabase
        .from("forum_threads")
        .update({
          status: "Rejected",
          comment,
        })
        .eq("id", id)
        .select()
        .single()

      if (supabaseError) {
        setError(supabaseError.message || "Failed to reject thread")
        return false
      }

      if (data) {
        setThreads((prev) =>
          prev.map((thread) => (thread.id === id ? { ...thread, status: "Rejected", comment } : thread)),
        )
        toast({
          title: "Thread rejected",
          description: "The thread has been rejected",
        })
        return true
      }

      return false
    } catch (error) {
      console.error("Error rejecting thread:", error)
      setError("An unexpected error occurred while rejecting the thread")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Get a thread by ID
  const getThreadById = (id: string) => {
    return threads.find((thread) => thread.id === id)
  }

  // Get threads for a specific user
  const getUserThreads = (userEmail: string) => {
    return threads.filter((thread) => thread.postedByEmail === userEmail)
  }

  // Get all approved threads
  const getApprovedThreads = () => {
    return threads.filter((thread) => thread.status === "Approved")
  }

  // Add a comment to a thread
  const addComment = async (threadId: string, content: string): Promise<boolean> => {
    if (!user) return false

    setIsLoading(true)
    setError(null)

    try {
      const newComment = {
        thread_id: threadId,
        content,
        created_by: user.id,
      }

      const { error: commentError } = await supabase.from("forum_comments").insert([newComment])

      if (commentError) {
        setError(commentError.message || "Failed to add comment")
        return false
      }

      // Update comment count
      const { data, error: updateError } = await supabase.rpc("increment_comment_count", {
        thread_id: threadId,
      })

      if (updateError) {
        console.error("Error updating comment count:", updateError)
      }

      // Update local state
      setThreads((prev) =>
        prev.map((thread) => (thread.id === threadId ? { ...thread, commentCount: thread.commentCount + 1 } : thread)),
      )

      toast({
        title: "Comment added",
        description: "Your comment has been added to the thread",
      })
      return true
    } catch (error) {
      console.error("Error adding comment:", error)
      setError("An unexpected error occurred while adding the comment")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Get comments for a thread
  const getComments = async (threadId: string): Promise<any[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: supabaseError } = await supabase
        .from("forum_comments")
        .select(`
          *,
          profiles:created_by(*)
        `)
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true })

      if (supabaseError) {
        setError(supabaseError.message || "Failed to fetch comments")
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error fetching comments:", error)
      setError("An unexpected error occurred while fetching comments")
      return []
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ForumContext.Provider
      value={{
        threads,
        isLoading,
        error,
        addThread,
        approveThread,
        rejectThread,
        getThreadById,
        getUserThreads,
        getApprovedThreads,
        fetchThreads,
        addComment,
        getComments,
      }}
    >
      {children}
    </ForumContext.Provider>
  )
}

// Custom hook to use forum context
export function useForum() {
  const context = useContext(ForumContext)
  if (context === undefined) {
    throw new Error("useForum must be used within a ForumProvider")
  }
  return context
}
