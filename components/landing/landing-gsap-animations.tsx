"use client"

import { useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import type { Audience } from "@/components/landing/audience"

gsap.registerPlugin(ScrollTrigger)

export function LandingGsapAnimations({ audience }: { audience: Audience }) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>("[data-animate-section]")

      sections.forEach((section) => {
        gsap.fromTo(
          section,
          { autoAlpha: 0, y: 36 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          },
        )
      })
    })

    return () => ctx.revert()
  }, [])

  /* Hero / FAQ / about swap changes height — refresh triggers so footer does not flicker */
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [audience])

  return null
}

