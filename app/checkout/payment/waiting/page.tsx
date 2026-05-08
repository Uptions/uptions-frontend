import { redirect } from "next/navigation"

import { PaymentWaitClient } from "@/components/checkout/payment-wait-client"
import { Footer } from "@/components/footer"
import { LandingNavbar } from "@/components/landing/landing-navbar"
import { getFlow } from "@/lib/checkout-flow-store"

type SearchParams = Promise<{ sid?: string }>

export default async function PaymentWaitingPage(props: { searchParams: SearchParams }) {
  const sp = await props.searchParams
  const sid = typeof sp.sid === "string" ? sp.sid : ""
  if (!sid) {
    redirect("/find-an-uption")
  }

  const flow = getFlow(sid)
  const serverWaitExpiresAt = flow?.paymentConfirmationWaitExpiresAt ?? null
  const orderId = flow?.orderId ?? null
  if (!orderId) {
    redirect("/find-an-uption")
  }

  return (
    <div
      className="relative min-h-svh w-full bg-transparent bg-[url('/layer.svg')] bg-top bg-no-repeat [background-size:100%_auto]"
      data-landing-root
    >
      <main
        className="relative z-10 w-full bg-transparent"
        aria-label="Payment confirmation"
      >
        <LandingNavbar
          logoHref="/#why-us"
          navHrefPrefix="/"
          tryUptionsHref="/find-an-uption"
        />
        <PaymentWaitClient
          sessionId={sid}
          orderId={orderId}
          serverWaitExpiresAt={serverWaitExpiresAt}
        />
        <Footer />
      </main>
    </div>
  )
}
