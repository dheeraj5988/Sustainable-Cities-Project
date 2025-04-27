"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/auth-context" // Fixed import path
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function ResetPassword() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const { updatePassword } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if the URL contains the necessary parameters
    const hasToken = searchParams.has("token_hash") || searchParams.has("type")
    setIsValidToken(hasToken)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate passwords match
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." })
      return
    }

    // Validate password length
    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const { success, message } = await updatePassword(password)

      if (success) {
        setMessage({ type: "success", text: message || "Password updated successfully." })
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setMessage({ type: "error", text: message || "Failed to update password." })
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "An unexpected error occurred." })
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidToken === false) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
          <Alert variant="destructive">
            <AlertDescription>
              Invalid or expired password reset link. Please request a new password reset.
            </AlertDescription>
          </Alert>
          <Button onClick={() => router.push("/forgot-password")} className="w-full">
            Request new reset link
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sustainable Cities</h1>
          <h2 className="mt-6 text-2xl font-bold">Set new password</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your new password below.</p>
        </div>

        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <LoadingSpinner /> : "Reset Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
