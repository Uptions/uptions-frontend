import { NextRequest, NextResponse } from "next/server"

import { getBackendBaseUrl } from "@/lib/backend-base-url"

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat")
  const lon = request.nextUrl.searchParams.get("lon")
  if (!lat || !lon) {
    return NextResponse.json({ message: "Latitude and longitude are required" }, { status: 400 })
  }

  const response = await fetch(
    `${getBackendBaseUrl()}/api/v1/quotes/reverse-geocode?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`,
    { cache: "no-store" },
  )
  const body = await response.text()
  return new NextResponse(body, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  })
}
