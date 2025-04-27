import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders, type ApiResponse } from "../api-config"

export interface User {
  id: string
  name: string
  email: string
  role: "citizen" | "worker" | "admin"
  created_at: string
  updated_at: string
}

export interface RoleUpdateData {
  role: "citizen" | "worker" | "admin"
}

export const userService = {
  // Get all users (admin only)
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS.ALL}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          status: "error",
          message: data.message || "Failed to fetch users",
          error: data.error,
        }
      }

      return data
    } catch (error) {
      return {
        status: "error",
        message: "Network error while fetching users",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },

  // Update user role (admin only)
  async updateUserRole(userId: string, roleData: RoleUpdateData): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS.ROLE(userId)}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(roleData),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          status: "error",
          message: data.message || "Failed to update user role",
          error: data.error,
        }
      }

      return data
    } catch (error) {
      return {
        status: "error",
        message: "Network error while updating user role",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },
}
