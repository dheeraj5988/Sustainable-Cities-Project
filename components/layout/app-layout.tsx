"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AppSidebar } from "./app-sidebar"
import { AppTopbar } from "./app-topbar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/context/auth-context"
import { Loader2 } from "lucide-react"

// Public routes that don't require authentication
const publicRoutes = ["/login", "/signup"]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle authentication and redirects
  useEffect(() => {
    if (isClient && !isLoading) {
      const isPublicRoute = publicRoutes.includes(pathname)

      if (!user && !isPublicRoute) {
        router.push("/login")
      } else if (user && isPublicRoute) {
        router.push("/dashboard")
      } else if (user && user.role === "admin" && pathname.startsWith("/forum/new")) {
        // Admins shouldn't access the new thread page
        router.push("/admin/forum")
      } else if (user && user.role === "user" && pathname.startsWith("/admin")) {
        // Regular users shouldn't access admin pages
        router.push("/dashboard")
      } else if (user && user.role === "user" && pathname.startsWith("/worker")) {
        // Regular users shouldn't access worker pages
        router.push("/dashboard")
      } else if (user && user.role === "worker" && pathname.startsWith("/admin")) {
        // Workers shouldn't access admin pages
        router.push("/worker")
      } else if (user && user.role === "worker" && pathname === "/report") {
        // Workers shouldn't access report submission page
        router.push("/worker")
      }
    }
  }, [user, isLoading, pathname, router, isClient])

  // Show loading state
  if (isLoading || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 text-green-600 animate-spin" />
          <p className="text-green-800 font-medium">Loading...</p>
          <h1 className="text-2xl font-bold text-green-800">Sustainable Cities App</h1>
        </div>
      </div>
    )
  }

  // Show login/signup page directly without layout
  if (!user && publicRoutes.includes(pathname)) {
    return (
      <div className="bg-green-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center text-green-800 mb-8">Sustainable Cities App</h1>
          {children}
        </div>
      </div>
    )
  }

  // Show app layout with sidebar and topbar for authenticated users
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-green-50">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <AppTopbar />
          <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
