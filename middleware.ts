import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Refresh session if expired
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    // If there's an error or no session for protected routes
    const protectedRoutes = ["/dashboard", "/cities", "/reports", "/profile"]
    const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

    if ((error || !session) && isProtectedRoute) {
      const redirectUrl = new URL("/signin", req.url)
      redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Role-based access control
    if (session) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single()

      // Admin routes protection
      if (req.nextUrl.pathname.startsWith("/admin") && (!profile || profile.role !== "admin")) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }

      // Worker routes protection
      if (req.nextUrl.pathname.startsWith("/worker") && (!profile || profile.role !== "worker")) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }
  } catch (e) {
    // In case of any error, proceed without blocking the request
    console.error("Middleware error:", e)
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|signin|signup).*)"],
}
