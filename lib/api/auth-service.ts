import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders, type ApiResponse } from "../api-config"

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  token: string
}

export const authService = {
  // Register a new user
  async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          status: "error",
          message: data.message || "Registration failed",
          error: data.error,
        }
      }

      // Store the token
      if (data.data?.token) {
        localStorage.setItem("authToken", data.data.token)
      }

      return data
    } catch (error) {
      return {
        status: "error",
        message: "Network error during registration",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },

  // Login user
  async login(credentials: LoginData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          status: "error",
          message: data.message || "Login failed",
          error: data.error,
        }
      }

      // Store the token
      if (data.data?.token) {
        localStorage.setItem("authToken", data.data.token)
      }

      return data
    } catch (error) {
      return {
        status: "error",
        message: "Network error during login",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },

  // Logout user
  async logout(): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`, {
        method: "POST",
        headers: getAuthHeaders(),
      })

      // Remove token regardless of response
      localStorage.removeItem("authToken")

      const data = await response.json()

      if (!response.ok) {
        return {
          status: "error",
          message: data.message || "Logout failed",
          error: data.error,
        }
      }

      return data
    } catch (error) {
      // Remove token even if there's an error
      localStorage.removeItem("authToken")

      return {
        status: "error",
        message: "Network error during logout",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem("authToken")
  },

  // Get current user
  async getCurrentUser(): Promise<ApiResponse<AuthResponse["user"]>> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS.ME}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          status: "error",
          message: data.message || "Failed to get user profile",
          error: data.error,
        }
      }

      return data
    } catch (error) {
      return {
        status: "error",
        message: "Network error while fetching user profile",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },
}
