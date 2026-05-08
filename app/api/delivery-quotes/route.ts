import { NextResponse } from "next/server"

/**
 * Internal Route Handler — intended to be called from Server Actions / server code only.
 * When new-uptions-backend exists, proxy to it here (or replace this module with a thin fetch).
 */
import type {
  CourierOptionDTO,
  DeliveryQuoteRequest,
  DeliveryQuoteResponse,
} from "@/lib/delivery-quotes"

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function isParty(v: unknown): v is DeliveryQuoteRequest["sender"] {
  if (!isRecord(v)) return false
  return (
    typeof v.name === "string" &&
    typeof v.email === "string" &&
    typeof v.phone === "string" &&
    typeof v.address === "string" &&
    typeof v.state === "string"
  )
}

function isQuoteRequest(v: unknown): v is DeliveryQuoteRequest {
  if (!isRecord(v)) return false
  if (!isParty(v.sender) || !isParty(v.receiver)) return false
  const pkg = v.package
  if (!isRecord(pkg)) return false
  if (typeof pkg.vehicleType !== "string" || typeof pkg.weightClass !== "string")
    return false
  if (typeof pkg.valueNaira !== "number" || !Number.isFinite(pkg.valueNaira)) return false
  return true
}

/** Placeholder couriers — replace with real provider search from new-uptions-backend */
const MOCK_COURIERS: CourierOptionDTO[] = [
  { id: "jumia", name: "Jumia", rating: 5, priceNaira: 5000 },
  { id: "speedaf", name: "Speedaf", rating: 5, priceNaira: 6500 },
  { id: "uber-eats", name: "Uber Eats", rating: 5, priceNaira: 7500 },
  { id: "grocery-express", name: "Grocery Express", rating: 5, priceNaira: 4900 },
]

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!isQuoteRequest(body)) {
    return NextResponse.json(
      { error: "Invalid payload: sender, receiver, and package are required" },
      { status: 400 },
    )
  }

  const payload: DeliveryQuoteResponse = {
    quoteId: `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`,
    estimatedMinutes: 45,
    couriers: MOCK_COURIERS,
  }

  return NextResponse.json(payload satisfies DeliveryQuoteResponse)
}
