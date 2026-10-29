"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LoaderCircle, MapPin, Minus } from "lucide-react"

import {
  readPaymentSuccess,
  writePaymentSuccess,
  type PaymentSuccessRecord,
} from "@/lib/payment-wait-storage"
export function PaymentWaitClient({
  sessionId,
  orderId,
  returnToken,
}: {
  sessionId: string
  orderId: string
  returnToken: string
}) {
  const router = useRouter()
  const [phase, setPhase] = React.useState<"init" | "checking" | "pending" | "success">("init")
  const [successData, setSuccessData] = React.useState<PaymentSuccessRecord | null>(null)
  const navigationDoneRef = React.useRef(false)

  React.useEffect(() => {
    queueMicrotask(() => {
      const existingSuccess = readPaymentSuccess(sessionId)
      if (existingSuccess) {
        setSuccessData(existingSuccess)
        setPhase("success")
        return
      }

      setPhase("checking")
    })
  }, [sessionId])

  React.useEffect(() => {
    if (phase !== "checking") return
    const id = window.setTimeout(() => setPhase("pending"), 8_000)
    return () => window.clearTimeout(id)
  }, [phase])

  React.useEffect(() => {
    if (phase !== "checking" && phase !== "pending") return

    const poll = async () => {
      if (navigationDoneRef.current) return
      try {
        const query = new URLSearchParams({ orderId })
        if (returnToken) query.set("returnToken", returnToken)
        const res = await fetch(`/api/order-status?${query.toString()}`, {
          cache: "no-store",
        })
        const raw: unknown = await res.json().catch(() => null)
        if (!res.ok || !raw || typeof raw !== "object") return
        const status =
          "status" in raw && typeof (raw as { status?: unknown }).status === "string"
            ? (raw as { status: string }).status
            : null

        if (status === "payment_confirmed") {
          const deliveryNumber =
            "deliveryNumber" in raw &&
            typeof (raw as { deliveryNumber?: unknown }).deliveryNumber === "string"
              ? (raw as { deliveryNumber: string }).deliveryNumber
              : "UPT000000"
          const pickupCode =
            "pickupCode" in raw &&
            typeof (raw as { pickupCode?: unknown }).pickupCode === "string"
              ? (raw as { pickupCode: string }).pickupCode
              : "000-000"
          const payload: PaymentSuccessRecord = { deliveryNumber, pickupCode }
          writePaymentSuccess(sessionId, payload)
          setSuccessData(payload)
          setPhase("success")
          return
        }

        if (status === "payment_rejected" || status === "cancelled") {
          navigationDoneRef.current = true
          router.replace("/checkout/payment/failed")
        }
      } catch {
        // Network hiccup; next poll or websocket can still resolve state.
      }
    }

    void poll()
    const id = window.setInterval(() => {
      void poll()
    }, phase === "checking" ? 2_000 : 10_000)
    return () => window.clearInterval(id)
  }, [phase, orderId, returnToken, router, sessionId])

  if (phase === "init") {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-md items-center justify-center px-4">
        <p className="text-center text-brand-foreground">Loading…</p>
      </div>
    )
  }

  if (phase === "success" && successData) {
    return (
      <div className="mx-auto w-full max-w-md px-4 pb-20 pt-12 md:pt-16">
        <div className="rounded-2xl bg-white p-8 shadow-[0_12px_40px_-16px_rgba(0,27,108,0.2)] md:p-10">
          <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-brand-secondary text-white md:size-16">
            <Minus className="size-8 stroke-[3]" aria-hidden />
          </div>
          <h1 className="mt-6 text-center text-xl font-bold text-brand-foreground md:text-2xl">
            Payment Received!
          </h1>
          <p className="mt-3 text-center text-brand-foreground">
            Your delivery has been confirmed.
          </p>
          <div className="mt-8 space-y-3 text-center text-sm md:text-base">
            <p className="text-brand-foreground">
              Delivery No:{" "}
              <span className="font-semibold text-brand-secondary">
                #
                {successData.deliveryNumber.replace(/^#/, "")}
              </span>
            </p>
            <p className="text-brand-foreground">
              Pickup Code:{" "}
              <span className="font-semibold text-brand-secondary">
                {successData.pickupCode}
              </span>
            </p>
          </div>
          <p className="mt-8 text-center text-sm text-brand-foreground/90">
            Sit back, we&apos;re getting things moving!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-20 pt-12 md:pt-16">
      <div className="rounded-2xl bg-white p-8 shadow-[0_12px_40px_-16px_rgba(0,27,108,0.2)] md:p-10">
        <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-brand-secondary text-white md:size-16">
          {phase === "checking" ? <LoaderCircle className="size-7 animate-spin md:size-8" aria-hidden /> : <MapPin className="size-7 md:size-8" aria-hidden />}
        </div>
        <h1 className="mt-6 text-center text-xl font-bold text-brand-foreground md:text-2xl">
          {phase === "checking" ? "Checking your payment" : "Bank transfer pending"}
        </h1>
        <p className="mt-3 text-center text-brand-foreground">
          {phase === "checking"
            ? "We’re securely checking Bachs for your payment confirmation."
            : "Your transfer has not been confirmed yet. We’ll update this page automatically as soon as Bachs verifies it."}
        </p>
        {phase === "pending" ? <p className="mt-6 text-center text-sm text-brand-foreground/75">You can keep this page open while we check again.</p> : null}
      </div>
    </div>
  )
}
