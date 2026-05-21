"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import type { Audience } from "@/components/landing/audience"

const HERO_COPY: Record<
  Audience,
  {
    heading: React.ReactNode
    subcopy: React.ReactNode
    cta?: { label: string; href: string }
  }
> = {
  user: {
    heading: (
      <>
        <span className="font-light text-brand-secondary">Deliver </span>
        <span className="text-brand-primary">More,</span>
        <br />
        <span className="font-light text-brand-secondary">Stress </span>
        <span className="text-brand-primary">Less.</span>
      </>
    ),
    subcopy: (
      <>
        Connecting <strong className="font-semibold text-brand-secondary">customers</strong> to
        trusted delivery providers, and{" "}
        <strong className="font-semibold text-brand-secondary">delivery companies</strong> to more
        opportunities.
      </>
    ),
  },
  business: {
    heading: (
      <>
        <span className="font-light text-brand-secondary">More </span>
        <span className="text-brand-primary">Orders,</span>
        <br />
        <span className="font-light text-brand-secondary">Less </span>
        <span className="text-brand-primary">Idle time.</span>
      </>
    ),
    subcopy: (
      <>
        <strong className="font-semibold text-brand-primary">Uptions</strong> plugs you into{" "}
        <strong className="font-semibold text-brand-secondary">customers</strong> who need your
        service now.
      </>
    ),
    cta: { label: "JOIN US TODAY", href: "/join-us" },
  },
}

export function HeroSection({
  audience,
  onAudienceChange,
}: {
  audience: Audience
  onAudienceChange: (audience: Audience) => void
}) {
  const content = HERO_COPY[audience]

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-12 pt-20 text-center md:pb-16 md:pt-22">
      <div
        className={cn(
          "relative mb-10 inline-flex min-w-[min(100%,20rem)] rounded-full border border-brand-primary p-1",
          /* Light sky-blue track; lets layer.svg show through slightly */
          "bg-[#007BFF80] backdrop-blur-[2px]",
        )}
        role="group"
        aria-label="Audience"
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1 bottom-1 left-1 rounded-full bg-brand-secondary",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]",
            "transition-transform duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] will-change-transform",
          )}
          style={{
            width: "calc((100% - 0.5rem) / 2)",
            transform:
              audience === "business" ? "translateX(calc(100% + 0rem))" : "translateX(0)",
          }}
        />
        <button
          type="button"
          onClick={() => onAudienceChange("user")}
          className={cn(
            "relative z-10 min-w-0 flex-1 rounded-full px-7 py-2.5 text-sm font-semibold",
            "text-brand-white drop-shadow-[0_1px_1px_rgba(0,27,108,0.28)]",
          )}
          aria-pressed={audience === "user"}
        >
          User
        </button>
        <button
          type="button"
          onClick={() => onAudienceChange("business")}
          className={cn(
            "relative z-10 min-w-0 flex-1 rounded-full px-7 py-2.5 text-sm font-semibold",
            "text-brand-white drop-shadow-[0_1px_1px_rgba(0,27,108,0.28)]",
          )}
          aria-pressed={audience === "business"}
        >
          Business
        </button>
      </div>

      <div
        key={audience}
        className="animate-hero-content-swap mx-auto flex w-full flex-col items-center"
      >
        <div className="group relative mx-auto w-max max-w-full text-center">
          <h1 className="mx-auto w-max max-w-full font-heading text-4xl font-bold leading-tight tracking-tight text-brand-primary md:text-5xl lg:text-[3.25rem] lg:leading-[1.15]">
            {content.heading}
          </h1>
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative hover underline; width tracks headline via w-max wrapper */}
          <img
            src="/Doodle.svg"
            alt=""
            className={cn(
              "pointer-events-none absolute left-0 top-full z-10 mt-2 w-full max-w-none",
              "h-auto max-h-[min(2.75rem,8vw)] min-h-4 object-contain object-center",
              "opacity-0 transition-opacity duration-300 ease-out motion-safe:group-hover:opacity-100",
            )}
            aria-hidden
          />
        </div>

        <p className="mt-16 max-w-xl text-base leading-relaxed text-brand-foreground md:text-lg">
          {content.subcopy}
        </p>

        {content.cta ? (
          <a
            href={content.cta.href}
            className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-brand-secondary px-10 font-poppins text-xl font-semibold text-brand-white shadow-[0_10px_28px_-14px_rgba(0,123,255,0.85)] transition-colors hover:bg-brand-secondary/90"
          >
            {content.cta.label}
          </a>
        ) : null}
      </div>

      <p className="sr-only" aria-live="polite">
        {audience === "user" ? "Viewing as user." : "Viewing as business."}
      </p>
    </div>
  )
}
