"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

type AuthContextType = {
  user: User | null
  profile: any | null
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{
    error: any
  }>
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: any
  }>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setProfile(profile)

        if (profile?.role === "admin") {
          router.push("/admin")
        } else if (profile?.role === "worker") {
          router.push("/worker")
        } else {
          router.push("/dashboard")
        }
      }

      setLoading(false)
    }

    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single()
        setProfile(profile)

        if (profile?.role === "admin") {
          router.push("/admin")
        } else if (profile?.role === "worker") {
          router.push("/worker")
        } else {
          router.push("/dashboard")
        }
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, router])

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    return { error }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Check if the error is due to email not being confirmed
        if (error.message.includes("Email not confirmed")) {
          // Send a new confirmation email
          await supabase.auth.resend({
            type: "signup",
            email,
          })

          return {
            error: {
              message: "Email not confirmed. We've sent a new confirmation email. Please check your inbox.",
              emailNotConfirmed: true,
            },
          }
        }
        return { error }
      }

      // After successful sign in
      if (data.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

        if (profile?.role === "admin") {
          router.push("/admin")
        } else if (profile?.role === "worker") {
          router.push("/worker")
        } else {
          router.push("/dashboard")
        }
      }

      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const value = {
    user,
    profile,
    signUp,
    signIn,
    signOut,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
