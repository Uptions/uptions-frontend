"use client"

import { ChevronLeft, Clock3, Copy, Phone } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

import { BusinessShell } from "@/components/business/business-shell"
import { BusinessNoSession } from "@/components/business/business-no-session"
import { formatNaira, getBusinessOrderDetail, type BusinessOrderDetail } from "@/lib/business-api"
import { useBusinessSession } from "@/hooks/use-business-session"

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    /* ignore */
  }
}

export default function BusinessOrderDetailsPage() {
  const params = useParams<{ orderId: string }>()
  const orderId = params.orderId ?? ""
  const { ready, authenticated, companyId } = useBusinessSession()
  const [order, setOrder] = useState<BusinessOrderDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!companyId || !orderId) return
    setError(null)
    try {
      const data = await getBusinessOrderDetail(companyId, orderId)
      setOrder(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order")
      setOrder(null)
    }
  }, [companyId, orderId])

  useEffect(() => {
    if (!ready || !companyId || !orderId) return
    queueMicrotask(() => {
      void load()
    })
  }, [ready, companyId, orderId, load])

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

  const displayId = order?._id ?? orderId

  return (
    <BusinessShell activeNav="orders">
      <div className="mt-6">
        <p className="text-4xl font-bold text-brand-foreground">Order Details</p>
        <div className="mt-3 flex items-center gap-3">
          <Link href="/business/orders" className="text-brand-foreground">
            <ChevronLeft className="size-8" />
          </Link>
          <h1 className="text-5xl font-bold text-brand-foreground">Order #{displayId.slice(-8)}</h1>
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-[#E11D48]" role="alert">
          {error}
        </p>
      ) : null}

      {order ? (
        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-foreground">Sender Details</h2>
            <div className="mt-2 rounded-lg bg-[#edf2f8] p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-brand-foreground">{order.sender.name}</p>
                  <p className="text-sm text-brand-secondary">{order.sender.phone}</p>
                </div>
                <Phone className="size-4 text-brand-foreground" />
              </div>
            </div>
            <div className="mt-2 rounded-lg bg-[#edf2f8] p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-brand-foreground">Pickup Address</p>
                  <p className="text-sm text-brand-secondary">{order.sender.address}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void copyText(order.sender.address)}
                  className="text-brand-foreground"
                  aria-label="Copy pickup address"
                >
                  <Copy className="size-4" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-brand-foreground">Receiver Details</h2>
            <div className="mt-2 rounded-lg bg-[#edf2f8] p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-brand-foreground">{order.receiver.name}</p>
                  <p className="text-sm text-brand-secondary">{order.receiver.phone}</p>
                </div>
                <Phone className="size-4 text-brand-foreground" />
              </div>
            </div>
            <div className="mt-2 rounded-lg bg-[#edf2f8] p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-brand-foreground">Delivery Address</p>
                  <p className="text-sm text-brand-secondary">{order.receiver.address}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void copyText(order.receiver.address)}
                  className="text-brand-foreground"
                  aria-label="Copy delivery address"
                >
                  <Copy className="size-4" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-brand-foreground">Package & Pricing</h2>
            <div className="mt-2 grid grid-cols-2 gap-0 overflow-hidden rounded-lg border border-brand-foreground/10">
              <div className="bg-[#f5f8fc] p-3">
                <p className="text-sm text-brand-secondary">Vehicle</p>
                <p className="font-semibold text-brand-foreground">{order.package.vehicleType}</p>
              </div>
              <div className="bg-[#f5f8fc] p-3">
                <p className="text-sm text-brand-secondary">Weight class</p>
                <p className="font-semibold text-brand-foreground">{order.package.weightClass}</p>
              </div>
              <div className="border-t border-brand-foreground/10 bg-white p-3">
                <p className="text-sm text-brand-secondary">Subtotal</p>
                <p className="font-semibold text-brand-foreground">{formatNaira(order.subtotalNaira)}</p>
              </div>
              <div className="border-t border-brand-foreground/10 bg-white p-3">
                <p className="text-sm text-brand-secondary">Service charge</p>
                <p className="font-semibold text-brand-foreground">
                  {formatNaira(order.serviceChargeNaira)}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between rounded-lg bg-[#edf2f8] px-4 py-3">
              <p className="text-xl font-semibold text-brand-foreground">Total</p>
              <p className="text-xl font-semibold text-brand-foreground">
                {formatNaira(order.totalNaira)}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-brand-foreground">Delivery Timeline</h2>
            <div className="mt-2 flex items-center justify-between rounded-lg bg-[#edf2f8] px-4 py-3">
              <div className="inline-flex items-center gap-2 text-brand-secondary">
                <Clock3 className="size-4" />
                Status: {order.status}
              </div>
              <button
                type="button"
                className="rounded-full bg-brand-secondary px-4 py-2 text-sm font-medium text-white opacity-60"
                disabled
              >
                Reject order
              </button>
            </div>
          </div>
        </div>
      ) : !error ? (
        <p className="mt-8 text-brand-secondary">Loading order…</p>
      ) : null}
    </BusinessShell>
  )
}
