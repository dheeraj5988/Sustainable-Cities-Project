"use client"

import type React from "react"

import { createContext, useContext } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/context/auth-context"

// Define types for forum threads and comments
export type ForumThread = {
  id: string
  title: string
  body: string
  tags: string[]
  status: string
  created_by: string
  created_at: string
  updated_at: string
  comment_count: number
}

export type ForumComment = {
  id: string
  thread_id: string
  body: string
  created_by: string
  created_at: string
  updated_at: string
}

type ForumContextType = {
  createThread: (thread: Partial<ForumThread>) => Promise<{ data: any; error: any }>
  updateThread: (id: string, thread: Partial<ForumThread>) => Promise<{ data: any; error: any }>
  deleteThread: (id: string) => Promise<{ data: any; error: any }>
  createComment: (comment: Partial<ForumComment>) => Promise<{ data: any; error: any }>
  updateComment: (id: string, comment: Partial<ForumComment>) => Promise<{ data: any; error: any }>
  deleteComment: (id: string) => Promise<{ data: any; error: any }>
}

const ForumContext = createContext<ForumContextType | undefined>(undefined)

export function ForumProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  // Create a new forum thread
  const createThread = async (thread: Partial<ForumThread>) => {
    if (!user) {
      return { data: null, error: { message: "You must be logged in to create a thread" } }
    }

    const { data, error } = await supabase
      .from("forum_threads")
      .insert({
        ...thread,
        created_by: user.id,
        comment_count: 0,
      })
      .select()
      .single()

    return { data, error }
  }

  // Update a forum thread
  const updateThread = async (id: string, thread: Partial<ForumThread>) => {
    if (!user) {
      return { data: null, error: { message: "You must be logged in to update a thread" } }
    }

    const { data, error } = await supabase
      .from("forum_threads")
      .update(thread)
      .eq("id", id)
      .eq("created_by", user.id) // Ensure user owns the thread
      .select()
      .single()

    return { data, error }
  }

  // Delete a forum thread
  const deleteThread = async (id: string) => {
    if (!user) {
      return { data: null, error: { message: "You must be logged in to delete a thread" } }
    }

    const { data, error } = await supabase.from("forum_threads").delete().eq("id", id).eq("created_by", user.id) // Ensure user owns the thread

    return { data, error }
  }

  // Create a new comment
  const createComment = async (comment: Partial<ForumComment>) => {
    if (!user) {
      return { data: null, error: { message: "You must be logged in to comment" } }
    }

    // Start a transaction to add comment and update thread count
    const { data, error } = await supabase.rpc("add_comment", {
      p_thread_id: comment.thread_id,
      p_body: comment.body,
      p_user_id: user.id,
    })

    return { data, error }
  }

  // Update a comment
  const updateComment = async (id: string, comment: Partial<ForumComment>) => {
    if (!user) {
      return { data: null, error: { message: "You must be logged in to update a comment" } }
    }

    const { data, error } = await supabase
      .from("forum_comments")
      .update(comment)
      .eq("id", id)
      .eq("created_by", user.id) // Ensure user owns the comment
      .select()
      .single()

    return { data, error }
  }

  // Delete a comment
  const deleteComment = async (id: string) => {
    if (!user) {
      return { data: null, error: { message: "You must be logged in to delete a comment" } }
    }

    // Start a transaction to delete comment and update thread count
    const { data, error } = await supabase.rpc("delete_comment", {
      p_comment_id: id,
      p_user_id: user.id,
    })

    return { data, error }
  }

  return (
    <ForumContext.Provider
      value={{
        createThread,
        updateThread,
        deleteThread,
        createComment,
        updateComment,
        deleteComment,
      }}
    >
      {children}
    </ForumContext.Provider>
  )
}

export const useForum = () => {
  const context = useContext(ForumContext)
  if (context === undefined) {
    throw new Error("useForum must be used within a ForumProvider")
  }
  return context
}
