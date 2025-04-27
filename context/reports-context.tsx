"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "./auth-context"
import type { Database } from "@/lib/database.types"
import { toast } from "@/components/ui/use-toast"

type Report = Database["public"]["Tables"]["reports"]["Row"]
type ReportInsert = Database["public"]["Tables"]["reports"]["Insert"]
type ReportUpdate = Database["public"]["Tables"]["reports"]["Update"]

type ReportsContextType = {
  reports: Report[]
  isLoading: boolean
  error: Error | null
  addReport: (report: Omit<ReportInsert, "created_by">) => Promise<{ id: string } | null>
  updateReport: (id: string, updates: ReportUpdate) => Promise<Report | null>
  deleteReport: (id: string) => Promise<boolean>
  assignReport: (id: string, workerId: string) => Promise<Report | null>
  updateReportStatus: (id: string, status: string) => Promise<Report | null>
  fetchReports: (filter?: string) => Promise<Report[]>
  fetchReport: (id: string) => Promise<Report | null>
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined)

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient<Database>()

  const fetchReports = async (filter?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      let query = supabase.from("reports").select("*")

      if (filter === "my") {
        query = query.eq("created_by", user?.id)
      } else if (filter === "assigned") {
        query = query.eq("assigned_to", user?.id)
      } else if (filter === "pending") {
        query = query.eq("status", "Pending")
      } else if (filter === "approved") {
        query = query.eq("status", "Approved")
      } else if (filter === "in-progress") {
        query = query.eq("status", "In Progress")
      } else if (filter === "resolved") {
        query = query.eq("status", "Resolved")
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setReports(data || [])
      return data || []
    } catch (err: any) {
      setError(err)
      console.error("Error fetching reports:", err)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReport = async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.from("reports").select("*").eq("id", id).single()

      if (error) {
        throw error
      }

      return data
    } catch (err: any) {
      setError(err)
      console.error("Error fetching report:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const addReport = async (report: Omit<ReportInsert, "created_by">) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to submit a report",
        variant: "destructive",
      })
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      // Use the RPC function we created
      const { data, error } = await supabase.rpc("create_report_safely", {
        report_title: report.title,
        report_description: report.description,
        report_location: report.location,
        report_latitude: report.latitude || null,
        report_longitude: report.longitude || null,
        report_type: report.type,
        report_created_by: user.id,
      })

      if (error) {
        console.error("Error creating report:", error)
        toast({
          title: "Error",
          description: "Failed to submit report. Please try again.",
          variant: "destructive",
        })
        throw error
      }

      // Refresh reports list
      await fetchReports()

      toast({
        title: "Success",
        description: "Report submitted successfully",
      })

      return { id: data }
    } catch (err: any) {
      setError(err)
      console.error("Error adding report:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updateReport = async (id: string, updates: ReportUpdate) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.from("reports").update(updates).eq("id", id).select().single()

      if (error) {
        throw error
      }

      // Update local state
      setReports((prevReports) => prevReports.map((report) => (report.id === id ? { ...report, ...updates } : report)))

      return data
    } catch (err: any) {
      setError(err)
      console.error("Error updating report:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const deleteReport = async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.from("reports").delete().eq("id", id)

      if (error) {
        throw error
      }

      // Update local state
      setReports((prevReports) => prevReports.filter((report) => report.id !== id))

      return true
    } catch (err: any) {
      setError(err)
      console.error("Error deleting report:", err)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const assignReport = async (id: string, workerId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("reports")
        .update({
          assigned_to: workerId,
          status: "In Progress",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Update local state
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === id
            ? { ...report, assigned_to: workerId, status: "In Progress", updated_at: new Date().toISOString() }
            : report,
        ),
      )

      return data
    } catch (err: any) {
      setError(err)
      console.error("Error assigning report:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updateReportStatus = async (id: string, status: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("reports")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Update local state
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === id ? { ...report, status, updated_at: new Date().toISOString() } : report,
        ),
      )

      return data
    } catch (err: any) {
      setError(err)
      console.error("Error updating report status:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ReportsContext.Provider
      value={{
        reports,
        isLoading,
        error,
        addReport,
        updateReport,
        deleteReport,
        assignReport,
        updateReportStatus,
        fetchReports,
        fetchReport,
      }}
    >
      {children}
    </ReportsContext.Provider>
  )
}

export function useReports() {
  const context = useContext(ReportsContext)
  if (context === undefined) {
    throw new Error("useReports must be used within a ReportsProvider")
  }
  return context
}
