"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import {
  createFlowState,
  getFlow,
  setFlow,
  type CheckoutFlowState,
} from "@/lib/checkout-flow-store"
import { UPTIONS_FLOW_COOKIE, flowCookieOptions } from "@/lib/checkout-flow-cookie"
import { isDeliveryQuoteResponse, type DeliveryQuoteRequest } from "@/lib/delivery-quotes"
import { getServerOrigin } from "@/lib/server-origin"

async function getFlowIdFromCookie(): Promise<string | null> {
  const jar = await cookies()
  return jar.get(UPTIONS_FLOW_COOKIE)?.value ?? null
}

/**
 * Server-only: calls the internal Route Handler (stand-in for new-uptions-backend).
 * The browser never talks to your Nest API directly.
 */
export async function submitFindUptionFormAction(
  payload: DeliveryQuoteRequest,
): Promise<{ error: string } | undefined> {
  const res = await fetch(`${getServerOrigin()}/api/delivery-quotes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  })

  const raw: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    const msg =
      raw &&
      typeof raw === "object" &&
      "error" in raw &&
      typeof (raw as { error: unknown }).error === "string"
        ? (raw as { error: string }).error
        : "Could not fetch courier options. Try again."
    return { error: msg }
  }

  if (!isDeliveryQuoteResponse(raw)) {
    return { error: "Unexpected response from server. Try again." }
  }

  const flowId = crypto.randomUUID()
  const state = createFlowState(payload, raw)
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

  const subtotal = flow.request.package.valueNaira
  const service = 500
  const next: CheckoutFlowState = {
    ...flow,
    selectedCourierId: courier.id,
    selectedCourierName: courier.name,
    subtotalNaira: subtotal,
    serviceChargeNaira: service,
    totalNaira: subtotal + service,
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

  const next: CheckoutFlowState = {
    ...flow,
    paymentExpiresAt: Date.now() + 10 * 60 * 1000,
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

  const waitUntil = Date.now() + ADMIN_CONFIRMATION_WINDOW_MS
  setFlow(flowId, {
    ...flow,
    paymentConfirmationWaitExpiresAt: waitUntil,
  })

  redirect(`/checkout/payment/waiting?sid=${encodeURIComponent(flowId)}`)
}
