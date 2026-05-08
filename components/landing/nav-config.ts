export const LANDING_NAV = [
  { id: "why-us", label: "Why us" },
  { id: "about-us", label: "About Us" },
  { id: "how-it-works", label: "How it works" },
  { id: "faqs", label: "FAQs" },
] as const

export type LandingNavId = (typeof LANDING_NAV)[number]["id"]
