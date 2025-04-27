import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/lib/database.types"

// WARNING: This is for development purposes only!
// In production, you should never bypass email confirmation

export async function POST(request: Request) {
  // Only allow this in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "This endpoint is only available in development" }, { status: 403 })
  }

  try {
    const requestData = await request.json()
    const { email } = requestData

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get the user by email
    const {
      data: { users },
      error: getUserError,
    } = await supabase.auth.admin.listUsers({
      filter: {
        email: email,
      },
    })

    if (getUserError || !users || users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[0]

    // Update the user to confirm their email
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { email_confirmed: true })

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error confirming email:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
