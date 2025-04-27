"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context" // Fixed import path (removed 's')
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setEmailSent(false)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        if (error.emailNotConfirmed) {
          setEmailSent(true)
          setError(error.message)
        } else {
          setError(error.message)
        }
        setIsLoading(false)
        return
      }

      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "An error occurred during login")
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setIsLoading(true)
    try {
      const { error } = await signIn(email, password)
      if (error?.emailNotConfirmed) {
        setEmailSent(true)
        setError("Confirmation email has been resent. Please check your inbox.")
      }
    } catch (err) {
      setError("Failed to resend confirmation email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sustainable Cities</h1>
          <h2 className="mt-6 text-2xl font-bold">Sign in to your account</h2>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {emailSent && (
          <Alert>
            <AlertDescription className="flex flex-col gap-2">
              <p>A confirmation email has been sent. Please check your inbox.</p>
              <Button variant="outline" size="sm" onClick={handleResendEmail} disabled={isLoading}>
                Resend confirmation email
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <LoadingSpinner /> : "Sign in"}
            </Button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
