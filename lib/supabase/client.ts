import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Please check your .env file.")
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Helper function to check database connection
export const checkDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from("profiles").select("count").limit(1)
    if (error) {
      console.error("Database connection error:", error)
      return false
    }
    return true
  } catch (error) {
    console.error("Database connection check failed:", error)
    return false
  }
}
