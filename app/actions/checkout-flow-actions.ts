"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { getBackendBaseUrl } from "@/lib/backend-base-url"
import {
  createFlowState,
  getFlow,
  setFlow,
  type CheckoutFlowState,
} from "@/lib/checkout-flow-store"
import { UPTIONS_FLOW_COOKIE, flowCookieOptions } from "@/lib/checkout-flow-cookie"
import { isDeliveryQuoteResponse, type DeliveryQuoteRequest } from "@/lib/delivery-quotes"

async function getFlowIdFromCookie(): Promise<string | null> {
  const jar = await cookies()
  return jar.get(UPTIONS_FLOW_COOKIE)?.value ?? null
}

function getErrorMessage(raw: unknown, fallback: string): string {
  return raw &&
    typeof raw === "object" &&
    "message" in raw &&
    typeof (raw as { message: unknown }).message === "string"
    ? (raw as { message: string }).message
    : raw &&
          typeof raw === "object" &&
          "error" in raw &&
          typeof (raw as { error: unknown }).error === "string"
      ? (raw as { error: string }).error
      : fallback
}

function toMsIfDateLike(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value !== "string") return null
  const ms = Date.parse(value)
  return Number.isFinite(ms) ? ms : null
}

/**
 * Server-only: the browser never talks to Nest directly.
 * Submit quote request, then create order-intent immediately.
 */
export async function submitFindUptionFormAction(
  payload: DeliveryQuoteRequest,
): Promise<{ error: string } | undefined> {
  const baseUrl = getBackendBaseUrl()

  const quoteRes = await fetch(`${baseUrl}/api/v1/quotes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  })

  const quoteRaw: unknown = await quoteRes.json().catch(() => null)
  if (!quoteRes.ok) {
    return {
      error: getErrorMessage(quoteRaw, "Could not fetch courier options. Try again."),
    }
  }

  if (!isDeliveryQuoteResponse(quoteRaw)) {
    return { error: "Unexpected response from server. Try again." }
  }

  // Order-intent is saved right after estimate is returned.
  const orderRes = await fetch(`${baseUrl}/api/v1/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  })
  const orderRaw: unknown = await orderRes.json().catch(() => null)
  if (!orderRes.ok) {
    return {
      error: getErrorMessage(orderRaw, "Could not create order intent. Try again."),
    }
  }
  if (
    !orderRaw ||
    typeof orderRaw !== "object" ||
    typeof (orderRaw as { orderId?: unknown }).orderId !== "string" ||
    typeof (orderRaw as { sessionId?: unknown }).sessionId !== "string"
  ) {
    return { error: "Unexpected order-intent response from server." }
  }

  const flowId = crypto.randomUUID()
  const state = createFlowState(
    (orderRaw as { orderId: string }).orderId,
    (orderRaw as { sessionId: string }).sessionId,
    payload,
    quoteRaw,
  )
  setFlow(flowId, state)

  const jar = await cookies()
  jar.set(UPTIONS_FLOW_COOKIE, flowId, flowCookieOptions)

  redirect("/pick-an-uption")
}

export async function selectCourierAndCheckoutAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string } | undefined> {
  const courierId = formData.get("courierId")
  if (typeof courierId !== "string" || !courierId) {
    return { error: "Choose a courier to continue." }
  }

  const flowId = await getFlowIdFromCookie()
  if (!flowId) {
    return { error: "Session expired. Start again from the form." }
  }

  const flow = getFlow(flowId)
  if (!flow) {
    return { error: "Session expired. Start again from the form." }
  }

  const courier = flow.quote.couriers.find((c) => c.id === courierId)
  if (!courier) {
    return { error: "Invalid courier selection." }
  }

  const baseUrl = getBackendBaseUrl()
  const res = await fetch(`${baseUrl}/api/v1/orders/${flow.orderId}/select-courier`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courierId }),
    cache: "no-store",
  })
  const raw: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    return {
      error: getErrorMessage(raw, "Could not save courier selection."),
    }
  }

  const totals =
    raw && typeof raw === "object" && "totals" in raw
      ? (raw as { totals?: { subtotalNaira?: number; serviceChargeNaira?: number; totalNaira?: number } })
          .totals
      : undefined

  const next: CheckoutFlowState = {
    ...flow,
    selectedCourierId: courier.id,
    selectedCourierName: courier.name,
    subtotalNaira:
      typeof totals?.subtotalNaira === "number" ? totals.subtotalNaira : flow.subtotalNaira,
    serviceChargeNaira:
      typeof totals?.serviceChargeNaira === "number"
        ? totals.serviceChargeNaira
        : flow.serviceChargeNaira,
    totalNaira: typeof totals?.totalNaira === "number" ? totals.totalNaira : flow.totalNaira,
  }
  setFlow(flowId, next)
  redirect("/checkout")
}

export async function proceedToBankTransferAction(): Promise<void> {
  const flowId = await getFlowIdFromCookie()
  if (!flowId) {
    redirect("/find-an-uption")
  }
  const flow = getFlow(flowId)
  if (!flow?.selectedCourierId) {
    redirect("/pick-an-uption")
  }

  const baseUrl = getBackendBaseUrl()
  const res = await fetch(`${baseUrl}/api/v1/orders/${flow.orderId}/checkout`, {
    method: "POST",
    cache: "no-store",
  })
  const raw: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    redirect("/checkout")
  }

  const transfer =
    raw && typeof raw === "object" && "transferDetails" in raw
      ? (raw as { transferDetails?: { bankName?: string; accountNumber?: string; amountNaira?: number } })
          .transferDetails
      : undefined
  const paymentExpiresAt = toMsIfDateLike(
    raw &&
      typeof raw === "object" &&
      "paymentConfirmationWaitExpiresAt" in raw
      ? (raw as { paymentConfirmationWaitExpiresAt?: unknown }).paymentConfirmationWaitExpiresAt
      : null,
  )

  const next: CheckoutFlowState = {
    ...flow,
    paymentExpiresAt: paymentExpiresAt ?? Date.now() + 10 * 60 * 1000,
    transferDetails:
      transfer &&
      typeof transfer.bankName === "string" &&
      typeof transfer.accountNumber === "string" &&
      typeof transfer.amountNaira === "number"
        ? {
            bankName: transfer.bankName,
            accountNumber: transfer.accountNumber,
            amountNaira: transfer.amountNaira,
          }
        : flow.transferDetails,
  }
  setFlow(flowId, next)
  redirect("/checkout/payment")
}

const ADMIN_CONFIRMATION_WINDOW_MS = 10 * 60 * 1000

export async function acknowledgeBankTransferAction(): Promise<void> {
  const flowId = await getFlowIdFromCookie()
  if (!flowId) {
    redirect("/find-an-uption")
  }
  const flow = getFlow(flowId)
  if (!flow?.paymentExpiresAt) {
    redirect("/checkout")
  }

  const baseUrl = getBackendBaseUrl()
  // Payment user acknowledgement to backend before entering wait state.
  await fetch(`${baseUrl}/api/v1/orders/${flow.orderId}/confirm-payment`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
    cache: "no-store",
  }).catch(() => null)

  const waitUntil = Date.now() + ADMIN_CONFIRMATION_WINDOW_MS
  setFlow(flowId, {
    ...flow,
    paymentConfirmationWaitExpiresAt: waitUntil,
  })

  redirect(`/checkout/payment/waiting?sid=${encodeURIComponent(flowId)}`)
}
