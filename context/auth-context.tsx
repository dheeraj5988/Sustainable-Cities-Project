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
      // First, create the user in Supabase Auth
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
        console.error("Auth signup error:", error)
        return {
          success: false,
          message: error.message,
          error,
        }
      }

      // If user creation was successful, create the profile using our new function
      if (data.user) {
        try {
          // Use the RPC function we created
          const { error: profileError } = await supabase.rpc("create_profile_safely", {
            user_id: data.user.id,
            user_name: name,
            user_email: email,
            user_role: "client",
          })

          if (profileError) {
            console.error("Profile creation error:", profileError)
            return {
              success: false,
              message: "Account created but profile setup failed. Please contact support.",
              error: profileError,
            }
          }

          return {
            success: true,
            message: "Please check your email to verify your account.",
          }
        } catch (profileError) {
          console.error("Profile creation exception:", profileError)
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
      console.error("Signup error:", error)
      return {
        success: false,
        message: error.message || "An unexpected error occurred",
        error,
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
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
          // If profile doesn't exist, try to create it using metadata
          if (profileError.code === "PGRST116") {
            try {
              const { error: createProfileError } = await supabase.rpc("create_profile_safely", {
                user_id: data.user.id,
                user_name: data.user.user_metadata.name || email.split("@")[0],
                user_email: email,
                user_role: "client",
              })

              if (createProfileError) {
                return { error: createProfileError }
              }

              // Fetch the newly created profile
              const { data: newProfile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

              setUserDetails(newProfile)

              // Redirect based on user role
              if (newProfile?.role === "admin") {
                router.push("/admin")
              } else if (newProfile?.role === "worker") {
                router.push("/worker")
              } else {
                router.push("/dashboard")
              }

              return { data }
            } catch (createError) {
              return { error: createError }
            }
          }
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
    } catch (error) {
      return { error }
    }
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
