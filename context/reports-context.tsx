"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/context/auth-context"
import { toast } from "@/components/ui/use-toast"

// Define report type
export interface Report {
  id: string
  title: string
  description: string
  location: string
  latitude?: number
  longitude?: number
  status: string
  created_by: {
    id: string
    name: string
    email: string
  }
  assigned_to?: {
    id: string
    name: string
    email: string
  }
  resolution_details?: string
  created_at: string
  updated_at: string
  submittedAt: string
  submittedBy: string
  type: string
  comment?: string
}

// Define reports context type
interface ReportsContextType {
  reports: Report[]
  isLoading: boolean
  error: string | null
  addReport: (reportData: {
    title: string
    description: string
    location: string
    latitude?: number
    longitude?: number
    type: string
  }) => Promise<Report | null>
  approveReport: (id: string) => Promise<boolean>
  rejectReport: (id: string, comment: string) => Promise<boolean>
  assignReport: (id: string, workerId: string) => Promise<boolean>
  startWorkOnReport: (id: string) => Promise<boolean>
  resolveReport: (id: string, resolutionDetails: string, images?: string[]) => Promise<boolean>
  completeReport: (id: string) => Promise<boolean>
  getReportById: (id: string) => Report | undefined
  getUserReports: (userId: string) => Report[]
  getWorkerReports: (workerId: string) => Report[]
  fetchReports: () => Promise<void>
}

// Create the context
const ReportsContext = createContext<ReportsContextType | undefined>(undefined)

// Reports provider component
export function ReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const auth = useAuth()
  const user = auth?.user

  // Fetch reports on mount
  useEffect(() => {
    if (user) {
      fetchReports()
    }
  }, [user])

  // Fetch all reports
  const fetchReports = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      // With RLS, this query will automatically filter based on user role
      let query = supabase
        .from("reports")
        .select(`
          *,
          created_by:profiles!reports_created_by_fkey(*),
          assigned_to:profiles!reports_assigned_to_fkey(*)
        `)
        .order("created_at", { ascending: false })

      // We don't need to filter by role anymore as RLS will handle this
      // But we can still add specific filters if needed
      if (user.role === "worker") {
        // Workers see reports assigned to them or available for assignment
        query = query.or(`assigned_to.eq.${user.id},status.eq.Approved`)
      }

      const { data, error: supabaseError } = await query

      if (supabaseError) {
        setError(supabaseError.message || "Failed to fetch reports")
        return
      }

      if (data) {
        const formattedReports = data.map((report) => ({
          id: report.id,
          title: report.title,
          description: report.description,
          location: report.location,
          latitude: report.latitude,
          longitude: report.longitude,
          status: report.status,
          created_by: {
            id: report.created_by.id,
            name: report.created_by.name,
            email: report.created_by.email,
          },
          assigned_to: report.assigned_to
            ? {
                id: report.assigned_to.id,
                name: report.assigned_to.name,
                email: report.assigned_to.email,
              }
            : undefined,
          resolution_details: report.resolution_details,
          created_at: report.created_at,
          updated_at: report.updated_at,
          submittedAt: report.created_at,
          submittedBy: report.created_by.name,
          type: report.type,
          comment: report.comment,
        }))

        setReports(formattedReports)
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
      setError("An unexpected error occurred while fetching reports")
    } finally {
      setIsLoading(false)
    }
  }

  // Add a new report
  const addReport = async (reportData: {
    title: string
    description: string
    location: string
    latitude?: number
    longitude?: number
    type: string
  }): Promise<Report | null> => {
    if (!user) return null

    setIsLoading(true)
    setError(null)

    try {
      const newReport = {
        title: reportData.title,
        description: reportData.description,
        location: reportData.location,
        latitude: reportData.latitude,
        longitude: reportData.longitude,
        type: reportData.type,
        status: "Pending",
        created_by: user.id,
      }

      const { data, error: supabaseError } = await supabase
        .from("reports")
        .insert([newReport])
        .select(`
          *,
          created_by:profiles!reports_created_by_fkey(*),
          assigned_to:profiles!reports_assigned_to_fkey(*)
        `)
        .single()

      if (supabaseError) {
        setError(supabaseError.message || "Failed to create report")
        return null
      }

      if (data) {
        const formattedReport = {
          id: data.id,
          title: data.title,
          description: data.description,
          location: data.location,
          latitude: data.latitude,
          longitude: data.longitude,
          status: data.status,
          created_by: {
            id: data.created_by.id,
            name: data.created_by.name,
            email: data.created_by.email,
          },
          assigned_to: data.assigned_to
            ? {
                id: data.assigned_to.id,
                name: data.assigned_to.name,
                email: data.assigned_to.email,
              }
            : undefined,
          resolution_details: data.resolution_details,
          created_at: data.created_at,
          updated_at: data.updated_at,
          submittedAt: data.created_at,
          submittedBy: data.created_by.name,
          type: data.type,
          comment: data.comment,
        }

        setReports((prev) => [formattedReport, ...prev])
        toast({
          title: "Report submitted",
          description: "Your report has been submitted successfully",
        })
        return formattedReport
      }

      return null
    } catch (error) {
      console.error("Error creating report:", error)
      setError("An unexpected error occurred while creating the report")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // The rest of the functions remain largely the same
  // They will work with RLS because the policies we set up
  // allow users to update their own reports, admins to update any report, etc.

  // Approve a report
  const approveReport = async (id: string): Promise<boolean> => {
    if (!user) return false

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: supabaseError } = await supabase
        .from("reports")
        .update({ status: "Approved" })
        .eq("id", id)
        .select(`
          *,
          created_by:profiles!reports_created_by_fkey(*),
          assigned_to:profiles!reports_assigned_to_fkey(*)
        `)
        .single()

      if (supabaseError) {
        setError(supabaseError.message || "Failed to approve report")
        return false
      }

      if (data) {
        const formattedReport = {
          id: data.id,
          title: data.title,
          description: data.description,
          location: data.location,
          latitude: data.latitude,
          longitude: data.longitude,
          status: data.status,
          created_by: {
            id: data.created_by.id,
            name: data.created_by.name,
            email: data.created_by.email,
          },
          assigned_to: data.assigned_to
            ? {
                id: data.assigned_to.id,
                name: data.assigned_to.name,
                email: data.assigned_to.email,
              }
            : undefined,
          resolution_details: data.resolution_details,
          created_at: data.created_at,
          updated_at: data.updated_at,
          submittedAt: data.created_at,
          submittedBy: data.created_by.name,
          type: data.type,
          comment: data.comment,
        }

        setReports((prev) => prev.map((report) => (report.id === id ? formattedReport : report)))
        toast({
          title: "Report approved",
          description: "The report has been approved successfully",
        })
        return true
      }

      return false
    } catch (error) {
      console.error("Error approving report:", error)
      setError("An unexpected error occurred while approving the report")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Reject a report
  const rejectReport = async (id: string, comment: string): Promise<boolean> => {
    if (!user) return false

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: supabaseError } = await supabase
        .from("reports")
        .update({
          status: "Rejected",
          comment,
        })
        .eq("id", id)
        .select(`
          *,
          created_by:profiles!reports_created_by_fkey(*),
          assigned_to:profiles!reports_assigned_to_fkey(*)
        `)
        .single()

      if (supabaseError) {
        setError(supabaseError.message || "Failed to reject report")
        return false
      }

      if (data) {
        const formattedReport = {
          id: data.id,
          title: data.title,
          description: data.description,
          location: data.location,
          latitude: data.latitude,
          longitude: data.longitude,
          status: data.status,
          created_by: {
            id: data.created_by.id,
            name: data.created_by.name,
            email: data.created_by.email,
          },
          assigned_to: data.assigned_to
            ? {
                id: data.assigned_to.id,
                name: data.assigned_to.name,
                email: data.assigned_to.email,
              }
            : undefined,
          resolution_details: data.resolution_details,
          created_at: data.created_at,
          updated_at: data.updated_at,
          submittedAt: data.created_at,
          submittedBy: data.created_by.name,
          type: data.type,
          comment: data.comment,
        }

        setReports((prev) => prev.map((report) => (report.id === id ? formattedReport : report)))
        toast({
          title: "Report rejected",
          description: "The report has been rejected",
        })
        return true
      }

      return false
    } catch (error) {
      console.error("Error rejecting report:", error)
      setError("An unexpected error occurred while rejecting the report")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Assign a report to a worker
  const assignReport = async (id: string, workerId: string): Promise<boolean> => {
    if (!user) return false

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: supabaseError } = await supabase
        .from("reports")
        .update({
          assigned_to: workerId,
          status: "In Progress",
        })
        .eq("id", id)
        .select(`
          *,
          created_by:profiles!reports_created_by_fkey(*),
          assigned_to:profiles!reports_assigned_to_fkey(*)
        `)
        .single()

      if (supabaseError) {
        setError(supabaseError.message || "Failed to assign report")
        return false
      }

      if (data) {
        const formattedReport = {
          id: data.id,
          title: data.title,
          description: data.description,
          location: data.location,
          latitude: data.latitude,
          longitude: data.longitude,
          status: data.status,
          created_by: {
            id: data.created_by.id,
            name: data.created_by.name,
            email: data.created_by.email,
          },
          assigned_to: data.assigned_to
            ? {
                id: data.assigned_to.id,
                name: data.assigned_to.name,
                email: data.assigned_to.email,
              }
            : undefined,
          resolution_details: data.resolution_details,
          created_at: data.created_at,
          updated_at: data.updated_at,
          submittedAt: data.created_at,
          submittedBy: data.created_by.name,
          type: data.type,
          comment: data.comment,
        }

        setReports((prev) => prev.map((report) => (report.id === id ? formattedReport : report)))
        toast({
          title: "Report assigned",
          description: "The report has been assigned successfully",
        })
        return true
      }

      return false
    } catch (error) {
      console.error("Error assigning report:", error)
      setError("An unexpected error occurred while assigning the report")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Start work on a report
  const startWorkOnReport = async (id: string): Promise<boolean> => {
    if (!user) return false

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: supabaseError } = await supabase
        .from("reports")
        .update({
          assigned_to: user.id,
          status: "In Progress",
        })
        .eq("id", id)
        .select(`
          *,
          created_by:profiles!reports_created_by_fkey(*),
          assigned_to:profiles!reports_assigned_to_fkey(*)
        `)
        .single()

      if (supabaseError) {
        setError(supabaseError.message || "Failed to start work on report")
        return false
      }

      if (data) {
        const formattedReport = {
          id: data.id,
          title: data.title,
          description: data.description,
          location: data.location,
          latitude: data.latitude,
          longitude: data.longitude,
          status: data.status,
          created_by: {
            id: data.created_by.id,
            name: data.created_by.name,
            email: data.created_by.email,
          },
          assigned_to: data.assigned_to
            ? {
                id: data.assigned_to.id,
                name: data.assigned_to.name,
                email: data.assigned_to.email,
              }
            : undefined,
          resolution_details: data.resolution_details,
          created_at: data.created_at,
          updated_at: data.updated_at,
          submittedAt: data.created_at,
          submittedBy: data.created_by.name,
          type: data.type,
          comment: data.comment,
        }

        setReports((prev) => prev.map((report) => (report.id === id ? formattedReport : report)))
        toast({
          title: "Work started",
          description: "You have started working on this report",
        })
        return true
      }

      return false
    } catch (error) {
      console.error("Error starting work on report:", error)
      setError("An unexpected error occurred while starting work on the report")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Resolve a report
  const resolveReport = async (id: string, resolutionDetails: string, images?: string[]): Promise<boolean> => {
    if (!user) return false

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: supabaseError } = await supabase
        .from("reports")
        .update({
          status: "Resolved",
          resolution_details: resolutionDetails,
          resolution_images: images,
        })
        .eq("id", id)
        .select(`
          *,
          created_by:profiles!reports_created_by_fkey(*),
          assigned_to:profiles!reports_assigned_to_fkey(*)
        `)
        .single()

      if (supabaseError) {
        setError(supabaseError.message || "Failed to resolve report")
        return false
      }

      if (data) {
        const formattedReport = {
          id: data.id,
          title: data.title,
          description: data.description,
          location: data.location,
          latitude: data.latitude,
          longitude: data.longitude,
          status: data.status,
          created_by: {
            id: data.created_by.id,
            name: data.created_by.name,
            email: data.created_by.email,
          },
          assigned_to: data.assigned_to
            ? {
                id: data.assigned_to.id,
                name: data.assigned_to.name,
                email: data.assigned_to.email,
              }
            : undefined,
          resolution_details: data.resolution_details,
          created_at: data.created_at,
          updated_at: data.updated_at,
          submittedAt: data.created_at,
          submittedBy: data.created_by.name,
          type: data.type,
          comment: data.comment,
        }

        setReports((prev) => prev.map((report) => (report.id === id ? formattedReport : report)))
        toast({
          title: "Report resolved",
          description: "You have successfully resolved this report",
        })
        return true
      }

      return false
    } catch (error) {
      console.error("Error resolving report:", error)
      setError("An unexpected error occurred while resolving the report")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Complete a report (admin only)
  const completeReport = async (id: string): Promise<boolean> => {
    if (!user) return false

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: supabaseError } = await supabase
        .from("reports")
        .update({ status: "Completed" })
        .eq("id", id)
        .select(`
          *,
          created_by:profiles!reports_created_by_fkey(*),
          assigned_to:profiles!reports_assigned_to_fkey(*)
        `)
        .single()

      if (supabaseError) {
        setError(supabaseError.message || "Failed to complete report")
        return false
      }

      if (data) {
        const formattedReport = {
          id: data.id,
          title: data.title,
          description: data.description,
          location: data.location,
          latitude: data.latitude,
          longitude: data.longitude,
          status: data.status,
          created_by: {
            id: data.created_by.id,
            name: data.created_by.name,
            email: data.created_by.email,
          },
          assigned_to: data.assigned_to
            ? {
                id: data.assigned_to.id,
                name: data.assigned_to.name,
                email: data.assigned_to.email,
              }
            : undefined,
          resolution_details: data.resolution_details,
          created_at: data.created_at,
          updated_at: data.updated_at,
          submittedAt: data.created_at,
          submittedBy: data.created_by.name,
          type: data.type,
          comment: data.comment,
        }

        setReports((prev) => prev.map((report) => (report.id === id ? formattedReport : report)))
        toast({
          title: "Report completed",
          description: "The report has been marked as completed",
        })
        return true
      }

      return false
    } catch (error) {
      console.error("Error completing report:", error)
      setError("An unexpected error occurred while completing the report")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Get a report by ID
  const getReportById = (id: string) => {
    return reports.find((report) => report.id === id)
  }

  // Get reports for a specific user
  const getUserReports = (userId: string) => {
    return reports.filter((report) => report.created_by.id === userId)
  }

  // Get reports for a specific worker
  const getWorkerReports = (workerId: string) => {
    return reports.filter(
      (report) => report.assigned_to?.id === workerId && ["In Progress", "Resolved"].includes(report.status),
    )
  }

  return (
    <ReportsContext.Provider
      value={{
        reports,
        isLoading,
        error,
        addReport,
        approveReport,
        rejectReport,
        assignReport,
        startWorkOnReport,
        resolveReport,
        completeReport,
        getReportById,
        getUserReports,
        getWorkerReports,
        fetchReports,
      }}
    >
      {children}
    </ReportsContext.Provider>
  )
}

// Custom hook to use reports context
export function useReports() {
  const context = useContext(ReportsContext)
  if (context === undefined) {
    throw new Error("useReports must be used within a ReportsProvider")
  }
  return context
}
