import { redirect } from "next/navigation"

import { PickAnUptionView } from "@/components/pick-an-uption/pick-an-uption-view"
import { Footer } from "@/components/footer"
import { LandingNavbar } from "@/components/landing/landing-navbar"
import { loadCheckoutFlow } from "@/lib/load-checkout-flow"

export default async function PickAnUptionPage() {
  const flow = await loadCheckoutFlow()
  if (!flow) {
    redirect("/find-an-uption")
  }

  return (
    <div
      className="relative min-h-svh w-full bg-transparent bg-[url('/layer.svg')] bg-top bg-no-repeat [background-size:100%_auto]"
      data-landing-root
    >
      <main
        className="relative z-10 w-full bg-transparent"
        aria-label="Pick an Uption"
      >
        <LandingNavbar
          logoHref="/#why-us"
          navHrefPrefix="/"
          tryUptionsHref="/find-an-uption"
        />

        <section className="mx-auto w-full max-w-5xl px-4 pb-20 pt-10 md:px-6 md:pb-24 md:pt-14">
          <PickAnUptionView quote={flow.quote} />
        </section>

        <Footer />
      </main>
    </div>
  )
}
