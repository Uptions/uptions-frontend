"use client"

import { useCallback, useEffect, useState } from "react"

import { BusinessShell } from "@/components/business/business-shell"
import { BusinessNoSession } from "@/components/business/business-no-session"
import {
  claimBusinessOrderPool,
  formatNaira,
  getBusinessOrderPool,
  type PoolOrderRow,
} from "@/lib/business-api"
import { useBusinessSession } from "@/hooks/use-business-session"

export default function BusinessOrderPoolPage() {
  const { ready, authenticated, companyId } = useBusinessSession()
  const [rows, setRows] = useState<PoolOrderRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [claimingId, setClaimingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const data = await getBusinessOrderPool()
      setRows(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order pool")
      setRows([])
    }
  }, [])

  useEffect(() => {
    if (!ready || !authenticated) return
    queueMicrotask(() => {
      void load()
    })
  }, [ready, authenticated, load])

  if (!ready) {
    return (
      <BusinessShell activeNav="order-pool">
        <p className="mt-8 text-brand-secondary">Loading…</p>
      </BusinessShell>
    )
  }

  if (!authenticated) {
    return <BusinessNoSession activeNav="order-pool" reason="sign-in" />
  }

  if (!companyId) {
    return <BusinessNoSession activeNav="order-pool" reason="onboarding" />
  }

  return (
    <BusinessShell activeNav="order-pool">
      <div className="mt-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-5xl font-bold text-brand-foreground">Order Pool</h1>
            <p className="mt-2 text-sm text-brand-secondary">
              Explore available orders and accept the ones that fit your schedule
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-secondary px-5 text-sm font-medium text-white"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-[#E11D48]" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 space-y-2">
        {rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-brand-secondary">
            No unassigned orders in the pool right now.
          </p>
        ) : (
          rows.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-lg bg-[#eef3f9] px-4 py-3"
            >
              <div>
                <p className="font-semibold text-brand-foreground">{order.title}</p>
                <p className="text-sm text-brand-secondary">{order.eta}</p>
                <p className="text-xs text-brand-secondary">{order.route}</p>
                <p className="mt-0.5 text-xl font-semibold text-brand-secondary">
                  {formatNaira(order.suggestedPriceNaira)}
                </p>
              </div>
              <button
                type="button"
                disabled={claimingId === order.id}
                onClick={() => {
                  void (async () => {
                    setClaimingId(order.id)
                    setError(null)
                    try {
                      await claimBusinessOrderPool(companyId, order.id)
                      await load()
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Could not claim order")
                    } finally {
                      setClaimingId(null)
                    }
                  })()
                }}
                className="rounded-full bg-[#dce4ee] px-5 py-2 text-sm font-medium text-brand-foreground disabled:opacity-50"
              >
                {claimingId === order.id ? "Claiming…" : "Claim order"}
              </button>
            </div>
          ))
        )}
      </div>
    </BusinessShell>
  )
}
