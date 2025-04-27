import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import AppLayout from "@/components/layout/app-layout"
import { AuthProvider } from "@/context/auth-context"
import { ForumProvider } from "@/context/forum-context"
import { ReportsProvider } from "@/context/reports-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sustainable Cities & Communities",
  description: "Building sustainable cities and communities together",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <ReportsProvider>
              <ForumProvider>
                <AppLayout>{children}</AppLayout>
                <Toaster />
              </ForumProvider>
            </ReportsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
