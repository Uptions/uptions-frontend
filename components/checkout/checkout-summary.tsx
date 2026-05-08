import type { ReactNode } from "react"
import Link from "next/link"

import { proceedToBankTransferAction } from "@/app/actions/checkout-flow-actions"
import type { CheckoutFlowState } from "@/lib/checkout-flow-store"
import { formatNaira } from "@/lib/delivery-quotes"
import { cn } from "@/lib/utils"

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-wide text-brand-secondary uppercase">
      {children}
    </p>
  )
}

function DetailLine({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: ReactNode
  valueClassName?: string
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-brand-foreground/70">{label}</p>
      <p className={cn("text-sm text-brand-foreground", valueClassName)}>{value}</p>
    </div>
  )
}

export function CheckoutSummary({ flow }: { flow: CheckoutFlowState }) {
  const { sender, receiver, package: pkg } = flow.request
  const provider = flow.selectedCourierName ?? "—"

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-8 md:px-6 md:pb-24 md:pt-12">
      <h1 className="font-heading text-4xl font-bold text-brand-secondary md:text-5xl">
        Checkout
      </h1>

      <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-12">
        <div className="space-y-8">
          <section className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <SectionLabel>Shipping details: Sender</SectionLabel>
              <Link
                href="/find-an-uption"
                className="text-sm font-medium text-brand-secondary hover:underline"
              >
                Edit
              </Link>
            </div>
            <div className="space-y-3 rounded-xl border border-brand-secondary/30 bg-white/80 p-4 md:p-5">
              <DetailLine label="Name" value={sender.name} />
              <DetailLine label="Address" value={sender.address} />
              <DetailLine label="Phone number" value={sender.phone} />
              <DetailLine label="Email" value={sender.email} />
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <SectionLabel>Shipping details: Receiver</SectionLabel>
              <Link
                href="/find-an-uption"
                className="text-sm font-medium text-brand-secondary hover:underline"
              >
                Edit
              </Link>
            </div>
            <div className="space-y-3 rounded-xl border border-brand-secondary/30 bg-white/80 p-4 md:p-5">
              <DetailLine label="Name" value={receiver.name} />
              <DetailLine label="Address" value={receiver.address} />
              <DetailLine label="Phone number" value={receiver.phone} />
              <DetailLine label="Email" value={receiver.email} />
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <SectionLabel>Shipping details: Package</SectionLabel>
              <Link
                href="/find-an-uption"
                className="text-sm font-medium text-brand-secondary hover:underline"
              >
                Change
              </Link>
            </div>
            <div className="space-y-3 rounded-xl border border-brand-secondary/30 bg-white/80 p-4 md:p-5">
              <DetailLine
                label="Delivery provider"
                value={provider}
                valueClassName="font-semibold text-brand-secondary"
              />
              <DetailLine label="Value" value={formatNaira(pkg.valueNaira)} />
              <DetailLine label="Vehicle type" value={pkg.vehicleType} />
              <DetailLine label="Weight" value={pkg.weightClass} />
              <DetailLine
                label="Package description"
                value={pkg.description?.trim() ? pkg.description : "—"}
              />
              <DetailLine
                label="Additional instruction"
                value={
                  pkg.additionalInstruction?.trim() ? pkg.additionalInstruction : "—"
                }
              />
            </div>
          </section>

          <section className="space-y-3">
            <SectionLabel>Payment details</SectionLabel>
            <div className="space-y-3 rounded-xl border border-brand-secondary/30 bg-white/80 p-4 md:p-5">
              <div className="flex justify-between text-sm text-brand-foreground">
                <span>Subtotal</span>
                <span>{formatNaira(flow.subtotalNaira)}</span>
              </div>
              <div className="flex justify-between text-sm text-brand-foreground">
                <span>Service charge</span>
                <span>{formatNaira(flow.serviceChargeNaira)}</span>
              </div>
              <div className="flex justify-between border-t border-brand-secondary/20 pt-3 text-base font-bold">
                <span className="text-brand-foreground">Total</span>
                <span className="text-brand-secondary">{formatNaira(flow.totalNaira)}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <form action={proceedToBankTransferAction} className="mt-12 flex justify-center">
        <button
          type="submit"
          className="flex h-12 w-full max-w-md items-center justify-center gap-1 rounded-lg bg-brand-secondary px-6 font-poppins text-base font-semibold text-white transition-colors hover:bg-brand-secondary/90"
        >
          Checkout
          <span aria-hidden>{">"}</span>
        </button>
      </form>
    </div>
  )
}
