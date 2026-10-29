"use client"

import * as React from "react"

import { cancelOrderAction } from "@/app/actions/checkout-flow-actions"

export function CancelOrderButton() {
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()

  function confirmCancellation() {
    setError(null)
    startTransition(async () => {
      const result = await cancelOrderAction()
      if (result?.error) setError(result.error)
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-semibold text-red-600 transition-colors hover:text-red-700 hover:underline"
      >
        Cancel order
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-order-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 id="cancel-order-title" className="font-heading text-2xl font-bold text-brand-primary">
              Cancel this order?
            </h2>
            <p className="mt-2 text-sm leading-6 text-brand-foreground/75">
              Your selected delivery option will be released. You can start a new delivery request whenever you are ready.
            </p>
            {error ? <p className="mt-4 text-sm text-red-600" role="alert">{error}</p> : null}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={pending}
                onClick={() => { setOpen(false); setError(null) }}
                className="rounded-lg border border-brand-secondary/30 px-4 py-2 text-sm font-semibold text-brand-primary disabled:opacity-60"
              >
                Keep order
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={confirmCancellation}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {pending ? "Cancelling…" : "Yes, cancel order"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
