"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { BarChart3, BookOpen, FileText, Home, MapPin, MessageSquare, Shield, Ticket, Users, Wrench } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  // Define routes based on user role
  const userRoutes = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
    },
    {
      title: "Report Issue",
      icon: FileText,
      href: "/report",
    },
    {
      title: "Map View",
      icon: MapPin,
      href: "/map",
    },
    {
      title: "Cities",
      icon: BarChart3,
      href: "/cities",
    },
    {
      title: "Community Forum",
      icon: MessageSquare,
      href: "/forum",
    },
    {
      title: "Education Hub",
      icon: BookOpen,
      href: "/learn",
    },
  ]

  const adminRoutes = [
    {
      title: "Admin Dashboard",
      icon: Shield,
      href: "/admin/dashboard",
    },
    {
      title: "Reports Management",
      icon: FileText,
      href: "/admin",
    },
    {
      title: "Forum Moderation",
      icon: MessageSquare,
      href: "/admin/forum",
    },
    {
      title: "User Management",
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Worker Invites",
      icon: Ticket,
      href: "/admin/invites",
    },
    {
      title: "Map View",
      icon: MapPin,
      href: "/map",
    },
    {
      title: "Cities",
      icon: BarChart3,
      href: "/cities",
    },
  ]

  const workerRoutes = [
    {
      title: "Worker Dashboard",
      icon: Wrench,
      href: "/worker",
    },
    {
      title: "Map View",
      icon: MapPin,
      href: "/map",
    },
    {
      title: "Cities",
      icon: BarChart3,
      href: "/cities",
    },
  ]

  // Select routes based on user role
  const routes = user?.role === "admin" ? adminRoutes : user?.role === "worker" ? workerRoutes : userRoutes

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center p-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-green-800">Sustainable Cities</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {routes.map((route) => (
            <SidebarMenuItem key={route.href}>
              <SidebarMenuButton asChild isActive={pathname === route.href} tooltip={route.title}>
                <Link href={route.href} className="flex items-center">
                  <route.icon className="mr-2 h-5 w-5" />
                  <span>{route.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button variant="outline" className="w-full bg-green-100 hover:bg-green-200 border-green-300">
          <Users className="mr-2 h-4 w-4" />
          <span>
            {user?.name ||
              (user?.role === "admin" ? "Admin Account" : user?.role === "worker" ? "Worker Account" : "User Account")}
          </span>
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
