"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

// Define user types
export interface User {
  id: string
  name: string
  email: string
  role: "citizen" | "worker" | "admin"
}

// Define authentication context type
interface AuthContextType {
  user: User | null
  signIn: (email: string, password: string) => Promise<{ success: boolean; message?: string; data?: any; error?: any }>
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>
  signOut: () => Promise<void>
  isLoading: boolean
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

          if (userProfile) {
            setUser({
              id: session.user.id,
              name: userProfile.name || session.user.email?.split("@")[0] || "User",
              email: userProfile.email || session.user.email || "",
              role: userProfile.role || "citizen",
            })
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        if (userProfile) {
          setUser({
            id: session.user.id,
            name: userProfile.name || session.user.email?.split("@")[0] || "User",
            email: userProfile.email || session.user.email || "",
            role: userProfile.role || "citizen",
          })
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Login function
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return {
          success: false,
          message: error.message || "Login failed. Please check your credentials.",
          error,
        }
      }

      if (data.user) {
        const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

        if (userProfile) {
          setUser({
            id: data.user.id,
            name: userProfile.name || data.user.email?.split("@")[0] || "User",
            email: data.user.email || "",
            role: userProfile.role || "citizen",
          })
        }

        return { success: true, data }
      }

      return {
        success: false,
        message: "Login failed. Please try again.",
      }
    } catch (error: any) {
      console.error("Login error:", error)
      return {
        success: false,
        message: "An unexpected error occurred during login.",
        error,
      }
    }
  }

  // Signup function
  const signUp = async (name: string, email: string, password: string) => {
    try {
      // First check if user already exists
      const { data: existingUser } = await supabase.from("profiles").select("*").eq("email", email).single()

      if (existingUser) {
        return {
          success: false,
          message: "A user with this email already exists.",
        }
      }

      // Create the user in auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return {
          success: false,
          message: error.message || "Registration failed. Please try again.",
        }
      }

      if (data.user) {
        // Create a profile record
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            name,
            email,
            role: "citizen",
          },
        ])

        if (profileError) {
          console.error("Error creating profile:", profileError)
          return {
            success: false,
            message: "Account created but profile setup failed. Please contact support.",
          }
        }

        return {
          success: true,
          message: "Account created successfully. Please check your email for verification.",
        }
      }

      return {
        success: false,
        message: "Registration failed. Please try again.",
      }
    } catch (error: any) {
      console.error("Signup error:", error)
      return {
        success: false,
        message: "An unexpected error occurred during registration.",
      }
    }
  }

  // Logout function
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push("/login")
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      })
    } catch (error) {
      console.error("Logout error:", error)
      // Still remove user from state even if API call fails
      setUser(null)
      router.push("/login")
    }
  }

  return <AuthContext.Provider value={{ user, signIn, signUp, signOut, isLoading }}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
