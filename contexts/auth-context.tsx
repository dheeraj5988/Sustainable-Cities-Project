"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  session: Session | null
  profile: any | null
  isLoading: boolean
  signUp: (email: string, password: string, userData: any) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  create_profile_safely: (userData: any) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    setSupabase(createClient())
  }, [])

  useEffect(() => {
    if (!supabase) return

    const fetchSession = async () => {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error fetching session:", error)
          setIsLoading(false)
          return
        }

        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)

          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentSession.user.id)
            .single()

          if (profileError) {
            console.error("Error fetching profile:", profileError)
          } else {
            setProfile(profileData)
          }
        }
      } catch (error) {
        console.error("Session fetch error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, currentSession: Session | null) => {
      if (event === "SIGNED_IN" && currentSession) {
        setSession(currentSession)
        setUser(currentSession.user)

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentSession.user.id)
          .single()

        if (profileError) {
          console.error("Error fetching profile:", profileError)
        } else {
          setProfile(profileData)

          // Redirect based on role
          if (profileData.role === "admin") {
            router.push("/admin/dashboard")
          } else if (profileData.role === "worker") {
            router.push("/worker/dashboard")
          } else {
            router.push("/dashboard")
          }
        }
      } else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
        setSession(null)
        setUser(null)
        setProfile(null)
        router.push("/")
      } else if (event === "TOKEN_REFRESHED") {
        setSession(currentSession)
      } else if (event === "USER_UPDATED" && currentSession) {
        setSession(currentSession)
        setUser(currentSession.user)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase, router])

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Create profile for the new user
        await create_profile_safely({
          id: data.user.id,
          email: data.user.email,
          full_name: userData.full_name,
          role: "citizen", // Default role
        })
      }

      return data
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const create_profile_safely = async (userData: any) => {
    try {
      const { data, error } = await supabase.rpc("create_profile_safely", {
        user_id: userData.id,
        user_email: userData.email,
        user_name: userData.full_name,
        user_role: userData.role || "citizen",
      })

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error("Error creating profile:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signUp,
        signIn,
        signOut,
        create_profile_safely,
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
