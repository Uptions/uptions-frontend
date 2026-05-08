"use client"

import { BusinessShell } from "@/components/business/business-shell"

const poolOrders = [
  {
    name: "Order for Alex Harper",
    eta: "ETA: 2 hours 30 minutes",
    details: "Pickup: 123 Main St, Anytown | Delivery: 456 Oak Ave, Anytown | Weight: 2.3kg",
    amount: "₦2,100",
  },
  {
    name: "Order for Jordan Carter",
    eta: "ETA: 1 hour 45 minutes",
    details: "Pickup: 789 Pine Ln, Anytown | Delivery: 101 Elm Rd, Anytown | Weight: 4.3kg",
    amount: "₦7,100",
  },
  {
    name: "Order for Taylor Bennett",
    eta: "ETA: 3 hours 15 minutes",
    details: "Pickup: 222 Maple Dr, Anytown | Delivery: 333 Cedar Ct, Anytown | Weight: 2.3kg",
    amount: "₦4,100",
  },
  {
    name: "Order for Casey Morgan",
    eta: "ETA: 2 hours 5 minutes",
    details: "Pickup: 565 Birch St, Anytown | Delivery: 777 Spruce Ave, Anytown | Weight: 3kg",
    amount: "₦8,100",
  },
  {
    name: "Order for Jamie Lee",
    eta: "ETA: 1 hour 30 minutes",
    details: "Pickup: 888 Ash Blvd, Anytown | Delivery: 999 Willow Way, Anytown | Weight: 1.5kg",
    amount: "₦1,100",
  },
]

export default function BusinessOrderPoolPage() {
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
            className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-secondary px-5 text-sm font-medium text-white"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {poolOrders.map((order) => (
          <div
            key={order.name}
            className="flex items-center justify-between rounded-lg bg-[#eef3f9] px-4 py-3"
          >
            <div>
              <p className="font-semibold text-brand-foreground">{order.name}</p>
              <p className="text-sm text-brand-secondary">{order.eta}</p>
              <p className="text-xs text-brand-secondary">{order.details}</p>
              <p className="mt-0.5 text-xl font-semibold text-brand-secondary">{order.amount}</p>
            </div>
            <button
              type="button"
              className="rounded-full bg-[#dce4ee] px-5 py-2 text-sm font-medium text-brand-foreground"
            >
              Claim order
            </button>
          </div>
        ))}
      </div>
    </BusinessShell>
  )
}

