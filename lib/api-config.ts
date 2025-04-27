// API configuration

// Base URL for API requests
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
  },

  // User endpoints
  USERS: {
    ME: "/users/me",
    ALL: "/users",
    ROLE: (id: string) => `/users/${id}/role`,
  },

  // Forum endpoints
  FORUM: {
    THREADS: "/forum/threads",
    THREAD: (id: string) => `/forum/threads/${id}`,
    COMMENTS: (id: string) => `/forum/threads/${id}/comments`,
  },

  // Report endpoints
  REPORTS: {
    ALL: "/reports",
    SINGLE: (id: string) => `/reports/${id}`,
    STATUS: (id: string) => `/reports/${id}/status`,
  },
}

// HTTP request headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken")
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  }
}

// Response types
export interface ApiResponse<T> {
  status: "success" | "error"
  message: string
  data?: T
  error?: string
}
