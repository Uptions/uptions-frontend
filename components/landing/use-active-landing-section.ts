"use client"

import * as React from "react"

import { LANDING_NAV, type LandingNavId } from "@/components/landing/nav-config"

/**
 * Section is active when its top has crossed this line (viewport coords).
 * ~35% from the top tracks the visible block better than a fixed px offset
 * (fixes “on FAQs but indicator still on How it works”).
 */
function activationLinePx(): number {
  return Math.round(window.innerHeight * 0.35)
}

function pickActiveSection(): LandingNavId {
  const ids = LANDING_NAV.map((item) => item.id)
  const line = activationLinePx()

  for (let i = ids.length - 1; i >= 0; i--) {
    const id = ids[i]
    const el = document.getElementById(id)
    if (!el) continue
    if (el.getBoundingClientRect().top <= line) {
      return id
    }
  }

  return ids[0]
}

export function useActiveLandingSection() {
  const [activeId, setActiveId] = React.useState<LandingNavId>("why-us")

  React.useEffect(() => {
    let raf = 0

    const sync = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        setActiveId(pickActiveSection())
      })
    }

    sync()
    window.addEventListener("scroll", sync, { passive: true })
    window.addEventListener("resize", sync)
    window.visualViewport?.addEventListener("resize", sync)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", sync)
      window.removeEventListener("resize", sync)
      window.visualViewport?.removeEventListener("resize", sync)
    }
  }, [])

  return activeId
}
