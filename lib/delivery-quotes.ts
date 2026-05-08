/** Shared DTOs for delivery quotes (client + server). */

export type PartyDetailsDTO = {
  name: string
  email: string
  phone: string
  address: string
  state: string
}

export type DeliveryQuoteRequest = {
  sender: PartyDetailsDTO
  receiver: PartyDetailsDTO
  package: {
    description?: string
    vehicleType: string
    weightClass: string
    valueNaira: number
    additionalInstruction?: string
  }
}

export type CourierOptionDTO = {
  id: string
  name: string
  /** 0–5 */
  rating: number
  /** Whole naira (e.g. 5000) */
  priceNaira: number
}

export type DeliveryQuoteResponse = {
  quoteId: string
  estimatedMinutes: number
  couriers: CourierOptionDTO[]
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

export function isDeliveryQuoteResponse(v: unknown): v is DeliveryQuoteResponse {
  if (!isRecord(v)) return false
  if (typeof v.quoteId !== "string" || typeof v.estimatedMinutes !== "number") return false
  if (!Array.isArray(v.couriers)) return false
  return v.couriers.every(
    (c) =>
      isRecord(c) &&
      typeof c.id === "string" &&
      typeof c.name === "string" &&
      typeof c.rating === "number" &&
      typeof c.priceNaira === "number",
  )
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount)
}
