"use client"

// If this file exists, we need to remove it or update it
import { useEffect } from "react"
import { useRouter } from "next/router"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/app")
  }, [router])

  return null
}
