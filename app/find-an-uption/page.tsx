import { FindAnUptionForm } from "@/components/find-an-uption/find-an-uption-form"
import { Footer } from "@/components/footer"
import { LandingNavbar } from "@/components/landing/landing-navbar"

export default function FindAnUptionPage() {
  return (
    <div
      className="relative min-h-svh w-full bg-transparent bg-[url('/layer.svg')] bg-top bg-no-repeat [background-size:100%_auto]"
      data-landing-root
    >
      <main
        className="relative z-10 w-full bg-transparent"
        aria-label="Find an Uption"
      >
        <LandingNavbar
          logoHref="/#why-us"
          navHrefPrefix="/"
          tryUptionsHref="/find-an-uption"
        />

        <section className="mx-auto w-full max-w-5xl px-4 pb-20 pt-10 md:px-6 md:pb-24 md:pt-14">
          <header className="mx-auto max-w-2xl text-center">
            <h1 className="font-heading text-4xl font-bold tracking-tight md:text-5xl">
              <span className="text-brand-secondary">Find an </span>
              <span className="text-brand-primary">Uption</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-brand-foreground/90 md:text-lg">
              Looking to deliver something, fill out the form below and find the best delivery
              service that fits your budget and needs.
            </p>
          </header>

          <div className="mx-auto mt-10 max-w-lg md:mt-12">
            <FindAnUptionForm />
          </div>
        </section>

        <Footer />
      </main>
    </div>
  )
}
