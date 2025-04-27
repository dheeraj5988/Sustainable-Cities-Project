import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    // Get current user to verify they're an admin
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the current user is an admin
    const { data: currentUserProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 })
    }

    const { name, email, password, role = "client" } = await request.json()

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

    // Create profile
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: authData.user.id,
        name,
        email,
        role,
      },
    ])

    if (profileError) {
      console.error("Profile error:", profileError)
      return NextResponse.json({ error: profileError.message || "Failed to create profile" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name,
        role,
      },
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
