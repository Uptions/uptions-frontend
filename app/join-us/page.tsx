"use client"

import { Footer } from "@/components/footer"
import { LandingNavbar } from "@/components/landing/landing-navbar"

export default function JoinUsPage() {
  return (
    <div
      className="relative min-h-svh w-full bg-transparent bg-[url('/layer.svg')] bg-top bg-no-repeat [background-size:100%_auto]"
      data-landing-root
    >
      <main className="relative z-10 w-full bg-transparent" aria-label="Uptions join us">
        <LandingNavbar logoHref="/#why-us" navHrefPrefix="/" tryUptionsHref="/find-an-uption" />

        <section className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10 md:px-6 md:pb-20 md:pt-14">
          <div className="animate-hero-content-swap rounded-2xl bg-brand-white/10 p-1">
            <div className="rounded-2xl bg-transparent px-4 py-5 md:px-8 md:py-8">
              <h1 className="font-heading text-5xl leading-tight tracking-tight text-brand-secondary md:text-7xl">
                Become an <span className="font-bold text-brand-primary">Uption</span>
              </h1>

              <p className="mt-5 max-w-4xl text-2xl leading-relaxed text-brand-foreground md:text-3xl">
                Partner with us to <strong>redefine delivery.</strong> Join a network that
                connects your services to new customers, scales your reach, and grows your
                business.
              </p>

              <p className="mt-8 max-w-4xl text-xl leading-relaxed text-brand-foreground md:text-2xl">
                We&apos;re thrilled to have you on board as part of the Uptions family. Your
                journey with us is just beginning, and we couldn&apos;t be more excited to help
                your logistics company grow. The information you provide in this form will enable
                us to create a personalized profile that accurately represents your business. We
                prioritize your privacy, and all details shared will remain confidential,
                accessible only to us unless needed for verification purposes.
              </p>

              <div className="mt-8 max-w-4xl text-xl leading-relaxed text-brand-foreground md:text-2xl">
                <h2 className="font-semibold text-brand-primary">Important Notes</h2>
                <ul className="mt-2 space-y-1">
                  <li>- You will receive a copy of your application once it&apos;s completed.</li>
                  <li>
                    - Please fill out the form with as much detail as possible to help us verify
                    and approve your profile quickly.
                  </li>
                  <li>
                    - If any updates or changes are required in the future (such as your address
                    or pricing update), inform us ahead of time, and we&apos;ll assist with the
                    updates.
                  </li>
                  <li>
                    - Rest assured, all the information you provide is treated with the highest
                    level of confidentiality and will only be used for verification purposes.
                  </li>
                  <li>
                    - We verify all details to ensure quality control and to work with the best
                    logistics partners.
                  </li>
                  <li>
                    - We&apos;ll keep you informed of any updates or changes to the platform, with
                    a notice ahead of time
                  </li>
                </ul>
              </div>

              <div className="mt-10 flex justify-center">
                <a
                  href="#"
                  className="inline-flex h-14 min-w-[18rem] items-center justify-center rounded-full bg-brand-primary px-10 font-poppins text-lg font-semibold text-brand-white transition-colors hover:bg-brand-primary/90 md:h-16 md:min-w-[20rem] md:text-xl"
                >
                  JOIN US TODAY
                </a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  )
}

