"use client"

import * as React from "react"

import { AboutUsSection } from "@/components/landing/about-us-section"
import type { Audience } from "@/components/landing/audience"
import { FaqSection } from "@/components/landing/faq-section"
import { LandingGsapAnimations } from "@/components/landing/landing-gsap-animations"
import { HeroSection } from "@/components/landing/hero-section"
import { HighwaySection } from "@/components/landing/highway-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { Footer } from "@/components/footer"
import { LandingNavbar } from "@/components/landing/landing-navbar"

export default function Page() {
  const [audience, setAudience] = React.useState<Audience>("user")

  return (
    <div
      className="relative min-h-svh w-full bg-transparent bg-[url('/layer.svg')] bg-top bg-no-repeat [background-size:100%_auto]"
      data-landing-root
    >
      <main
        id="landing"
        className="relative z-10 w-full bg-transparent"
        aria-label="Uptions landing"
      >
        <LandingGsapAnimations />
        <LandingNavbar
          logoHref="#why-us"
          navHrefPrefix=""
          tryUptionsHref={audience === "business" ? "/join-us" : "/find-an-uption"}
        />

        <section
          id="why-us"
          className="scroll-mt-40 bg-transparent"
          aria-label="Why us"
          data-animate-section
        >
          <HeroSection audience={audience} onAudienceChange={setAudience} />
        </section>

        <HighwaySection />

        <section
          id="about-us"
          className="scroll-mt-28 bg-transparent"
          aria-label="About Us"
          data-animate-section
        >
          <AboutUsSection audience={audience} />
        </section>
        <section
          id="how-it-works"
          className="scroll-mt-28 bg-transparent"
          aria-label="How it works"
          data-animate-section
        >
          <HowItWorksSection audience={audience} />
        </section>
        <section
          id="faqs"
          className="scroll-mt-28 bg-brand-white"
          aria-label="FAQs"
          data-animate-section
        >
          <FaqSection audience={audience} />
        </section>

        <div data-animate-section>
          <Footer />
        </div>
      </main>
    </div>
  )
}
