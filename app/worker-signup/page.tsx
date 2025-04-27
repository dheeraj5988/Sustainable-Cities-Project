"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export default function WorkerSignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // 1. Validate the invite code against the database
      const { data: inviteData, error: inviteError } = await supabase
        .from("worker_invites")
        .select("*")
        .eq("code", inviteCode)
        .eq("is_used", false)
        .single()

      if (inviteError || !inviteData) {
        setError("Invalid or expired invite code")
        setIsLoading(false)
        return
      }

      // Check if the invite code has expired
      if (new Date(inviteData.expires_at) < new Date()) {
        setError("This invite code has expired")
        setIsLoading(false)
        return
      }

      // Check if the invite is restricted to a specific email
      if (inviteData.email && inviteData.email !== email) {
        setError("This invite code is not valid for your email address")
        setIsLoading(false)
        return
      }

      // 2. Create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (authError) {
        setError(authError.message)
        setIsLoading(false)
        return
      }

      if (!authData.user) {
        setError("Failed to create user account")
        setIsLoading(false)
        return
      }

      // 3. Create the profile with worker role
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: authData.user.id,
          name,
          email,
          role: "worker", // Set role as worker
        },
      ])

      if (profileError) {
        setError(profileError.message)
        setIsLoading(false)
        return
      }

      // 4. Mark the invite code as used
      await supabase
        .from("worker_invites")
        .update({
          is_used: true,
          used_by: authData.user.id,
        })
        .eq("id", inviteData.id)

      // Success
      alert("Worker account created successfully! Please check your email to verify your account.")
      router.push("/login")
    } catch (err: any) {
      setError(err.message || "An error occurred during signup")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Worker Sign Up</CardTitle>
          <CardDescription>Create a worker account to manage community reports</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Worker Invitation Code</Label>
              <Input
                id="inviteCode"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Enter the invitation code provided by administration</p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign Up as Worker"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
