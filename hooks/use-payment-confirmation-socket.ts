"use client"

import * as React from "react"

export type PaymentSocketMessage =
  | { type: "approved"; deliveryNumber: string; pickupCode: string }
  | { type: "rejected"; reason?: string }

function parseMessage(raw: unknown): PaymentSocketMessage | null {
  if (typeof raw !== "string") return null
  try {
    const o = JSON.parse(raw) as { type?: string; deliveryNumber?: string; pickupCode?: string }
    if (o.type === "approved" && typeof o.deliveryNumber === "string" && typeof o.pickupCode === "string") {
      return { type: "approved", deliveryNumber: o.deliveryNumber, pickupCode: o.pickupCode }
    }
    if (o.type === "rejected") {
      return { type: "rejected" }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Subscribes to admin payment decisions over WebSocket.
 * Set `NEXT_PUBLIC_PAYMENT_WS_URL` to a base such as `wss://your-api.com/ws/payments`
 * (the hook appends `/${sessionId}`). Until the backend exists, the hook is a no-op
 * and only the countdown + refresh persistence apply.
 */
export function usePaymentConfirmationSocket(
  sessionId: string | null,
  onMessage: (msg: PaymentSocketMessage) => void,
) {
  const onMessageRef = React.useRef(onMessage)

  React.useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  React.useEffect(() => {
    if (!sessionId) return
    const base = process.env.NEXT_PUBLIC_PAYMENT_WS_URL?.replace(/\/$/, "")
    if (!base) {
      if (process.env.NODE_ENV === "development") {
        console.info(
          "[Uptions] NEXT_PUBLIC_PAYMENT_WS_URL is unset; payment approval WebSocket disabled.",
        )
      }
      return
    }

    const url = `${base}/${encodeURIComponent(sessionId)}`
    let ws: WebSocket
    try {
      ws = new WebSocket(url)
    } catch {
      return
    }

    ws.onmessage = (ev) => {
      const msg = parseMessage(ev.data)
      if (msg) onMessageRef.current(msg)
    }

    ws.onerror = () => {
      /* backend may be down; timer / manual refresh still apply */
    }

    return () => {
      try {
        ws.close()
      } catch {
        /* ignore */
      }
    }
  }, [sessionId])
}
