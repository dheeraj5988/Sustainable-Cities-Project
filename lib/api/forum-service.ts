import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders, type ApiResponse } from "../api-config"

export interface ThreadData {
  title: string
  content: string
}

export interface Thread {
  id: string
  title: string
  content: string
  created_by: {
    id: string
    name: string
    email: string
  }
  created_at: string
  updated_at: string
  comment_count: number
}

export interface CommentData {
  content: string
}

export interface Comment {
  id: string
  content: string
  thread_id: string
  created_by: {
    id: string
    name: string
    email: string
  }
  created_at: string
  updated_at: string
}

export const forumService = {
  // Create a new thread
  async createThread(threadData: ThreadData): Promise<ApiResponse<Thread>> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FORUM.THREADS}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(threadData),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          status: "error",
          message: data.message || "Failed to create thread",
          error: data.error,
        }
      }

      return data
    } catch (error) {
      return {
        status: "error",
        message: "Network error while creating thread",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },

  // Get all threads
  async getAllThreads(): Promise<ApiResponse<Thread[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FORUM.THREADS}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          status: "error",
          message: data.message || "Failed to fetch threads",
          error: data.error,
        }
      }

      return data
    } catch (error) {
      return {
        status: "error",
        message: "Network error while fetching threads",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },

  // Get a single thread by ID
  async getThreadById(id: string): Promise<ApiResponse<Thread>> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FORUM.THREAD(id)}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          status: "error",
          message: data.message || "Failed to fetch thread",
          error: data.error,
        }
      }

      return data
    } catch (error) {
      return {
        status: "error",
        message: "Network error while fetching thread",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },

  // Create a comment on a thread
  async createComment(threadId: string, commentData: CommentData): Promise<ApiResponse<Comment>> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FORUM.COMMENTS(threadId)}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(commentData),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          status: "error",
          message: data.message || "Failed to create comment",
          error: data.error,
        }
      }

      return data
    } catch (error) {
      return {
        status: "error",
        message: "Network error while creating comment",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },

  // Get all comments for a thread
  async getCommentsByThreadId(threadId: string): Promise<ApiResponse<Comment[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FORUM.COMMENTS(threadId)}`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          status: "error",
          message: data.message || "Failed to fetch comments",
          error: data.error,
        }
      }

      return data
    } catch (error) {
      return {
        status: "error",
        message: "Network error while fetching comments",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },
}
