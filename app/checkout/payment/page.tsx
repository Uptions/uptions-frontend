import { redirect } from "next/navigation"

import { BankTransferPanel } from "@/components/checkout/bank-transfer-panel"
import { Footer } from "@/components/footer"
import { LandingNavbar } from "@/components/landing/landing-navbar"
import { loadCheckoutFlow } from "@/lib/load-checkout-flow"

export default async function CheckoutPaymentPage() {
  const flow = await loadCheckoutFlow()
  if (!flow) {
    redirect("/find-an-uption")
  }
  if (!flow.selectedCourierId) {
    redirect("/pick-an-uption")
  }
  if (!flow.paymentExpiresAt) {
    redirect("/checkout")
  }

  return (
    <div
      className="relative min-h-svh w-full bg-transparent bg-[url('/layer.svg')] bg-top bg-no-repeat [background-size:100%_auto]"
      data-landing-root
    >
      <main
        className="relative z-10 w-full bg-transparent"
        aria-label="Bank transfer payment"
      >
        <LandingNavbar
          logoHref="/#why-us"
          navHrefPrefix="/"
          tryUptionsHref="/find-an-uption"
        />
        <BankTransferPanel
          totalNaira={flow.totalNaira}
          expiresAt={flow.paymentExpiresAt}
        />
        <Footer />
      </main>
    </div>
  )
}
