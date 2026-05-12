"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"

import { AdminShell } from "@/components/admin/admin-shell"
import { getAdminKey } from "@/lib/admin-api"

export default function AdminAuthedShellLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!getAdminKey()) {
      router.replace("/admin/login")
      return
    }
    setReady(true)
  }, [router])

  if (!ready) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-slate-100 text-slate-600">
        Loading…
      </div>
    )
  }

  return <AdminShell>{children}</AdminShell>
}
