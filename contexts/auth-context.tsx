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
  signUp: (email: string, password: string, name: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
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

  const signUp = async (email: string, password: string, name: string) => {
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
      return { error }
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
        return { error: profileError }
      }
    }

    return { data }
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
