import { Suspense } from "react"

import { BusinessDashboardClient } from "./business-dashboard-client"

export default function BusinessDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center bg-[url('/layer.svg')] bg-top bg-no-repeat [background-size:100%_auto] px-6 text-brand-secondary">
          Loading…
        </div>
      }
    >
      <BusinessDashboardClient />
    </Suspense>
  )
}
