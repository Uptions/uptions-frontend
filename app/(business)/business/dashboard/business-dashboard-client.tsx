"use client"

import { AlertCircle, X } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

import { BusinessShell } from "@/components/business/business-shell"
import { BusinessNoSession } from "@/components/business/business-no-session"
import {
  formatNaira,
  getBusinessOrders,
  getBusinessOverview,
  getBusinessProfile,
  patchBusinessAvailability,
  type BusinessOrderRow,
  type BusinessOverview,
  type BusinessProfile,
} from "@/lib/business-api"
import { useBusinessSession } from "@/hooks/use-business-session"

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-brand-foreground/15 bg-white/75 p-4">
      <p className="text-sm text-brand-foreground">{title}</p>
      <p className="mt-1 text-4xl font-bold text-brand-foreground">{value}</p>
    </div>
  )
}

export function BusinessDashboardClient() {
  const searchParams = useSearchParams()
  const shouldShowWelcome = useMemo(() => searchParams.get("welcome") === "1", [searchParams])
  const [showWelcomeModal, setShowWelcomeModal] = useState(shouldShowWelcome)

  const { ready, authenticated, companyId, businessName } = useBusinessSession()
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [overview, setOverview] = useState<BusinessOverview | null>(null)
  const [orders, setOrders] = useState<BusinessOrderRow[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [availability, setAvailability] = useState(true)
  const [togglingAvailability, setTogglingAvailability] = useState(false)

  const displayName = profile?.name?.trim() || businessName || "your business"

  const loadData = useCallback(async () => {
    if (!companyId) return
    setLoadError(null)
    try {
      const [p, o, list] = await Promise.all([
        getBusinessProfile(companyId),
        getBusinessOverview(companyId),
        getBusinessOrders(companyId, "new"),
      ])
      setProfile(p)
      setOverview(o)
      setOrders(list.slice(0, 5))
      if (typeof p.availabilityEnabled === "boolean") {
        setAvailability(p.availabilityEnabled)
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load dashboard")
    }
  }, [companyId])

  useEffect(() => {
    if (!ready || !companyId) return
    queueMicrotask(() => {
      void loadData()
    })
  }, [ready, companyId, loadData])

  const pendingReview = profile?.onboardingStatus === "pending_review"

  const headerExtra =
    pendingReview ? (
      <p className="inline-flex items-center gap-2 text-sm font-medium text-[#E11D48] md:text-base">
        <AlertCircle className="size-5 shrink-0" />
        Awaiting confirmation
      </p>
    ) : null

  if (!ready) {
    return (
      <BusinessShell activeNav="home">
        <p className="mt-8 text-brand-secondary">Loading…</p>
      </BusinessShell>
    )
  }

  if (!authenticated) {
    return <BusinessNoSession activeNav="home" reason="sign-in" />
  }

  if (!companyId) {
    return <BusinessNoSession activeNav="home" reason="onboarding" />
  }

  return (
    <BusinessShell activeNav="home" headerExtra={headerExtra}>
      {loadError ? (
        <p className="mt-4 text-sm text-[#E11D48]" role="alert">
          {loadError}
        </p>
      ) : null}

      <div className="mt-6">
        <h1 className="text-5xl font-bold text-brand-foreground">
          Welcome back, <span className="text-brand-secondary">{displayName}</span>
        </h1>
        <div
          className={`mt-4 flex items-center justify-between rounded-lg px-4 py-2 text-brand-white ${
            availability ? "bg-brand-secondary" : "bg-brand-foreground/50"
          }`}
        >
          <div>
            <p className="text-sm font-semibold">
              {availability ? "We are available now" : "You are currently unavailable"}
            </p>
            <p className="text-xs opacity-80">
              {availability ? "Available to receive deliveries" : "Toggle on to receive deliveries"}
            </p>
          </div>
          <button
            type="button"
            disabled={togglingAvailability || pendingReview}
            onClick={() => {
              void (async () => {
                const next = !availability
                setTogglingAvailability(true)
                try {
                  await patchBusinessAvailability(companyId, next)
                  setAvailability(next)
                } catch {
                  /* revert on failure */
                } finally {
                  setTogglingAvailability(false)
                }
              })()
            }}
            className={`h-7 w-14 rounded-full p-1 ${availability ? "bg-[#12A150]" : "bg-brand-foreground/40"}`}
            aria-label="Availability toggle"
          >
            <span
              className={`block size-5 rounded-full bg-white ${availability ? "ml-auto" : ""}`}
            />
          </button>
        </div>
        <p className="mt-2 text-sm text-brand-foreground">
          You&apos;ll be active during your <span className="font-semibold">set hours</span>. Toggle
          off anytime if you&apos;re on Inactive.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard title="New Orders" value={String(overview?.newOrders ?? "—")} />
        <StatCard title="In Progress" value={String(overview?.inProgress ?? "—")} />
        <StatCard
          title="Earnings Today"
          value={
            overview ? formatNaira(overview.earningsToday) : "—"
          }
        />
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center gap-8 border-b border-brand-foreground/15 pb-2 text-sm font-semibold text-brand-secondary">
          <span className="text-brand-foreground">New Orders</span>
          <Link href="/business/orders" className="hover:underline">
            Pending Orders
          </Link>
          <Link href="/business/orders?tab=completed" className="hover:underline">
            Completed Orders
          </Link>
        </div>

        <div className="space-y-2">
          {orders.length === 0 ? (
            <p className="py-6 text-center text-sm text-brand-secondary">No new orders yet.</p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border border-brand-foreground/10 bg-white/75 p-3"
              >
                <div>
                  <p className="font-semibold text-brand-foreground">{order.title}</p>
                  <p className="text-sm text-brand-secondary">{order.etaLabel}</p>
                  <p className="text-xs text-brand-secondary">{order.route}</p>
                </div>
                <Link
                  href={`/business/orders/${order.id}`}
                  className="rounded-full bg-[#e8edf4] px-4 py-2 text-sm font-medium text-brand-foreground"
                >
                  View Details
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {showWelcomeModal ? (
        <>
          <div className="fixed inset-0 z-20 bg-[#bfdbff]/45 backdrop-blur-[1px]" />
          <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl rounded-2xl bg-white p-10 text-center shadow-[0_20px_50px_-20px_rgba(0,27,108,0.55)]">
              <button
                type="button"
                onClick={() => setShowWelcomeModal(false)}
                className="absolute right-5 top-5 inline-flex size-8 items-center justify-center rounded-full border border-brand-foreground/15 bg-white text-brand-foreground"
                aria-label="Close welcome popup"
              >
                <X className="size-4" />
              </button>
              <div className="mx-auto flex size-20 items-center justify-center rounded-lg bg-brand-secondary text-4xl font-semibold text-white">
                -
              </div>
              <h2 className="mt-8 text-4xl font-bold text-brand-primary">Welcome aboard!</h2>
              <p className="mx-auto mt-4 max-w-xl text-xl text-brand-foreground">
                Our team will review your info and ping you shortly. You&apos;re now one step closer
                to reaching more customers with <span className="font-bold">Uptions.</span>
              </p>
            </div>
          </div>
        </>
      ) : null}
    </BusinessShell>
  )
}
