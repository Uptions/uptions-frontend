"use client"

import * as React from "react"
import { useFormState, useFormStatus } from "react-dom"
import { ChevronRight } from "lucide-react"

import { selectCourierAndCheckoutAction } from "@/app/actions/checkout-flow-actions"
import type { DeliveryQuoteResponse } from "@/lib/delivery-quotes"
import { cn } from "@/lib/utils"

import { CourierCard } from "./courier-card"

function ProceedButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className={cn(
        "mx-auto flex h-12 w-full max-w-md items-center justify-center gap-1 rounded-lg px-6 font-poppins text-base font-semibold transition-colors",
        "disabled:cursor-not-allowed disabled:bg-[#D1D5DB] disabled:text-white disabled:opacity-100 disabled:hover:bg-[#D1D5DB]",
        "enabled:bg-brand-secondary enabled:text-brand-white enabled:hover:bg-brand-secondary/90",
      )}
    >
      {pending ? "Continuing…" : "Proceed"}
      {!pending ? <ChevronRight className="size-5" aria-hidden /> : null}
    </button>
  )
}

export function PickAnUptionView({
  quote,
}: {
  quote: DeliveryQuoteResponse
}) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [formState, formAction] = useFormState(selectCourierAndCheckoutAction, undefined)

  const canProceed = Boolean(selectedId)
  const count = quote.couriers.length

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 md:space-y-8">
      <header className="text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
          <span className="text-brand-secondary">Pick an </span>
          <span className="text-brand-primary">Uption</span>
        </h1>
        <p className="mt-3 text-base font-bold text-brand-foreground md:text-lg">
          {count} Courier{count === 1 ? "" : "s"} found from your address
        </p>
        <p className="mt-2 text-sm text-brand-foreground md:text-base">
          Delivery Estimated time:{" "}
          <span className="font-semibold text-brand-secondary">
            {quote.estimatedMinutes} minutes
          </span>
        </p>
      </header>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="courierId" value={selectedId ?? ""} />

        <div
          className="space-y-4"
          role="radiogroup"
          aria-label="Choose a courier"
        >
          {quote.couriers.map((c) => (
            <CourierCard
              key={c.id}
              courier={c}
              selected={selectedId === c.id}
              onSelect={setSelectedId}
            />
          ))}
        </div>

        {formState?.error ? (
          <p className="text-center text-sm text-red-600" role="alert">
            {formState.error}
          </p>
        ) : null}

        <div className="flex justify-center pt-2">
          <ProceedButton disabled={!canProceed} />
        </div>
      </form>
    </div>
  )
}
