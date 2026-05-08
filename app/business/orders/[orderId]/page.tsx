"use client"

import { ChevronLeft, Clock3, Copy, Phone } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { BusinessShell } from "@/components/business/business-shell"

export default function BusinessOrderDetailsPage() {
  const params = useParams<{ orderId: string }>()
  const orderId = params.orderId?.toUpperCase() ?? "UPT2456"

  return (
    <BusinessShell activeNav="orders">
      <div className="mt-6">
        <p className="text-4xl font-bold text-brand-foreground">Order Details</p>
        <div className="mt-3 flex items-center gap-3">
          <Link href="/business/orders" className="text-brand-foreground">
            <ChevronLeft className="size-8" />
          </Link>
          <h1 className="text-5xl font-bold text-brand-foreground">Order #{orderId}</h1>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-brand-foreground">Sender Details</h2>
          <div className="mt-2 rounded-lg bg-[#edf2f8] p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-brand-foreground">Kosio Onyekweredike</p>
                <p className="text-sm text-brand-secondary">+234 81*** 4567</p>
              </div>
              <Phone className="size-4 text-brand-foreground" />
            </div>
          </div>
          <div className="mt-2 rounded-lg bg-[#edf2f8] p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-brand-foreground">Pickup Address</p>
                <p className="text-sm text-brand-secondary">123 Allen Avenue, Ikeja, Lagos</p>
              </div>
              <Copy className="size-4 text-brand-foreground" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-brand-foreground">Receiver Details</h2>
          <div className="mt-2 rounded-lg bg-[#edf2f8] p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-brand-foreground">Dumto Ejere</p>
                <p className="text-sm text-brand-secondary">+234 90*** 7890</p>
              </div>
              <Phone className="size-4 text-brand-foreground" />
            </div>
          </div>
          <div className="mt-2 rounded-lg bg-[#edf2f8] p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-brand-foreground">Delivery Address</p>
                <p className="text-sm text-brand-secondary">
                  456 Admiralty Way, Lekki Phase 1, Lagos
                </p>
              </div>
              <Copy className="size-4 text-brand-foreground" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-brand-foreground">Package & Pricing</h2>
          <div className="mt-2 grid grid-cols-2 gap-0 overflow-hidden rounded-lg border border-brand-foreground/10">
            <div className="bg-[#f5f8fc] p-3">
              <p className="text-sm text-brand-secondary">Package Type</p>
              <p className="font-semibold text-brand-foreground">Medium Box</p>
            </div>
            <div className="bg-[#f5f8fc] p-3">
              <p className="text-sm text-brand-secondary">Weight</p>
              <p className="font-semibold text-brand-foreground">3.5 kg</p>
            </div>
            <div className="border-t border-brand-foreground/10 bg-white p-3">
              <p className="text-sm text-brand-secondary">Base Fare</p>
              <p className="font-semibold text-brand-foreground">₦800</p>
            </div>
            <div className="border-t border-brand-foreground/10 bg-white p-3">
              <p className="text-sm text-brand-secondary">Distance Fee</p>
              <p className="font-semibold text-brand-foreground">₦700</p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between rounded-lg bg-[#edf2f8] px-4 py-3">
            <p className="text-xl font-semibold text-brand-foreground">Total Earning</p>
            <p className="text-xl font-semibold text-brand-foreground">₦1,500</p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-brand-foreground">Delivery Timeline</h2>
          <div className="mt-2 flex items-center justify-between rounded-lg bg-[#edf2f8] px-4 py-3">
            <div className="inline-flex items-center gap-2 text-brand-secondary">
              <Clock3 className="size-4" />
              59:40
            </div>
            <button
              type="button"
              className="rounded-full bg-brand-secondary px-4 py-2 text-sm font-medium text-white"
            >
              Reject order
            </button>
          </div>
        </div>
      </div>
    </BusinessShell>
  )
}

