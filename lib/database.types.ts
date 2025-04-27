export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          email: string
          role: string
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          name: string
          email: string
          role?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          role?: string
        }
      }
      reports: {
        Row: {
          id: string
          title: string
          description: string
          location: string
          latitude?: number
          longitude?: number
          type: string
          status: string
          created_by: string
          assigned_to?: string
          resolution_details?: string
          resolution_images?: string[]
          comment?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          location: string
          latitude?: number
          longitude?: number
          type: string
          status?: string
          created_by: string
          assigned_to?: string
          resolution_details?: string
          resolution_images?: string[]
          comment?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          location?: string
          latitude?: number
          longitude?: number
          type?: string
          status?: string
          created_by?: string
          assigned_to?: string
          resolution_details?: string
          resolution_images?: string[]
          comment?: string
          created_at?: string
          updated_at?: string
        }
      }
      forum_threads: {
        Row: {
          id: string
          title: string
          body: string
          created_by: string
          tags: string[]
          status: string
          comment_count: number
          comment?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          body: string
          created_by: string
          tags?: string[]
          status?: string
          comment_count?: number
          comment?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          body?: string
          created_by?: string
          tags?: string[]
          status?: string
          comment_count?: number
          comment?: string
          created_at?: string
          updated_at?: string
        }
      }
      forum_comments: {
        Row: {
          id: string
          thread_id: string
          content: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          content: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          content?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      worker_invites: {
        Row: {
          id: string
          code: string
          email?: string
          created_by: string
          is_used: boolean
          used_by?: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          code: string
          email?: string
          created_by: string
          is_used?: boolean
          used_by?: string
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          code?: string
          email?: string
          created_by?: string
          is_used?: boolean
          used_by?: string
          created_at?: string
          expires_at?: string
        }
      }
    }
    Functions: {
      add_comment: {
        Args: {
          p_thread_id: string
          p_body: string
          p_user_id: string
        }
        Returns: {
          id: string
          thread_id: string
          content: string
          created_by: string
          created_at: string
          updated_at: string
        }
      }
      delete_comment: {
        Args: {
          p_comment_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      increment_comment_count: {
        Args: {
          thread_id: string
        }
        Returns: undefined
      }
    }
  }
}
