"use client"

import Image from "next/image"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { LANDING_NAV, type LandingNavId } from "./nav-config"
import { useActiveLandingSection } from "./use-active-landing-section"

export function LandingNavbar({
  logoHref = "#why-us",
  navHrefPrefix = "",
  tryUptionsHref = "#why-us",
}: {
  logoHref?: string
  navHrefPrefix?: string
  tryUptionsHref?: string
}) {
  const activeId = useActiveLandingSection()
  const linksScrollRef = React.useRef<HTMLDivElement>(null)
  const linksRowRef = React.useRef<HTMLDivElement>(null)
  const linkRefs = React.useRef<Partial<Record<LandingNavId, HTMLAnchorElement | null>>>(
    {},
  )
  const [scribble, setScribble] = React.useState({ left: 0, width: 0 })

  const setLinkRef = React.useCallback((id: LandingNavId) => {
    return (node: HTMLAnchorElement | null) => {
      linkRefs.current[id] = node
    }
  }, [])

  const updateScribble = React.useCallback(() => {
    const link = linkRefs.current[activeId]
    const row = linksRowRef.current
    if (!link || !row) return

    setScribble({
      left: link.offsetLeft,
      width: link.offsetWidth,
    })
  }, [activeId])

  React.useLayoutEffect(() => {
    updateScribble()
  }, [updateScribble])

  return (
    <header className="sticky top-4 z-50 px-4 md:top-6 md:px-6">
      <div className="mx-auto flex max-w-5xl justify-center">
        <nav
          className={cn(
            "flex w-full max-w-4xl items-center justify-between gap-3 rounded-full border-0",
            /* Pale cool white → soft sky blue; semi-transparent so layer.svg shows through */
            "bg-[linear-gradient(90deg,rgba(255,255,255,0.82)_0%,rgba(236,246,255,0.84)_42%,rgba(218,236,253,0.78)_100%)]",
            "px-3 py-2 shadow-[0_4px_28px_-6px_rgba(0,27,108,0.1),0_2px_10px_-4px_rgba(0,123,255,0.07)]",
            "backdrop-blur-md backdrop-saturate-150 md:gap-4 md:px-5 md:py-2.5",
          )}
          aria-label="Primary"
        >
          <a
            href={logoHref}
            className="flex shrink-0 items-center gap-2.5"
            aria-label="Uptions, back to top"
          >
            <Image
              src="/logo-colored.png"
              alt=""
              width={248}
              height={248}
              className="w-32 h-8 object-contain"
              priority
            />
          </a>

          <div
            ref={linksScrollRef}
            className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] md:flex-initial [&::-webkit-scrollbar]:hidden"
          >
            <div
              ref={linksRowRef}
              className="relative inline-flex min-h-8 items-end gap-5 px-1 md:gap-6 md:px-2"
            >
              {LANDING_NAV.map((item) => (
                <a
                  key={item.id}
                  ref={setLinkRef(item.id)}
                  href={`${navHrefPrefix}#${item.id}`}
                  className={cn(
                    "shrink-0 text-sm font-medium whitespace-nowrap text-brand-primary transition-colors hover:text-brand-secondary",
                  )}
                >
                  {item.label}
                </a>
              ))}
              {/* eslint-disable-next-line @next/next/no-img-element -- dynamic width/position for underline asset */}
              <img
                src="/scribble.svg"
                alt=""
                className="pointer-events-none absolute -bottom-1.5 h-3 object-contain object-left transition-[left,width,opacity] duration-300 ease-out"
                style={{
                  left: scribble.width > 0 ? scribble.left + scribble.width * 0.04 : 0,
                  width: scribble.width > 0 ? scribble.width * 0.92 : 0,
                  opacity: scribble.width > 0 ? 1 : 0,
                }}
                aria-hidden
              />
            </div>
          </div>

          <Button
            type="button"
            className={cn(
              "h-9 shrink-0 rounded-full border-0 bg-brand-secondary px-4 text-sm font-medium text-brand-white",
              "hover:bg-brand-secondary/90 focus-visible:ring-brand-secondary/40",
            )}
            asChild
          >
            <a href={tryUptionsHref}>Try Uptions</a>
          </Button>
        </nav>
      </div>
    </header>
  )
}
