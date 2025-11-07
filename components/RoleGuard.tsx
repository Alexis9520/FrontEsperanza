"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, ReactNode, useMemo, useState } from "react"
import Spinner from "@/components/ui/Spinner"

interface RoleGuardProps {
  allowedRoles: string[]
  redirectTo?: string
  children: ReactNode
}

export function RoleGuard({ allowedRoles, redirectTo = "/dashboard/ventas", children }: RoleGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [warn, setWarn] = useState(false)

  const normalizedAllowed = useMemo(
    () => allowedRoles.map(r => r.toLowerCase().trim()),
    [allowedRoles]
  )
  const userRole = (user?.rol || "").toLowerCase().trim()
  const isAllowed = !!user && normalizedAllowed.includes(userRole)

  useEffect(() => {
    if (loading) return
    if (!isAllowed) {
      setWarn(true)
      const t = setTimeout(() => router.replace(redirectTo), 2000)
      return () => clearTimeout(t)
    }
  }, [loading, isAllowed, router, redirectTo])

  if (loading || !user) return <Spinner />
  if (!isAllowed) {
    return <Spinner warning="⚠️ Esta sección es solo para administradores. Serás redirigido al inicio." />
  }

  return <>{children}</>
}