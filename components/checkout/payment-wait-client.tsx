"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MapPin, Minus } from "lucide-react"

import { usePaymentConfirmationSocket } from "@/hooks/use-payment-confirmation-socket"
import {
  readPaymentSuccess,
  readPaymentWait,
  writePaymentSuccess,
  writePaymentWait,
  type PaymentSuccessRecord,
} from "@/lib/payment-wait-storage"
import { cn } from "@/lib/utils"

function formatMmSs(totalSeconds: number): string {
  const m = Math.floor(Math.max(0, totalSeconds) / 60)
  const s = Math.max(0, totalSeconds) % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function PaymentWaitClient({
  sessionId,
  serverWaitExpiresAt,
}: {
  sessionId: string
  serverWaitExpiresAt: number | null
}) {
  const router = useRouter()
  const [phase, setPhase] = React.useState<"init" | "waiting" | "success">("init")
  const [expiresAt, setExpiresAt] = React.useState<number | null>(null)
  const [successData, setSuccessData] = React.useState<PaymentSuccessRecord | null>(null)
  const [displaySeconds, setDisplaySeconds] = React.useState(0)
  const expiredRef = React.useRef(false)

  React.useEffect(() => {
    expiredRef.current = false
  }, [sessionId])

  React.useEffect(() => {
    queueMicrotask(() => {
      const existingSuccess = readPaymentSuccess(sessionId)
      if (existingSuccess) {
        setSuccessData(existingSuccess)
        setPhase("success")
        return
      }

      const stored = readPaymentWait(sessionId)
      const deadline = stored?.expiresAt ?? serverWaitExpiresAt

      if (!deadline) {
        router.replace("/checkout/payment/failed")
        return
      }

      if (!stored && serverWaitExpiresAt) {
        writePaymentWait(sessionId, serverWaitExpiresAt)
      }

      setExpiresAt(deadline)
      setDisplaySeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)))
      setPhase("waiting")
    })
  }, [sessionId, serverWaitExpiresAt, router])

  React.useEffect(() => {
    if (phase !== "waiting" || !expiresAt) return

    const tick = () => {
      const left = Math.ceil((expiresAt - Date.now()) / 1000)
      setDisplaySeconds(left)
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true
        router.replace("/checkout/payment/failed")
      }
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [phase, expiresAt, router])

  usePaymentConfirmationSocket(phase === "waiting" ? sessionId : null, (msg) => {
    if (msg.type === "rejected") {
      router.replace("/checkout/payment/failed")
      return
    }
    const payload: PaymentSuccessRecord = {
      deliveryNumber: msg.deliveryNumber,
      pickupCode: msg.pickupCode,
    }
    writePaymentSuccess(sessionId, payload)
    setSuccessData(payload)
    setPhase("success")
  })

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
          <MapPin className="size-7 md:size-8" aria-hidden />
        </div>
        <h1 className="mt-6 text-center text-xl font-bold text-brand-foreground md:text-2xl">
          We are checking
        </h1>
        <p className="mt-3 text-center text-brand-foreground">
          Please wait, while we confirm your payment
        </p>
        <p
          className={cn(
            "mt-8 text-center text-lg font-bold tabular-nums text-brand-secondary md:text-xl",
          )}
          aria-live="polite"
        >
          In {formatMmSs(displaySeconds)}
        </p>
      </div>
    </div>
  )
}
