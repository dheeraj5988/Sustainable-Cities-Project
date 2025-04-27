"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function WorkerSignupRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login page with a message
    router.push("/login?message=Please contact an administrator to create a worker account")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4">Redirecting...</p>
      </div>
    </div>
  )
}
