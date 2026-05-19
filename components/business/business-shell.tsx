"use client"

import {
  Bell,
  BriefcaseBusiness,
  ChevronLeft,
  ClipboardList,
  House,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
  Wallet,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ReactNode, useState } from "react"

import { logoutBusiness } from "@/lib/business-auth"
import { clearBusinessSession } from "@/lib/business-session"
import { cn } from "@/lib/utils"

type NavKey = "home" | "orders" | "order-pool" | "wallet" | "account"

type BusinessShellProps = {
  activeNav: NavKey
  children: ReactNode
  /** Shown next to the notification / avatar cluster (e.g. onboarding status). */
  headerExtra?: ReactNode
}

const navItems: Array<{
  key: NavKey
  label: string
  href: string
  icon: typeof House
}> = [
  { key: "home", label: "Home", href: "/business/dashboard", icon: House },
  { key: "orders", label: "Orders", href: "/business/orders", icon: ClipboardList },
  { key: "order-pool", label: "Order Pool", href: "/business/order-pool", icon: BriefcaseBusiness },
  { key: "wallet", label: "Wallet", href: "/business/wallet", icon: Wallet },
  { key: "account", label: "Account", href: "/business/account", icon: UserRound },
]

export function BusinessShell({ activeNav, children, headerExtra }: BusinessShellProps) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className="relative min-h-svh w-full overflow-hidden bg-transparent before:pointer-events-none before:absolute before:inset-0 before:bg-[url('/layer.svg')] before:bg-top before:bg-no-repeat before:blur-[6px] before:[background-size:100%_auto] before:content-['']"
      data-landing-root
    >
      <main className="relative z-10 mx-auto flex min-h-svh w-full max-w-[1280px] gap-5 p-6">
        <aside
          className={cn(
            "flex shrink-0 flex-col rounded-xl bg-[#f5f9ff]/90 p-4 shadow-[0_4px_20px_-12px_rgba(0,27,108,0.4)] transition-all",
            collapsed ? "w-[72px]" : "w-72",
          )}
        >
          <div className={cn("mb-4 flex items-center", collapsed ? "justify-center" : "justify-between")}>
            {collapsed ? (
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                className="inline-flex size-8 items-center justify-center rounded-md border border-brand-foreground/15 bg-white text-brand-primary"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="size-4" />
              </button>
            ) : (
              <>
                <span className="inline-flex items-center gap-2 text-lg font-bold text-brand-primary">
                  <ChevronLeft className="size-4 text-brand-secondary" />
                  Uptions
                </span>
                <button
                  type="button"
                  onClick={() => setCollapsed(true)}
                  className="inline-flex size-8 items-center justify-center rounded-md border border-brand-foreground/15 bg-white text-brand-primary"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose className="size-4" />
                </button>
              </>
            )}
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = activeNav === item.key
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "flex h-10 items-center rounded-lg text-sm transition-colors",
                    collapsed ? "justify-center" : "gap-2 px-3",
                    active
                      ? "bg-brand-secondary text-brand-white"
                      : "text-brand-foreground hover:bg-brand-foreground/10",
                  )}
                  aria-label={item.label}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="size-4" />
                  {collapsed ? null : item.label}
                </Link>
              )
            })}
          </nav>

          {collapsed ? null : (
            <button
              type="button"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-brand-secondary px-4 text-sm font-medium text-brand-white transition-colors hover:bg-brand-secondary/90"
            >
              Generate Link
            </button>
          )}

          <div className={cn("mt-auto", collapsed ? "space-y-5" : "space-y-3")}>
            {collapsed ? null : (
              <button
                type="button"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-brand-secondary px-4 text-sm font-medium text-brand-white transition-colors hover:bg-brand-secondary/90"
              >
                Contact Support
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                void (async () => {
                  try {
                    await logoutBusiness()
                  } finally {
                    clearBusinessSession()
                    router.push("/business/auth")
                  }
                })()
              }}
              className={cn(
                "inline-flex items-center text-sm font-medium text-[#E11D48]",
                collapsed ? "justify-center" : "gap-2",
              )}
              aria-label="Logout"
            >
              <LogOut className="size-4" />
              {collapsed ? null : "Logout"}
            </button>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex w-full flex-wrap items-center gap-4">
            <div className="min-w-0 flex-1" />
            <div className="flex flex-wrap items-center justify-end gap-4">
              {headerExtra}
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center rounded-lg border border-brand-foreground/15 bg-white/80 text-brand-foreground"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
              </button>
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-[#f0d0b3] text-sm font-semibold text-brand-foreground">
                K
              </span>
            </div>
          </header>
          {children}
        </section>
      </main>
    </div>
  )
}

