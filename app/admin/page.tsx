import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function AdminDashboard() {
  const supabase = createServerComponentClient({ cookies })

  // Check if user is authenticated and is an admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Fetch user profile to check role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  // If not an admin, redirect to appropriate page
  if (!profile || profile.role !== "admin") {
    if (profile?.role === "worker") {
      redirect("/worker")
    } else {
      redirect("/dashboard")
    }
  } else {
    // Redirect admin to the new dashboard
    redirect("/admin/dashboard")
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <p className="text-lg mb-4">
        Welcome to the admin dashboard. Here you can manage users, projects, and system settings.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">User Management</h2>
          <p>Manage user accounts, roles, and permissions.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Project Management</h2>
          <p>Oversee all projects and their statuses.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">System Settings</h2>
          <p>Configure application settings and preferences.</p>
        </div>
      </div>
    </div>
  )
}
