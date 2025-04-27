import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/context/auth-context"
import { ReportsProvider } from "@/context/reports-context"
import { ForumProvider } from "@/context/forum-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Sustainable Cities App",
  description: "A platform for citizens to report issues and discuss sustainability initiatives",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <ReportsProvider>
              <ForumProvider>
                <div className="flex flex-col min-h-screen">
                  {children}
                  <Toaster />
                </div>
              </ForumProvider>
            </ReportsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
