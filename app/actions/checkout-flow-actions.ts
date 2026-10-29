"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { getBackendBaseUrl } from "@/lib/backend-base-url"
import { orderAccessCookieName, UPTIONS_FLOW_COOKIE, flowCookieOptions } from "@/lib/checkout-flow-cookie"
import { isDeliveryQuoteResponse, type DeliveryQuoteRequest } from "@/lib/delivery-quotes"
import { loadCheckoutFlow } from "@/lib/load-checkout-flow"

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

  // The backend calculates and persists the quote with the order intent.
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

  const persistedQuote = (orderRaw as { quote?: unknown }).quote
  if (!isDeliveryQuoteResponse(persistedQuote)) {
    return { error: "Unexpected saved quote response from server." }
  }

  const orderAccessToken = (orderRaw as { guestAccessToken?: unknown }).guestAccessToken
  if (typeof orderAccessToken !== "string" || !orderAccessToken) {
    return { error: "Could not secure this order. Try again." }
  }

  const jar = await cookies()
  const orderId = (orderRaw as { orderId: string }).orderId
  jar.set(UPTIONS_FLOW_COOKIE, orderId, flowCookieOptions)
  jar.set(orderAccessCookieName(orderId), orderAccessToken, flowCookieOptions)

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

  const flow = await loadCheckoutFlow()
  if (!flow) {
    return { error: "Session expired. Start again from the form." }
  }

  const courier = flow.quote.couriers.find((c) => c.id === courierId)
  if (!courier) {
    return { error: "Invalid courier selection." }
  }

  const baseUrl = getBackendBaseUrl()
  const jar = await cookies()
  const orderAccessToken = jar.get(orderAccessCookieName(flow.orderId))?.value
  if (!orderAccessToken) return { error: "Order access expired. Start again." }
  const res = await fetch(`${baseUrl}/api/v1/orders/${flow.orderId}/select-courier`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-order-access-token": orderAccessToken },
    body: JSON.stringify({ courierId }),
    cache: "no-store",
  })
  const raw: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    return {
      error: getErrorMessage(raw, "Could not save courier selection."),
    }
  }

  redirect("/checkout")
}

export async function updateOrderPartyAction(
  party: "sender" | "receiver",
  details: DeliveryQuoteRequest["sender"],
): Promise<{ error: string } | undefined> {
  const flow = await loadCheckoutFlow()
  if (!flow) return { error: "Session expired. Start again from the form." }

  const jar = await cookies()
  const orderAccessToken = jar.get(orderAccessCookieName(flow.orderId))?.value
  if (!orderAccessToken) return { error: "Order access expired. Start again." }

  const response = await fetch(`${getBackendBaseUrl()}/api/v1/orders/${flow.orderId}/party`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-order-access-token": orderAccessToken,
    },
    body: JSON.stringify({ party, details }),
    cache: "no-store",
  })
  const raw: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    return { error: getErrorMessage(raw, "Could not update delivery details.") }
  }

  // Address/state changes produce a fresh server-side quote, so require a
  // new courier choice rather than reusing a potentially ineligible option.
  redirect("/pick-an-uption")
}

export async function cancelOrderAction(): Promise<{ error: string } | undefined> {
  const flow = await loadCheckoutFlow()
  if (!flow) return { error: "Session expired. Start again from the form." }

  const jar = await cookies()
  const accessCookie = orderAccessCookieName(flow.orderId)
  const orderAccessToken = jar.get(accessCookie)?.value
  if (!orderAccessToken) return { error: "Order access expired. Start again." }

  const response = await fetch(`${getBackendBaseUrl()}/api/v1/orders/${flow.orderId}/cancel`, {
    method: "PATCH",
    headers: { "x-order-access-token": orderAccessToken },
    cache: "no-store",
  })
  const raw: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    return { error: getErrorMessage(raw, "Could not cancel this order.") }
  }

  jar.delete(UPTIONS_FLOW_COOKIE)
  jar.delete(accessCookie)
  redirect("/find-an-uption")
}

export async function proceedToBankTransferAction(): Promise<void> {
  const flow = await loadCheckoutFlow()
  if (!flow?.selectedCourierId) {
    redirect("/pick-an-uption")
  }

  const baseUrl = getBackendBaseUrl()
  const jar = await cookies()
  const orderAccessToken = jar.get(orderAccessCookieName(flow.orderId))?.value
  if (!orderAccessToken) redirect("/find-an-uption")
  const res = await fetch(`${baseUrl}/api/v1/orders/${flow.orderId}/checkout`, {
    method: "POST",
    headers: { "x-order-access-token": orderAccessToken },
    cache: "no-store",
  })
  const raw: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    redirect("/checkout")
  }

  const checkoutUrl = raw && typeof raw === "object" && "checkoutUrl" in raw ? (raw as { checkoutUrl?: unknown }).checkoutUrl : null
  if (typeof checkoutUrl !== "string") redirect("/checkout")
  redirect(checkoutUrl)
}

export async function acknowledgeBankTransferAction(): Promise<void> {
  const flow = await loadCheckoutFlow()
  if (!flow?.selectedCourierId) {
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

  redirect(`/checkout/payment/waiting?orderId=${encodeURIComponent(flow.orderId)}`)
}
