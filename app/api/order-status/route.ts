import { NextRequest, NextResponse } from "next/server"
import { orderAccessCookieName } from "@/lib/checkout-flow-cookie"
import { getBackendBaseUrl } from "@/lib/backend-base-url"

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("orderId")
  const returnToken = request.nextUrl.searchParams.get("returnToken")
  if (!orderId) return NextResponse.json({ message: "Missing order ID" }, { status: 400 })
  const token = request.cookies.get(orderAccessCookieName(orderId))?.value
  if (!token && !returnToken) return NextResponse.json({ message: "Order access expired" }, { status: 403 })
  const response = await fetch(`${getBackendBaseUrl()}/api/v1/orders/${orderId}/status`, {
    headers: token
      ? { "x-order-access-token": token }
      : { "x-payment-return-token": returnToken as string },
    cache: "no-store",
  })
  const body = await response.text()
  return new NextResponse(body, { status: response.status, headers: { "Content-Type": "application/json" } })
}
