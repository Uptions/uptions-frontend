import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

const FOOTER_NAV_A = [
  { label: "Home", href: "/#why-us" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Become an uption", href: "/join-us" },
] as const

const FOOTER_NAV_B = [
  { label: "About us", href: "/#about-us" },
  { label: "Try Uptions", href: "/find-an-uption" },
  { label: "FAQs", href: "/#faqs" },
] as const

const SOCIAL = [
  { label: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
  { label: "Facebook", href: "https://facebook.com", icon: FacebookIcon },
  { label: "X", href: "https://x.com", icon: XIcon },
  { label: "LinkedIn", href: "https://linkedin.com", icon: LinkedInIcon },
  { label: "TikTok", href: "https://tiktok.com", icon: TikTokIcon },
] as const

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M14 8h2V5h-2a4 4 0 0 0-4 4v2H7v3h3v7h3v-7h2.5l.5-3H13V9a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 4l7.5 9.5L4 20h2.5l6-6.5 4.5 6.5H20l-8-10 7-6H16l-5.5 4.5L6.5 4H4Z"
        fill="currentColor"
      />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6.5 8.5V17M6.5 6v.01M10 17v-5.2c0-1.5 1.2-2.8 2.8-2.8s2.8 1.1 2.8 2.8V17M17.5 11.8V17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M14.5 4v11.2a3.3 3.3 0 1 1-3.3-3.3c.2 0 .4 0 .6.1V9.1a6.6 6.6 0 0 0-1-.1 5.5 5.5 0 1 0 5.5 5.5V7.8a8.5 8.5 0 0 0 4.7 1.4V7.2a4.8 4.8 0 0 1-2.5-.9L14.5 4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const FOOTER_TAGLINE_WORDS = ["Compare", "Choose", "Ship", "Repeat"] as const

function FooterTaglineMarqueeSegment() {
  return (
    <div className="flex shrink-0 items-baseline">
      {FOOTER_TAGLINE_WORDS.map((word) => (
        <span key={word} className="inline-flex tracking-wide items-baseline">
          <span
            className={cn(
              /* Navy-on-navy hid “Choose”; bright blue reads on footer background */
              word === "Choose" || word === "Repeat"
                ? "text-black"
                : "text-white/[0.12]",
            )}
          >
            {word}
          </span>
          <span
            className="ml-[0.18em] translate-y-[-0.06em] text-[0.5em] font-bold text-brand-secondary"
            aria-hidden
          >
            *
          </span>
        </span>
      ))}
    </div>
  )
}

function FooterTaglineMarquee() {
  return (
    <div
      className="pointer-events-none relative z-0 -mt-4 overflow-hidden px-2 pb-3 select-none sm:px-3"
      aria-hidden
    >
      <div className="inline-flex w-max shrink-0 animate-footer-tagline-marquee font-heading text-[clamp(3.25rem,15vw,9rem)] font-bold leading-none tracking-tight">
        <FooterTaglineMarqueeSegment />
        <FooterTaglineMarqueeSegment />
      </div>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-brand-primary text-brand-white">
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-16">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href="/#why-us" className="inline-flex items-center gap-3">
              <Image
                src="/logo-white.png"
                alt=""
                width={148}
                height={148}
                className="h-8 w-32 object-contain"
              />
            </Link>
            <nav className="mt-6 flex flex-wrap gap-3" aria-label="Social">
              {SOCIAL.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex size-10 items-center justify-center rounded-full border border-white/35 text-white",
                    "transition-colors hover:border-white hover:bg-white/10",
                  )}
                  aria-label={label}
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </nav>
          </div>

          <div className="flex flex-wrap gap-16 md:gap-24">
            <nav aria-label="Footer" className="flex flex-col gap-3 text-sm">
              {FOOTER_NAV_A.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-white/90 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <nav aria-label="Footer secondary" className="flex flex-col gap-3 text-sm">
              {FOOTER_NAV_B.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-white/90 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <FooterTaglineMarquee />
    </footer>
  )
}
