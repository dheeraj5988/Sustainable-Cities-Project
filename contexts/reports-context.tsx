"use client"

import type React from "react"

import { createContext, useContext } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "./auth-context"
import type { Database } from "@/types/supabase"

type Report = Database["public"]["Tables"]["reports"]["Row"]
type ReportInsert = Database["public"]["Tables"]["reports"]["Insert"]
type ReportUpdate = Database["public"]["Tables"]["reports"]["Update"]

type ReportsContextType = {
  createReport: (report: Omit<ReportInsert, "created_by">) => Promise<{ data: Report | null; error: any | null }>
  updateReport: (id: string, updates: ReportUpdate) => Promise<{ data: Report | null; error: any | null }>
  deleteReport: (id: string) => Promise<{ error: any | null }>
  assignReport: (id: string, workerId: string) => Promise<{ data: Report | null; error: any | null }>
  updateReportStatus: (id: string, status: string) => Promise<{ data: Report | null; error: any | null }>
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined)

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  const createReport = async (report: Omit<ReportInsert, "created_by">) => {
    if (!user) {
      return { data: null, error: new Error("User not authenticated") }
    }

    const { data, error } = await supabase
      .from("reports")
      .insert({
        ...report,
        created_by: user.id,
      })
      .select()
      .single()

    return { data, error }
  }

  const updateReport = async (id: string, updates: ReportUpdate) => {
    const { data, error } = await supabase.from("reports").update(updates).eq("id", id).select().single()

    return { data, error }
  }

  const deleteReport = async (id: string) => {
    const { error } = await supabase.from("reports").delete().eq("id", id)

    return { error }
  }

  const assignReport = async (id: string, workerId: string) => {
    const { data, error } = await supabase
      .from("reports")
      .update({
        assigned_to: workerId,
        status: "In Progress",
      })
      .eq("id", id)
      .select()
      .single()

    return { data, error }
  }

  const updateReportStatus = async (id: string, status: string) => {
    const { data, error } = await supabase.from("reports").update({ status }).eq("id", id).select().single()

    return { data, error }
  }

  return (
    <ReportsContext.Provider
      value={{
        createReport,
        updateReport,
        deleteReport,
        assignReport,
        updateReportStatus,
      }}
    >
      {children}
    </ReportsContext.Provider>
  )
}

export const useReports = () => {
  const context = useContext(ReportsContext)
  if (context === undefined) {
    throw new Error("useReports must be used within a ReportsProvider")
  }
  return context
}
