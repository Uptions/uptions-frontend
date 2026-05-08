import { redirect } from "next/navigation"

import { CheckoutSummary } from "@/components/checkout/checkout-summary"
import { Footer } from "@/components/footer"
import { LandingNavbar } from "@/components/landing/landing-navbar"
import { loadCheckoutFlow } from "@/lib/load-checkout-flow"

export default async function CheckoutPage() {
  const flow = await loadCheckoutFlow()
  if (!flow) {
    redirect("/find-an-uption")
  }
  if (!flow.selectedCourierId) {
    redirect("/pick-an-uption")
  }

  return (
    <div
      className="relative min-h-svh w-full bg-transparent bg-[url('/layer.svg')] bg-top bg-no-repeat [background-size:100%_auto]"
      data-landing-root
    >
      <main className="relative z-10 w-full bg-transparent" aria-label="Checkout">
        <LandingNavbar
          logoHref="/#why-us"
          navHrefPrefix="/"
          tryUptionsHref="/find-an-uption"
        />
        <CheckoutSummary flow={flow} />
        <Footer />
      </main>
    </div>
  )
}
