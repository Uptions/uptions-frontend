/** Client-only: admin confirmation window deadline (persists across refresh). */

export type PaymentWaitRecord = {
  expiresAt: number
}

export function paymentWaitStorageKey(sessionId: string): string {
  return `uptions:paymentWait:v1:${sessionId}`
}

export function paymentSuccessStorageKey(sessionId: string): string {
  return `uptions:paymentSuccess:v1:${sessionId}`
}

export function readPaymentWait(sessionId: string): PaymentWaitRecord | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(paymentWaitStorageKey(sessionId))
    if (!raw) return null
    const o = JSON.parse(raw) as PaymentWaitRecord
    if (typeof o.expiresAt !== "number" || !Number.isFinite(o.expiresAt)) return null
    return o
  } catch {
    return null
  }
}

export function writePaymentWait(sessionId: string, expiresAt: number): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(
      paymentWaitStorageKey(sessionId),
      JSON.stringify({ expiresAt } satisfies PaymentWaitRecord),
    )
  } catch {
    /* ignore */
  }
}

export type PaymentSuccessRecord = {
  deliveryNumber: string
  pickupCode: string
}

export function readPaymentSuccess(sessionId: string): PaymentSuccessRecord | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(paymentSuccessStorageKey(sessionId))
    if (!raw) return null
    const o = JSON.parse(raw) as PaymentSuccessRecord
    if (typeof o.deliveryNumber !== "string" || typeof o.pickupCode !== "string") return null
    return o
  } catch {
    return null
  }
}

export function writePaymentSuccess(sessionId: string, data: PaymentSuccessRecord): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(paymentSuccessStorageKey(sessionId), JSON.stringify(data))
  } catch {
    /* ignore */
  }
}
