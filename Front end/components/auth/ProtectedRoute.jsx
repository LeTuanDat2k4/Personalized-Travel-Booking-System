"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import ApiService from "@/lib/ApiService"

export const ProtectedRoute = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!ApiService.isAuthenticated()) {
      router.push("/auth/login?redirect=" + encodeURIComponent(pathname))
    }
  }, [pathname, router])

  if (!ApiService.isAuthenticated()) {
    return null
  }

  return children
}

export const AdminRoute = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!ApiService.isAuthenticated()) {
      router.push("/auth/login?redirect=" + encodeURIComponent(pathname))
    } else if (!ApiService.isAdmin()) {
      router.push("/")
    }
  }, [pathname, router])

  if (!ApiService.isAuthenticated() || !ApiService.isAdmin()) {
    return null
  }

  return children
}

export const OwnerRoute = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!ApiService.isAuthenticated()) {
      router.push("/auth/login?redirect=" + encodeURIComponent(pathname))
    } else if (!ApiService.isAdmin() && !ApiService.isOwner()) {
      router.push("/")
    }
  }, [pathname, router])

  if (!ApiService.isAuthenticated() || (!ApiService.isAdmin() && !ApiService.isOwner())) {
    return null
  }

  return children
}
