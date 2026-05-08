import type { DeliveryQuoteRequest, DeliveryQuoteResponse } from "@/lib/delivery-quotes"

/**
 * Ephemeral checkout state until new-uptions-backend persists sessions.
 * Lost on server restart / serverless cold start — replace with DB or backend session.
 */
export type CheckoutFlowState = {
  orderId: string
  orderSessionId: string
  request: DeliveryQuoteRequest
  quote: DeliveryQuoteResponse
  selectedCourierId: string | null
  selectedCourierName: string | null
  /** Declared package value (subtotal before service charge) */
  subtotalNaira: number
  serviceChargeNaira: number
  totalNaira: number
  /** Set when user opens bank transfer step */
  paymentExpiresAt: number | null
  /** Deadline for admin to confirm payment (after “I’ve sent the money”) */
  paymentConfirmationWaitExpiresAt: number | null
  transferDetails: {
    bankName: string
    accountNumber: string
    amountNaira: number
  } | null
}

const flows = new Map<string, CheckoutFlowState>()

export function createFlowState(
  orderId: string,
  orderSessionId: string,
  request: DeliveryQuoteRequest,
  quote: DeliveryQuoteResponse,
): CheckoutFlowState {
  return {
    orderId,
    orderSessionId,
    request,
    quote,
    selectedCourierId: null,
    selectedCourierName: null,
    subtotalNaira: request.package.valueNaira,
    serviceChargeNaira: 500,
    totalNaira: request.package.valueNaira + 500,
    paymentExpiresAt: null,
    paymentConfirmationWaitExpiresAt: null,
    transferDetails: null,
  }
}

export function getFlow(flowId: string): CheckoutFlowState | undefined {
  return flows.get(flowId)
}

export function setFlow(flowId: string, state: CheckoutFlowState): void {
  flows.set(flowId, state)
}

export function deleteFlow(flowId: string): void {
  flows.delete(flowId)
}
