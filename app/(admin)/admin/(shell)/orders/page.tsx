import { Suspense } from "react"

import { AdminOrdersListClient } from "./orders-list-client"

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="text-slate-500" aria-live="polite">
          Loading orders…
        </div>
      }
    >
      <AdminOrdersListClient />
    </Suspense>
  )
}
