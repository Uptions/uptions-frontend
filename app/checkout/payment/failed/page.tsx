import Link from "next/link"
import { Minus } from "lucide-react"

import { Footer } from "@/components/footer"
import { LandingNavbar } from "@/components/landing/landing-navbar"

export default function PaymentFailedPage() {
  return (
    <div
      className="relative min-h-svh w-full bg-transparent bg-[url('/layer.svg')] bg-top bg-no-repeat [background-size:100%_auto]"
      data-landing-root
    >
      <main
        className="relative z-10 w-full bg-transparent"
        aria-label="Payment failed"
      >
        <LandingNavbar
          logoHref="/#why-us"
          navHrefPrefix="/"
          tryUptionsHref="/find-an-uption"
        />

        <div className="mx-auto flex min-h-[55vh] w-full max-w-md items-center px-4 py-16">
          <div className="w-full rounded-2xl bg-white p-8 shadow-[0_12px_40px_-16px_rgba(0,27,108,0.2)] md:p-10">
            <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-neutral-900 text-white md:size-16">
              <Minus className="size-8 stroke-[3]" aria-hidden />
            </div>
            <h1 className="mt-6 text-center text-xl font-bold text-brand-secondary md:text-2xl">
              Payment Failed
            </h1>
            <p className="mt-4 text-center text-sm leading-relaxed text-brand-foreground md:text-base">
              Oops! Something went wrong while processing your payment.
            </p>
            <p className="mt-2 text-center text-sm text-brand-foreground md:text-base">
              Need help? We&apos;re just a chat away.
            </p>
            <div className="mt-8 text-center">
              <Link
                href="mailto:support@uptions.com"
                className="text-sm font-medium text-brand-secondary underline underline-offset-4 hover:text-brand-primary"
              >
                Chat support
              </Link>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  )
}
