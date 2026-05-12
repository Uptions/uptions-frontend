"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import {
  fetchAdminDeliveryProvidersList,
  type AdminDeliveryProviderRow,
} from "@/lib/admin-api"

export default function AdminDeliveryProvidersPage() {
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<AdminDeliveryProviderRow[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const limit = 10

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchAdminDeliveryProvidersList({ page, limit })
      setItems(res.items)
      setTotalPages(res.totalPages)
      setTotal(res.total)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load providers")
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900">Delivery Providers</h1>
          <p className="mt-1 text-slate-600">Manage Providers</p>
        </div>
        <Link
          href="/admin/delivery-providers/new"
          className="rounded-lg bg-[#007BFF] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0066d6]"
        >
          Add Provider
        </Link>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Active jobs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-slate-500">
                  No delivery providers yet.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <Link
                      href={`/admin/delivery-providers/${row.id}`}
                      className="text-[#007BFF] hover:underline"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        row.activeJobs === 0
                          ? "inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700"
                          : "inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
                      }
                    >
                      {row.activeJobs}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && total > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
            <p className="text-xs text-slate-500">
              Page {page} of {totalPages} · {total} total
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg bg-[#007BFF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0066d6] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
