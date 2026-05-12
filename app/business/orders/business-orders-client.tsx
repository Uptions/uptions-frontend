"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

import { BusinessShell } from "@/components/business/business-shell"
import { BusinessNoSession } from "@/components/business/business-no-session"
import {
  formatNaira,
  getBusinessOrders,
  getBusinessOverview,
  type BusinessOrderRow,
  type BusinessOverview,
} from "@/lib/business-api"
import { useBusinessSession } from "@/hooks/use-business-session"

type OrderTab = "new" | "pending" | "completed"

const tabLabels: Array<{ key: OrderTab; label: string }> = [
  { key: "new", label: "New Orders" },
  { key: "pending", label: "Pending Orders" },
  { key: "completed", label: "Completed Orders" },
]

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-brand-foreground/15 bg-white/75 p-4">
      <p className="text-sm text-brand-foreground">{title}</p>
      <p className="mt-1 text-4xl font-bold text-brand-foreground">{value}</p>
    </div>
  )
}

export function BusinessOrdersClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = useMemo((): OrderTab => {
    const t = searchParams.get("tab")
    if (t === "new" || t === "pending" || t === "completed") return t
    return "pending"
  }, [searchParams])

  const { ready, authenticated, companyId } = useBusinessSession()
  const [overview, setOverview] = useState<BusinessOverview | null>(null)
  const [orders, setOrders] = useState<BusinessOrderRow[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!companyId) return
    setError(null)
    try {
      const [o, list] = await Promise.all([
        getBusinessOverview(companyId),
        getBusinessOrders(companyId, activeTab),
      ])
      setOverview(o)
      setOrders(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders")
    }
  }, [companyId, activeTab])

  useEffect(() => {
    if (!ready || !companyId) return
    queueMicrotask(() => {
      void load()
    })
  }, [ready, companyId, load])

  if (!ready) {
    return (
      <BusinessShell activeNav="orders">
        <p className="mt-8 text-brand-secondary">Loading…</p>
      </BusinessShell>
    )
  }

  if (!authenticated) {
    return <BusinessNoSession activeNav="orders" reason="sign-in" />
  }

  if (!companyId) {
    return <BusinessNoSession activeNav="orders" reason="onboarding" />
  }

  return (
    <BusinessShell activeNav="orders">
      {error ? (
        <p className="mt-4 text-sm text-[#E11D48]" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-5xl font-bold text-brand-foreground">Overview</h1>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-secondary px-5 text-sm font-medium text-white"
          >
            Generate rider link
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard title="New Orders" value={String(overview?.newOrders ?? "—")} />
        <StatCard title="In Progress" value={String(overview?.inProgress ?? "—")} />
        <StatCard
          title="Earnings Today"
          value={overview ? formatNaira(overview.earningsToday) : "—"}
        />
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center gap-8 border-b border-brand-foreground/15 pb-2 text-sm font-semibold text-brand-secondary">
          {tabLabels.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => router.replace(`/business/orders?tab=${tab.key}`)}
              className={activeTab === tab.key ? "text-brand-foreground" : ""}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-brand-secondary">No orders in this tab.</p>
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
                <div className="flex items-center gap-8">
                  <span className="text-sm font-medium text-brand-secondary">
                    {formatNaira(order.totalNaira)}
                  </span>
                  <Link
                    href={`/business/orders/${order.id}`}
                    className="rounded-full bg-[#e8edf4] px-4 py-2 text-sm font-medium text-brand-foreground"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </BusinessShell>
  )
}
