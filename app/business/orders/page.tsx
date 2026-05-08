"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { BusinessShell } from "@/components/business/business-shell"

type OrderTab = "new" | "pending" | "completed"

const orders = {
  new: [
    {
      id: "UPT2456",
      title: "Order for Alex Harper",
      eta: "ETA: 2 hours 30 minutes",
      route: "Pickup: 123 Main St, Anytown | Delivery: 456 Oak Ave, Anytown",
      timer: "15:00",
    },
    {
      id: "UPT2457",
      title: "Order for Jordan Carter",
      eta: "ETA: 1 hour 45 minutes",
      route: "Pickup: 789 Pine Ln, Anytown | Delivery: 101 Elm Rd, Anytown",
      timer: "30:00",
    },
  ],
  pending: [
    {
      id: "UPT2458",
      title: "Order for Taylor Bennett",
      eta: "ETA: 3 hours 15 minutes",
      route: "Pickup: 222 Maple Dr, Anytown | Delivery: 333 Cedar Ct, Anytown",
      timer: "15:00",
    },
    {
      id: "UPT2459",
      title: "Order for Casey Morgan",
      eta: "ETA: 2 hours 5 minutes",
      route: "Pickup: 565 Birch St, Anytown | Delivery: 777 Spruce Ave, Anytown",
      timer: "30:00",
    },
    {
      id: "UPT2460",
      title: "Order for Jamie Lee",
      eta: "ETA: 1 hour 30 minutes",
      route: "Pickup: 888 Ash Blvd, Anytown | Delivery: 999 Willow Way, Anytown",
      timer: "30:00",
    },
  ],
  completed: [
    {
      id: "UPT2411",
      title: "Order for Vera James",
      eta: "Delivered",
      route: "Pickup: 14 Marina Rd, Lagos | Delivery: 90 Allen Ave, Lagos",
      timer: "Done",
    },
    {
      id: "UPT2412",
      title: "Order for Caleb Stone",
      eta: "Delivered",
      route: "Pickup: 11 Broad St, Lagos | Delivery: 24 Admiralty Way, Lagos",
      timer: "Done",
    },
  ],
} as const

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

export default function BusinessOrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderTab>("pending")
  const activeOrders = useMemo(() => orders[activeTab], [activeTab])

  return (
    <BusinessShell activeNav="orders">
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
        <StatCard title="New Orders" value="2" />
        <StatCard title="In Progress" value="1" />
        <StatCard title="Earnings Today" value="N35,000.00" />
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center gap-8 border-b border-brand-foreground/15 pb-2 text-sm font-semibold text-brand-secondary">
          {tabLabels.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={activeTab === tab.key ? "text-brand-foreground" : ""}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {activeOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-lg border border-brand-foreground/10 bg-white/75 p-3"
            >
              <div>
                <p className="font-semibold text-brand-foreground">{order.title}</p>
                <p className="text-sm text-brand-secondary">{order.eta}</p>
                <p className="text-xs text-brand-secondary">{order.route}</p>
              </div>
              <div className="flex items-center gap-8">
                <span className="text-sm font-medium text-brand-secondary">{order.timer}</span>
                <Link
                  href={`/business/orders/${order.id}`}
                  className="rounded-full bg-[#e8edf4] px-4 py-2 text-sm font-medium text-brand-foreground"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BusinessShell>
  )
}

