import { cookies } from "next/headers"

import { getBackendBaseUrl } from "@/lib/backend-base-url"
import { orderAccessCookieName, UPTIONS_FLOW_COOKIE } from "@/lib/checkout-flow-cookie"
import type { CheckoutFlowState } from "@/lib/checkout-flow-store"
import { isDeliveryQuoteResponse, type DeliveryQuoteRequest } from "@/lib/delivery-quotes"

type PersistedOrder = {
  _id?: string
  sessionId?: string
  sender?: DeliveryQuoteRequest["sender"]
  receiver?: DeliveryQuoteRequest["receiver"]
  package?: DeliveryQuoteRequest["package"]
  quoteSnapshot?: unknown
  selectedCompanyId?: string
  selectedCompanyName?: string
  subtotalNaira?: number
  serviceChargeNaira?: number
  totalNaira?: number
  paymentConfirmationWaitExpiresAt?: string | null
}

export async function loadCheckoutFlow(): Promise<CheckoutFlowState | null> {
  const jar = await cookies()
  const orderId = jar.get(UPTIONS_FLOW_COOKIE)?.value
  if (!orderId) return null
  const accessToken = jar.get(orderAccessCookieName(orderId))?.value
  if (!accessToken) return null

  const response = await fetch(`${getBackendBaseUrl()}/api/v1/orders/${orderId}`, {
    headers: { "x-order-access-token": accessToken },
    cache: "no-store",
  }).catch(() => null)
  if (!response?.ok) return null

  const order = (await response.json().catch(() => null)) as PersistedOrder | null
  if (
    !order ||
    !order.sender ||
    !order.receiver ||
    !order.package ||
    !isDeliveryQuoteResponse(order.quoteSnapshot)
  ) {
    return null
  }

  const selectedCourierId = typeof order.selectedCompanyId === "string" ? order.selectedCompanyId : null
  const selectedCourierName = typeof order.selectedCompanyName === "string" ? order.selectedCompanyName : null
  const paymentWaitMs = order.paymentConfirmationWaitExpiresAt
    ? Date.parse(order.paymentConfirmationWaitExpiresAt)
    : null

  return {
    orderId,
    orderSessionId: order.sessionId ?? "",
    request: { sender: order.sender, receiver: order.receiver, package: order.package },
    quote: order.quoteSnapshot,
    selectedCourierId,
    selectedCourierName,
    subtotalNaira: typeof order.subtotalNaira === "number" ? order.subtotalNaira : 0,
    serviceChargeNaira: typeof order.serviceChargeNaira === "number" ? order.serviceChargeNaira : 0,
    totalNaira: typeof order.totalNaira === "number" ? order.totalNaira : 0,
    paymentExpiresAt: null,
    paymentConfirmationWaitExpiresAt: Number.isFinite(paymentWaitMs) ? paymentWaitMs : null,
    transferDetails: null,
  }
}
