import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Business Portal",
  robots: { index: false, follow: false },
}

/** Route group for business dashboard (`/business/*`); keeps URLs unchanged. */
export default function BusinessRouteGroupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
