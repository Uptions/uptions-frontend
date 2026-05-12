"use client"

import { ChevronLeft, Clock3, Copy, Phone } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

import {
  type AdminOrderDetail,
  fetchAdminOrderDetail,
  formatNairaAdmin,
} from "@/lib/admin-api"

function formatMmSs(totalSec: number): string {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    /* ignore */
  }
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ orderId: string }>()
  const orderId = params.orderId ?? ""
  const [data, setData] = useState<AdminOrderDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [remain, setRemain] = useState<number | null>(null)

  const load = useCallback(async () => {
    if (!orderId) return
    setError(null)
    try {
      const d = await fetchAdminOrderDetail(orderId)
      setData(d)
    } catch (e) {
      setData(null)
      setError(e instanceof Error ? e.message : "Failed to load order")
    }
  }, [orderId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!data?.countdownSeconds || data.countdownSeconds <= 0) {
      setRemain(null)
      return
    }
    let sec = data.countdownSeconds
    setRemain(sec)
    const t = setInterval(() => {
      sec -= 1
      setRemain(sec > 0 ? sec : 0)
      if (sec <= 0) clearInterval(t)
    }, 1000)
    return () => clearInterval(t)
  }, [data?.id, data?.countdownSeconds])

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
        {error}
      </div>
    )
  }

  if (!data) {
    return <p className="text-slate-500">Loading…</p>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xl font-semibold text-slate-800">Order Details</p>
        <div className="mt-2 flex items-center gap-2">
          <Link href="/admin/orders" className="text-slate-700 hover:text-[#007BFF]">
            <ChevronLeft className="size-8" />
          </Link>
          <h1 className="font-heading text-3xl font-bold text-slate-900">Order #{data.orderRef}</h1>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-sky-700">Sender Details</p>
            <p className="mt-1 font-semibold text-slate-900">{data.sender.name}</p>
            <p className="text-sm text-slate-600">{data.sender.phoneMasked}</p>
          </div>
          <a
            href={`tel:${data.sender.phone.replace(/\s/g, "")}`}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 text-[#007BFF] hover:bg-slate-50"
            aria-label="Call sender"
          >
            <Phone className="size-5" />
          </a>
        </div>
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-sky-700">Pickup Address</p>
            <p className="mt-1 text-slate-900">{data.pickupAddress}</p>
          </div>
          <button
            type="button"
            onClick={() => void copyText(data.pickupAddress)}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Copy pickup address"
          >
            <Copy className="size-5" />
          </button>
        </div>
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-sky-700">Receiver Details</p>
            <p className="mt-1 font-semibold text-slate-900">{data.receiver.name}</p>
            <p className="text-sm text-slate-600">{data.receiver.phoneMasked}</p>
          </div>
          <a
            href={`tel:${data.receiver.phone.replace(/\s/g, "")}`}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 text-[#007BFF] hover:bg-slate-50"
            aria-label="Call receiver"
          >
            <Phone className="size-5" />
          </a>
        </div>
        <div className="flex items-start justify-between gap-3 pt-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-sky-700">Delivery Address</p>
            <p className="mt-1 text-slate-900">{data.deliveryAddress}</p>
          </div>
          <button
            type="button"
            onClick={() => void copyText(data.deliveryAddress)}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Copy delivery address"
          >
            <Copy className="size-5" />
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-800">Package &amp; Pricing</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-sky-700">Package Type</p>
            <p className="font-medium text-slate-900">{data.package.typeLabel || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-sky-700">Weight</p>
            <p className="font-medium text-slate-900">{data.package.weightClass}</p>
          </div>
          <div>
            <p className="text-xs text-sky-700">Base Fare</p>
            <p className="font-medium text-slate-900">{formatNairaAdmin(data.pricing.baseFareNaira)}</p>
          </div>
          <div>
            <p className="text-xs text-sky-700">Service / distance fee</p>
            <p className="font-medium text-slate-900">
              {formatNairaAdmin(data.pricing.distanceFeeNaira)}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="font-semibold text-slate-800">Total</span>
          <span className="text-lg font-bold text-slate-900">
            {formatNairaAdmin(data.pricing.totalNaira)}
          </span>
        </div>
        {data.selectedCompanyName ? (
          <p className="mt-3 text-sm text-slate-600">
            Partner: <span className="font-medium text-slate-900">{data.selectedCompanyName}</span>
          </p>
        ) : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-sky-50 p-5">
        <p className="text-sm font-semibold text-slate-800">Delivery Timeline</p>
        <div className="mt-3 flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-sm">
          <Clock3 className="size-6 text-[#007BFF]" />
          {remain != null && remain > 0 ? (
            <span className="font-mono text-lg font-semibold text-slate-900">{formatMmSs(remain)}</span>
          ) : (
            <span className="text-slate-600">No active countdown</span>
          )}
        </div>
      </section>
    </div>
  )
}
