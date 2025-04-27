"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { LoadingSpinner } from "@/components/loading-spinner"
import { UserPlus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface User {
  id: string
  name: string
  email: string
  role: string
  created_at: string
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [showAddUserDialog, setShowAddUserDialog] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
  })
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        })
        return
      }

      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    setIsUpdating(userId)
    try {
      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update user role",
          variant: "destructive",
        })
        return
      }

      // Update local state
      setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))

      toast({
        title: "Success",
        description: "User role updated successfully",
      })
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(null)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewUser((prev) => ({ ...prev, [name]: value }))
  }

  const createUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      // Create user via API route
      const response = await fetch("/api/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user")
      }

      toast({
        title: "Success",
        description: `${newUser.role === "worker" ? "Worker" : "User"} account created successfully`,
      })

      // Reset form and close dialog
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "client",
      })
      setShowAddUserDialog(false)

      // Refresh user list
      fetchUsers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Filter users by role
  const adminUsers = users.filter((user) => user.role === "admin")
  const workerUsers = users.filter((user) => user.role === "worker")
  const clientUsers = users.filter((user) => user.role === "client")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts and roles</p>
        </div>
        <Button onClick={() => setShowAddUserDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-green-600">{clientUsers.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">Clients</p>
            <p className="text-sm text-muted-foreground">Regular user accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-600">{workerUsers.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">Workers</p>
            <p className="text-sm text-muted-foreground">Field worker accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-600">{adminUsers.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">Admins</p>
            <p className="text-sm text-muted-foreground">Administrator accounts</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Users ({users.length})</TabsTrigger>
          <TabsTrigger value="workers">Workers ({workerUsers.length})</TabsTrigger>
          <TabsTrigger value="clients">Clients ({clientUsers.length})</TabsTrigger>
          <TabsTrigger value="admins">Admins ({adminUsers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <UserTable users={users} onUpdateRole={updateUserRole} isUpdating={isUpdating} />
        </TabsContent>

        <TabsContent value="workers">
          <UserTable users={workerUsers} onUpdateRole={updateUserRole} isUpdating={isUpdating} />
        </TabsContent>

        <TabsContent value="clients">
          <UserTable users={clientUsers} onUpdateRole={updateUserRole} isUpdating={isUpdating} />
        </TabsContent>

        <TabsContent value="admins">
          <UserTable users={adminUsers} onUpdateRole={updateUserRole} isUpdating={isUpdating} />
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account. {newUser.role === "worker" && "Worker accounts can access field assignments."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={newUser.name} onChange={handleInputChange} placeholder="John Doe" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newUser.email}
                onChange={handleInputChange}
                placeholder="user@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={newUser.password}
                onChange={handleInputChange}
                placeholder="••••••••"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser((prev) => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="worker">Worker</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createUser} disabled={isCreating}>
              {isCreating ? <LoadingSpinner size="sm" /> : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface UserTableProps {
  users: User[]
  onUpdateRole: (userId: string, newRole: string) => Promise<void>
  isUpdating: string | null
}

function UserTable({ users, onUpdateRole, isUpdating }: UserTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Created</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">{user.name}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    <Badge
                      className={
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "worker"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Select
                        defaultValue={user.role}
                        onValueChange={(value) => onUpdateRole(user.id, value)}
                        disabled={isUpdating === user.id}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="worker">Worker</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      {isUpdating === user.id && <LoadingSpinner size="sm" />}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
