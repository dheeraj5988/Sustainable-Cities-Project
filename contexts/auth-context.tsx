"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/auth-js"
import type { Database } from "@/lib/database.types"

type AuthContextType = {
  user: User | null
  userDetails: any | null
  isLoading: boolean
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string; error?: any }>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: any }>
  updatePassword: (password: string) => Promise<{ success: boolean; message?: string; error?: any }>
  resendConfirmationEmail: (email: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userDetails, setUserDetails] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)

        // Fetch user profile details including role
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        setUserDetails(profile)
      }
      setIsLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)

        // Fetch user profile details including role
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        setUserDetails(profile)

        // Redirect based on user role
        if (profile?.role === "admin") {
          router.push("/admin")
        } else if (profile?.role === "worker") {
          router.push("/worker")
        } else {
          router.push("/dashboard")
        }
      } else {
        setUser(null)
        setUserDetails(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name,
          },
        },
      })

      if (error) {
        return {
          success: false,
          message: error.message,
          error,
        }
      }

      // Create a profile record
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            name,
            email,
            role: "client", // Default role
          },
        ])

        if (profileError) {
          return {
            success: false,
            message: "Account created but profile setup failed. Please contact support.",
            error: profileError,
          }
        }
      }

      return {
        success: true,
        message: "Please check your email to verify your account.",
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "An unexpected error occurred",
        error,
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error }
    }

    // Fetch user profile details including role
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        return { error: profileError }
      }

      setUserDetails(profile)

      // Redirect based on user role
      if (profile?.role === "admin") {
        router.push("/admin")
      } else if (profile?.role === "worker") {
        router.push("/worker")
      } else {
        router.push("/dashboard")
      }
    }

    return { data }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        return {
          success: false,
          message: error.message,
          error,
        }
      }

      return {
        success: true,
        message: "Password reset instructions sent to your email.",
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "An unexpected error occurred",
        error,
      }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        return {
          success: false,
          message: error.message,
          error,
        }
      }

      return {
        success: true,
        message: "Password updated successfully.",
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "An unexpected error occurred",
        error,
      }
    }
  }

  const resendConfirmationEmail = async (email: string) => {
    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email,
    })
    return { data, error }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userDetails,
        isLoading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        resendConfirmationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
