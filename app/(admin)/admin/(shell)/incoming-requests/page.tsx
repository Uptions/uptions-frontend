"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import {
  approveBusinessOnboarding,
  fetchPendingOnboarding,
  rejectBusinessOnboarding,
  type PendingOnboardingPage,
} from "@/lib/admin-api"
import { cn } from "@/lib/utils"

function formatWhen(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString("en-NG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export default function AdminIncomingRequestsPage() {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PendingOnboardingPage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState<string | null>(null)

  const limit = 10

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetchPendingOnboarding(page, limit)
      setData(res)
    } catch (e) {
      setData(null)
      setError(e instanceof Error ? e.message : "Failed to load requests")
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    void load()
  }, [load])

  const empty = !loading && data && data.total === 0
  const title = empty ? "Incoming Requests" : "Pending Requests"

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold text-slate-900">{title}</h1>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      {loading && !data ? <p className="text-slate-500">Loading…</p> : null}

      {empty ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">No incoming requests</p>
          <p className="mt-2 text-sm text-slate-600">New requests will appear here</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-6 rounded-lg bg-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-300"
          >
            Refresh
          </button>
        </div>
      ) : null}

      {!empty && data && data.items.length > 0 ? (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="px-4 py-3 font-semibold">Request ID</th>
                  <th className="px-4 py-3 font-semibold">Date/Time</th>
                  <th className="px-4 py-3 font-semibold">Sender</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/incoming-requests/${row.id}`}
                        className="font-medium text-[#007BFF] hover:underline"
                      >
                        {row.requestId}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[#007BFF]">{formatWhen(row.submittedAt)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/incoming-requests/${row.id}`}
                        className="font-medium text-[#007BFF] hover:underline"
                      >
                        {row.sender}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-800">
                        {row.statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/incoming-requests/${row.id}`}
                          className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                        >
                          Details
                        </Link>
                        <button
                          type="button"
                          disabled={actingId === row.id}
                          onClick={() => {
                            void (async () => {
                              setActingId(row.id)
                              try {
                                await approveBusinessOnboarding(row.id)
                                await load()
                              } catch (e) {
                                setError(e instanceof Error ? e.message : "Approve failed")
                              } finally {
                                setActingId(null)
                              }
                            })()
                          }}
                          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={actingId === row.id}
                          onClick={() => {
                            void (async () => {
                              setActingId(row.id)
                              try {
                                await rejectBusinessOnboarding(row.id)
                                await load()
                              } catch (e) {
                                setError(e instanceof Error ? e.message : "Reject failed")
                              } finally {
                                setActingId(null)
                              }
                            })()
                          }}
                          className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
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
              onClick={() => setPage((p) => p + 1)}
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
