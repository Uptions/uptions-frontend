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

type OrderTab = "new" | "pending" | "completed"

const orderTabs: Array<{ key: OrderTab; label: string; empty: string }> = [
  { key: "new", label: "New Orders", empty: "No new orders yet." },
  { key: "pending", label: "Pending Orders", empty: "No pending orders yet." },
  { key: "completed", label: "Completed Orders", empty: "No completed orders yet." },
]

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
  const [activeOrderTab, setActiveOrderTab] = useState<OrderTab>("new")
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [availability, setAvailability] = useState(true)
  const [togglingAvailability, setTogglingAvailability] = useState(false)
  const [showConfirmationInfo, setShowConfirmationInfo] = useState(false)

  const displayName = profile?.name?.trim() || businessName || "your business"

  const loadData = useCallback(async () => {
    if (!companyId) return
    setLoadError(null)
    setLoadingOrders(true)
    try {
      const [p, o, list] = await Promise.all([
        getBusinessProfile(companyId),
        getBusinessOverview(companyId),
        getBusinessOrders(companyId, activeOrderTab),
      ])
      setProfile(p)
      setOverview(o)
      setOrders(list.slice(0, 5))
      if (typeof p.availabilityEnabled === "boolean") {
        setAvailability(p.availabilityEnabled)
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load dashboard")
    } finally {
      setLoadingOrders(false)
    }
  }, [activeOrderTab, companyId])

  useEffect(() => {
    if (!ready || !companyId) return
    queueMicrotask(() => {
      void loadData()
    })
  }, [ready, companyId, loadData])

  const pendingReview = profile?.onboardingStatus === "pending_review"

  const headerExtra =
    pendingReview ? (
      <button type="button" onClick={() => setShowConfirmationInfo(true)} className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#E11D48] md:text-base">
        <AlertCircle className="size-5 shrink-0" />
        Awaiting confirmation
      </button>
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
    <BusinessShell activeNav="home" headerExtra={headerExtra} avatarLabel={displayName}>
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
            className={`h-7 w-14 rounded-full p-1 disabled:cursor-not-allowed disabled:opacity-55 ${availability ? "bg-[#12A150]" : "bg-brand-foreground/40"}`}
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
        <div role="tablist" aria-label="Dashboard orders" className="mb-2 flex items-center gap-8 border-b border-brand-foreground/15 text-sm font-semibold text-brand-secondary">
          {orderTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeOrderTab === tab.key}
              onClick={() => setActiveOrderTab(tab.key)}
              className={`border-b-2 px-0 pb-2 transition-colors hover:text-brand-primary ${activeOrderTab === tab.key ? "border-brand-primary text-brand-foreground" : "border-transparent"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" className="space-y-2">
          {loadingOrders ? (
            <p className="py-6 text-center text-sm text-brand-secondary">Loading orders…</p>
          ) : orders.length === 0 ? (
            <p className="py-6 text-center text-sm text-brand-secondary">{orderTabs.find((tab) => tab.key === activeOrderTab)?.empty}</p>
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
      {showConfirmationInfo ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-brand-foreground/45 p-4" onMouseDown={() => setShowConfirmationInfo(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="confirmation-info-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <h2 id="confirmation-info-title" className="text-xl font-bold text-brand-primary">We are confirming your information</h2>
            <p className="mt-3 text-brand-foreground">Please bear with us while our team reviews your business details. This should not take more than 6 to 16 hours, and we will notify you as soon as your account is confirmed.</p>
            <button type="button" onClick={() => setShowConfirmationInfo(false)} className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-lg bg-brand-secondary font-semibold text-white">Got it</button>
          </section>
        </div>
      ) : null}
    </BusinessShell>
  )
}
