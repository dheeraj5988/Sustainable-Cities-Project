import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { name, email, password, role = "client", id } = await request.json()

    // If an ID is provided, we're creating a profile for an existing auth user
    if (id) {
      // Check if profile already exists
      const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", id).single()

      if (existingProfile) {
        return NextResponse.json({
          success: true,
          message: "Profile already exists",
          user: existingProfile,
        })
      }

      // Create profile for existing user using our new function
      const { error: profileError } = await supabase.rpc("create_profile_safely", {
        user_id: id,
        user_name: name,
        user_email: email,
        user_role: role,
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        return NextResponse.json({ error: profileError.message || "Failed to create profile" }, { status: 500 })
      }

      // Fetch the created profile
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).single()

      return NextResponse.json({
        success: true,
        message: "Profile created successfully",
        user: profile,
      })
    }

    // If no ID is provided, we're creating both auth user and profile

    // Check if user already exists
    const { data: existingUser } = await supabase.from("profiles").select("*").eq("email", email).single()

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: authError.message || "Failed to create user" }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Create profile using our new function
    const { error: profileError } = await supabase.rpc("create_profile_safely", {
      user_id: authData.user.id,
      user_name: name,
      user_email: email,
      user_role: role,
    })

    if (profileError) {
      console.error("Profile error:", profileError)
      return NextResponse.json({ error: profileError.message || "Failed to create profile" }, { status: 500 })
    }

    // Fetch the created profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", authData.user.id).single()

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: profile,
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
