import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders, type ApiResponse } from "../api-config"

export interface ReportData {
  title: string
  description: string
  location: string
  latitude?: number
  longitude?: number
}

export interface Report {
  id: string
  title: string
  description: string
  location: string
  latitude?: number
  longitude?: number
  status: "pending" | "in_progress" | "resolved"
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
  created_at: string
  updated_at: string
}

export interface StatusUpdateData {
  status: "pending" | "in_progress" | "resolved"
  assigned_to?: string // User ID
  resolution_details?: string
}

export const reportService = {
  // Create a new report
  async createReport(reportData: ReportData): Promise<ApiResponse<Report>> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REPORTS.ALL}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(reportData),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          status: "error",
          message: data.message || "Failed to create report",
          error: data.error,
        }
      }

      return data
    } catch (error) {
      return {
        status: "error",
        message: "Network error while creating report",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },

  // Get all reports
  async getAllReports(): Promise<ApiResponse<Report[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REPORTS.ALL}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          status: "error",
          message: data.message || "Failed to fetch reports",
          error: data.error,
        }
      }

      return data
    } catch (error) {
      return {
        status: "error",
        message: "Network error while fetching reports",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },

  // Get a single report by ID
  async getReportById(id: string): Promise<ApiResponse<Report>> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REPORTS.SINGLE(id)}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          status: "error",
          message: data.message || "Failed to fetch report",
          error: data.error,
        }
      }

      return data
    } catch (error) {
      return {
        status: "error",
        message: "Network error while fetching report",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },

  // Update report status
  async updateReportStatus(id: string, statusData: StatusUpdateData): Promise<ApiResponse<Report>> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REPORTS.STATUS(id)}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(statusData),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          status: "error",
          message: data.message || "Failed to update report status",
          error: data.error,
        }
      }

      return data
    } catch (error) {
      return {
        status: "error",
        message: "Network error while updating report status",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },
}
