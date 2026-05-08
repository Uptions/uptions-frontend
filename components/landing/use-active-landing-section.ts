"use client"

import * as React from "react"

import { LANDING_NAV, type LandingNavId } from "@/components/landing/nav-config"

/** Distance from viewport top; section is “active” once its top crosses above this line. */
const ACTIVATION_LINE_PX = 112

function pickActiveSection(): LandingNavId {
  const ids = LANDING_NAV.map((item) => item.id)
  let current: LandingNavId = ids[0]

  for (const id of ids) {
    const el = document.getElementById(id)
    if (!el) continue
    const top = el.getBoundingClientRect().top
    if (top <= ACTIVATION_LINE_PX) {
      current = id
    }
  }

  return current
}

export function useActiveLandingSection() {
  const [activeId, setActiveId] = React.useState<LandingNavId>("why-us")

  React.useEffect(() => {
    const onScroll = () => {
      setActiveId(pickActiveSection())
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  return activeId
}
