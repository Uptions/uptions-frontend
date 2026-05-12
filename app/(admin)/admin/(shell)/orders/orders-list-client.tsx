"use client"

import { Search } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

import {
  type AdminOrderTab,
  fetchAdminDeliveryPartners,
  fetchAdminOrdersList,
  formatNairaAdmin,
  type AdminDeliveryPartner,
  type AdminOrdersListResponse,
} from "@/lib/admin-api"
import { cn } from "@/lib/utils"

const TABS: { key: AdminOrderTab; label: string }[] = [
  { key: "new", label: "New Orders" },
  { key: "pending", label: "Pending Orders" },
  { key: "completed", label: "Completed Orders" },
]

const STATUS_OPTIONS: Record<
  AdminOrderTab,
  { value: string; label: string }[]
> = {
  new: [
    { value: "", label: "All statuses" },
    { value: "payment_confirmed", label: "Payment confirmed" },
  ],
  pending: [
    { value: "", label: "All statuses" },
    { value: "payment_made", label: "Payment made" },
    { value: "picked", label: "Picked" },
    { value: "in_transit", label: "In transit" },
  ],
  completed: [
    { value: "", label: "All statuses" },
    { value: "delivered", label: "Delivered" },
  ],
}

function parseTab(raw: string | null): AdminOrderTab {
  if (raw === "new" || raw === "pending" || raw === "completed") return raw
  return "pending"
}

export function AdminOrdersListClient() {
  const router = useRouter()
  const sp = useSearchParams()

  const tab = useMemo(() => parseTab(sp.get("tab")), [sp])
  const page = Math.max(1, Number.parseInt(sp.get("page") ?? "1", 10) || 1)
  const q = sp.get("q") ?? ""
  const status = sp.get("status") ?? ""
  const companyId = sp.get("companyId") ?? ""
  const dateFrom = sp.get("dateFrom") ?? ""
  const dateTo = sp.get("dateTo") ?? ""

  const [qInput, setQInput] = useState(q)
  const [partners, setPartners] = useState<AdminDeliveryPartner[]>([])
  const [data, setData] = useState<AdminOrdersListResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setQInput(q)
  }, [q])

  useEffect(() => {
    void fetchAdminDeliveryPartners()
      .then(setPartners)
      .catch(() => setPartners([]))
  }, [])

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetchAdminOrdersList({
        tab,
        page,
        limit: 10,
        q: q || undefined,
        status: status || undefined,
        companyId: companyId || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
      setData(res)
    } catch (e) {
      setData(null)
      setError(e instanceof Error ? e.message : "Failed to load orders")
    } finally {
      setLoading(false)
    }
  }, [tab, page, q, status, companyId, dateFrom, dateTo])

  useEffect(() => {
    void load()
  }, [load])

  function pushParams(next: Record<string, string | undefined>, resetPage = true) {
    const p = new URLSearchParams()
    const merged = {
      tab,
      page: resetPage ? "1" : String(page),
      q: q || undefined,
      status: status || undefined,
      companyId: companyId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      ...next,
    }
    if (merged.tab) p.set("tab", merged.tab)
    if (merged.page && merged.page !== "1") p.set("page", merged.page)
    if (merged.q) p.set("q", merged.q)
    if (merged.status) p.set("status", merged.status)
    if (merged.companyId) p.set("companyId", merged.companyId)
    if (merged.dateFrom) p.set("dateFrom", merged.dateFrom)
    if (merged.dateTo) p.set("dateTo", merged.dateTo)
    router.replace(`/admin/orders?${p.toString()}`)
  }

  const title =
    tab === "completed"
      ? "Closed Deliveries"
      : tab === "pending"
        ? "Ongoing Deliveries"
        : "New Orders"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-slate-900">{title}</h1>
        {tab === "pending" ? (
          <Link
            href="/admin/orders?tab=completed"
            className="mt-1 inline-block text-sm font-medium text-[#007BFF] hover:underline"
          >
            View all completed deliveries
          </Link>
        ) : tab === "completed" ? (
          <p className="mt-1 text-sm text-slate-500">View all completed deliveries</p>
        ) : (
          <p className="mt-1 text-sm text-slate-500">Recently confirmed payments</p>
        )}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#007BFF]" />
        <input
          type="search"
          placeholder="Search deliveries"
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") pushParams({ q: qInput.trim() || undefined })
          }}
          className="h-12 w-full rounded-lg border border-slate-200 bg-slate-100 py-2 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-[#007BFF] focus:outline-none focus:ring-2 focus:ring-[#007BFF]/20"
        />
      </div>

      <div className="flex flex-wrap gap-6 border-b border-slate-200 pb-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => pushParams({ tab: t.key, page: "1" })}
            className={cn(
              "pb-2 text-sm font-semibold transition-colors",
              tab === t.key
                ? "border-b-2 border-[#007BFF] text-[#007BFF]"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => pushParams({ status: e.target.value || undefined })}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800"
          aria-label="Status filter"
        >
          {STATUS_OPTIONS[tab].map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => pushParams({ dateFrom: e.target.value || undefined })}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm"
          aria-label="From date"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => pushParams({ dateTo: e.target.value || undefined })}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm"
          aria-label="To date"
        />
        <select
          value={companyId}
          onChange={(e) => pushParams({ companyId: e.target.value || undefined })}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800"
          aria-label="Delivery partner filter"
        >
          <option value="">All partners</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      {loading && !data ? <p className="text-slate-500">Loading…</p> : null}

      {data ? (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="bg-sky-100 text-slate-800">
                  <th className="px-4 py-3 font-semibold">Delivery Number</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Delivery partners</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Timer</th>
                  <th className="px-4 py-3 font-semibold">Distance</th>
                  <th className="px-4 py-3 font-semibold">Cost</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                      No orders match your filters.
                    </td>
                  </tr>
                ) : (
                  data.items.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="max-w-xs px-4 py-3">
                        <Link
                          href={`/admin/orders/${row.id}`}
                          className="font-medium text-[#007BFF] hover:underline"
                        >
                          {row.deliverySummary}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-800">
                          {row.statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-800">{row.deliveryPartner}</td>
                      <td className="px-4 py-3 text-slate-800">{row.date}</td>
                      <td className="px-4 py-3 text-slate-800">{row.timeLabel}</td>
                      <td className="px-4 py-3 text-slate-800">
                        {row.distanceKm != null ? `${row.distanceKm} km` : "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {formatNairaAdmin(row.costNaira)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => pushParams({ page: String(Math.max(1, page - 1)) }, false)}
              className={cn(
                "rounded-lg px-5 py-2 text-sm font-semibold",
                page <= 1
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "bg-slate-200 text-slate-800 hover:bg-slate-300",
              )}
            >
              Previous
            </button>
            <span className="text-sm text-slate-600">
              Page {data.page} of {data.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= data.totalPages || loading}
              onClick={() => pushParams({ page: String(page + 1) }, false)}
              className={cn(
                "rounded-lg px-5 py-2 text-sm font-semibold text-white",
                page >= data.totalPages
                  ? "cursor-not-allowed bg-slate-300"
                  : "bg-[#007BFF] hover:bg-[#0066d6]",
              )}
            >
              Next
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}
