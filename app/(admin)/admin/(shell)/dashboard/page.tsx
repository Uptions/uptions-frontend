"use client"

import { useCallback, useEffect, useState } from "react"

import { OrdersGrowthChart } from "@/components/admin/orders-growth-chart"
import {
  type AdminDashboardRange,
  type AdminDashboardSummary,
  fetchAdminDashboardSummary,
  formatNairaAdmin,
} from "@/lib/admin-api"
import { cn } from "@/lib/utils"

const ranges: { key: AdminDashboardRange; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "all", label: "All Time" },
]

function pctLabel(n: number): string {
  const sign = n >= 0 ? "+" : ""
  return `${sign}${n}%`
}

function MetricCard({
  title,
  value,
  sub,
  changePct,
  showChange = true,
}: {
  title: string
  value: string
  sub?: string
  changePct?: number
  showChange?: boolean
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-600">{title}</p>
      <p className="mt-2 font-heading text-3xl font-bold text-slate-900">{value}</p>
      {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
      {showChange && changePct !== undefined ? (
        <p
          className={cn(
            "mt-2 text-sm font-semibold",
            changePct >= 0 ? "text-emerald-600" : "text-red-600",
          )}
        >
          {pctLabel(changePct)}
        </p>
      ) : null}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [range, setRange] = useState<AdminDashboardRange>("week")
  const [data, setData] = useState<AdminDashboardSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const d = await fetchAdminDashboardSummary(range)
      setData(d)
    } catch (e) {
      setData(null)
      setError(e instanceof Error ? e.message : "Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => {
    void load()
  }, [load])

  const o = data?.overview

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-4xl font-bold text-slate-900">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          {ranges.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                range === r.key
                  ? "bg-[#007BFF] text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      {loading && !data ? (
        <p className="text-slate-500">Loading dashboard…</p>
      ) : null}

      {o ? (
        <>
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Overview</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard
                title="Total Orders"
                value={o.totalOrders.toLocaleString("en-NG")}
                changePct={o.totalOrdersChangePct}
              />
              <MetricCard
                title="Delivery Providers"
                value={o.deliveryProviders.toLocaleString("en-NG")}
                showChange={false}
              />
              <MetricCard
                title="Revenue Generated (Weekly)"
                value={formatNairaAdmin(o.revenueNaira)}
                changePct={o.revenueChangePct}
              />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Active Providers"
                value={o.activeProviders.toLocaleString("en-NG")}
                showChange={false}
              />
              <MetricCard
                title="Completed Orders"
                value={o.completedOrders.toLocaleString("en-NG")}
                changePct={o.completedOrdersChangePct}
              />
              <MetricCard
                title="Orders in Pool"
                value={o.ordersInPool.toLocaleString("en-NG")}
                showChange={false}
              />
              <MetricCard
                title="New Requests"
                value={o.newRequests.toLocaleString("en-NG")}
                showChange={false}
              />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <MetricCard
                title="Users"
                value={o.users.toLocaleString("en-NG")}
                changePct={o.usersChangePct}
              />
              <MetricCard
                title="New User Signups"
                value={o.newUserSignups.toLocaleString("en-NG")}
                changePct={o.newUserSignupsChangePct}
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Orders Growth Trend</h2>
              <div className="text-left md:text-right">
                <p className="font-heading text-3xl font-bold text-[#007BFF]">
                  {pctLabel(data!.ordersGrowth.headlinePct)}
                </p>
                <p className="text-sm text-slate-600">
                  {data!.ordersGrowth.sublabel} vs prior half of the week
                </p>
              </div>
            </div>
            <div className="mt-6">
              <OrdersGrowthChart
                data={data!.ordersGrowth.series.map((s) => ({
                  label: s.label,
                  count: s.count,
                }))}
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">Top Performing Partners</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="pb-3 font-semibold">Partner</th>
                    <th className="pb-3 font-semibold">Orders Delivered</th>
                    <th className="pb-3 font-semibold">Average Rating</th>
                    <th className="pb-3 font-semibold">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data!.topPartners.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        No delivered orders yet.
                      </td>
                    </tr>
                  ) : (
                    data!.topPartners.map((row) => (
                      <tr key={row.partnerId} className="border-b border-slate-100">
                        <td className="py-3 font-medium text-[#007BFF]">{row.partnerName}</td>
                        <td className="py-3 text-slate-800">{row.ordersDelivered}</td>
                        <td className="py-3 text-slate-800">{row.averageRating}</td>
                        <td className="py-3 text-slate-800">{formatNairaAdmin(row.revenueNaira)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}
