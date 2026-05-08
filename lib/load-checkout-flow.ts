import { cookies } from "next/headers"

import { getFlow } from "@/lib/checkout-flow-store"
import { UPTIONS_FLOW_COOKIE } from "@/lib/checkout-flow-cookie"
import type { CheckoutFlowState } from "@/lib/checkout-flow-store"

export async function loadCheckoutFlow(): Promise<CheckoutFlowState | null> {
  const jar = await cookies()
  const id = jar.get(UPTIONS_FLOW_COOKIE)?.value
  if (!id) return null
  return getFlow(id) ?? null
}
