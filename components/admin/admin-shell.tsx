"use client"

import {
  ClipboardList,
  Inbox,
  LogOut,
  MapPin,
  Package,
  Truck,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"

import { clearAdminKey, getAdminEmail } from "@/lib/admin-api"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/admin/incoming-requests", label: "Incoming Requests", icon: Inbox },
  { href: "/admin/dashboard", label: "Dashboard", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: Truck },
  { href: "/admin/delivery-providers", label: "Delivery Providers", icon: ClipboardList },
] as const

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  useEffect(() => {
    setEmail(getAdminEmail())
  }, [])

  return (
    <div className="flex min-h-svh bg-slate-100 text-slate-900">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-6 shadow-sm">
        <div className="flex items-center gap-2 px-2">
          <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[#007BFF] text-white">
            <MapPin className="size-4" />
          </span>
          <div className="leading-tight">
            <p className="font-heading text-lg font-bold text-[#001B6C]">Uptions</p>
            <p className="text-xs font-medium text-slate-500">Admin</p>
          </div>
        </div>
        {email ? (
          <p className="mt-3 truncate px-2 text-xs text-slate-500" title={email}>
            {email}
          </p>
        ) : null}

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[#007BFF] text-white"
                    : "text-slate-600 hover:bg-slate-100",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={() => {
            clearAdminKey()
            router.push("/admin/login")
            router.refresh()
          }}
          className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[#E11D48] hover:bg-red-50"
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </aside>
      <div className="min-w-0 flex-1 overflow-auto p-6 md:p-8">{children}</div>
    </div>
  )
}
