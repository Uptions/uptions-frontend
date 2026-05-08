"use client"

import { X } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

import { BusinessShell } from "@/components/business/business-shell"

const orders = [
  {
    title: "Order for Alex Harper",
    id: "UPT2456",
    eta: "ETA: 2 hours 30 minutes",
    route: "Pickup: 123 Main St, Anytown | Delivery: 456 Oak Ave, Anytown",
  },
  {
    title: "Order for Jordan Carter",
    id: "UPT2457",
    eta: "ETA: 1 hour 45 minutes",
    route: "Pickup: 789 Pine Ln, Anytown | Delivery: 101 Elm Rd, Anytown",
  },
  {
    title: "Order for Taylor Bennett",
    id: "UPT2458",
    eta: "ETA: 3 hours 15 minutes",
    route: "Pickup: 222 Maple Dr, Anytown | Delivery: 333 Cedar Ct, Anytown",
  },
]

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-brand-foreground/15 bg-white/75 p-4">
      <p className="text-sm text-brand-foreground">{title}</p>
      <p className="mt-1 text-4xl font-bold text-brand-foreground">{value}</p>
    </div>
  )
}

export default function BusinessDashboardPage() {
  const searchParams = useSearchParams()
  const shouldShowWelcome = useMemo(() => searchParams.get("welcome") === "1", [searchParams])
  const [showWelcomeModal, setShowWelcomeModal] = useState(shouldShowWelcome)

  return (
    <BusinessShell activeNav="home">
      <div className="mt-6">
        <h1 className="text-5xl font-bold text-brand-foreground">
          Welcome back, <span className="text-brand-secondary">KayDeli</span>
        </h1>
        <div className="mt-4 flex items-center justify-between rounded-lg bg-brand-secondary px-4 py-2 text-brand-white">
          <div>
            <p className="text-sm font-semibold">We are available now</p>
            <p className="text-xs opacity-80">Available to receive deliveries</p>
          </div>
          <button
            type="button"
            className="h-7 w-14 rounded-full bg-[#12A150] p-1"
            aria-label="Availability toggle"
          >
            <span className="ml-auto block size-5 rounded-full bg-white" />
          </button>
        </div>
        <p className="mt-2 text-sm text-brand-foreground">
          You&apos;ll be active during your <span className="font-semibold">set hours</span>. Toggle
          off anytime if you&apos;re on Inactive.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard title="New Orders" value="2" />
        <StatCard title="In Progress" value="1" />
        <StatCard title="Earnings Today" value="N35,000.00" />
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center gap-8 border-b border-brand-foreground/15 pb-2 text-sm font-semibold text-brand-secondary">
          <span className="text-brand-foreground">New Orders</span>
          <Link href="/business/orders" className="hover:underline">
            Pending Orders
          </Link>
          <span>Completed Orders</span>
        </div>

        <div className="space-y-2">
          {orders.map((order) => (
            <div
              key={order.title}
              className="flex items-center justify-between rounded-lg border border-brand-foreground/10 bg-white/75 p-3"
            >
              <div>
                <p className="font-semibold text-brand-foreground">{order.title}</p>
                <p className="text-sm text-brand-secondary">{order.eta}</p>
                <p className="text-xs text-brand-secondary">{order.route}</p>
              </div>
              <Link
                href={`/business/orders/${order.id}`}
                className="rounded-full bg-[#e8edf4] px-4 py-2 text-sm font-medium text-brand-foreground"
              >
                View Details
              </Link>
            </div>
          ))}
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

