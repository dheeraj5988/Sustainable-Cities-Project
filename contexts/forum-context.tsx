"use client"

import type React from "react"

import { createContext, useContext } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "./auth-context"
import type { Database } from "@/types/supabase"

type ForumThread = Database["public"]["Tables"]["forum_threads"]["Row"]
type ForumThreadInsert = Database["public"]["Tables"]["forum_threads"]["Insert"]
type ForumThreadUpdate = Database["public"]["Tables"]["forum_threads"]["Update"]

type ForumComment = Database["public"]["Tables"]["forum_comments"]["Row"]
type ForumCommentInsert = Database["public"]["Tables"]["forum_comments"]["Insert"]

type ForumContextType = {
  createThread: (
    thread: Omit<ForumThreadInsert, "created_by">,
  ) => Promise<{ data: ForumThread | null; error: any | null }>
  updateThread: (id: string, updates: ForumThreadUpdate) => Promise<{ data: ForumThread | null; error: any | null }>
  deleteThread: (id: string) => Promise<{ error: any | null }>
  createComment: (
    comment: Omit<ForumCommentInsert, "created_by">,
  ) => Promise<{ data: ForumComment | null; error: any | null }>
  deleteComment: (id: string) => Promise<{ error: any | null }>
  approveThread: (id: string) => Promise<{ data: ForumThread | null; error: any | null }>
  rejectThread: (id: string) => Promise<{ data: ForumThread | null; error: any | null }>
}

const ForumContext = createContext<ForumContextType | undefined>(undefined)

export function ForumProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  const createThread = async (thread: Omit<ForumThreadInsert, "created_by">) => {
    if (!user) {
      return { data: null, error: new Error("User not authenticated") }
    }

    const { data, error } = await supabase
      .from("forum_threads")
      .insert({
        ...thread,
        created_by: user.id,
      })
      .select()
      .single()

    return { data, error }
  }

  const updateThread = async (id: string, updates: ForumThreadUpdate) => {
    const { data, error } = await supabase.from("forum_threads").update(updates).eq("id", id).select().single()

    return { data, error }
  }

  const deleteThread = async (id: string) => {
    const { error } = await supabase.from("forum_threads").delete().eq("id", id)

    return { error }
  }

  const createComment = async (comment: Omit<ForumCommentInsert, "created_by">) => {
    if (!user) {
      return { data: null, error: new Error("User not authenticated") }
    }

    const { data, error } = await supabase
      .from("forum_comments")
      .insert({
        ...comment,
        created_by: user.id,
      })
      .select()
      .single()

    return { data, error }
  }

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from("forum_comments").delete().eq("id", id)

    return { error }
  }

  const approveThread = async (id: string) => {
    const { data, error } = await supabase
      .from("forum_threads")
      .update({ status: "Approved" })
      .eq("id", id)
      .select()
      .single()

    return { data, error }
  }

  const rejectThread = async (id: string) => {
    const { data, error } = await supabase
      .from("forum_threads")
      .update({ status: "Rejected" })
      .eq("id", id)
      .select()
      .single()

    return { data, error }
  }

  return (
    <ForumContext.Provider
      value={{
        createThread,
        updateThread,
        deleteThread,
        createComment,
        deleteComment,
        approveThread,
        rejectThread,
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
