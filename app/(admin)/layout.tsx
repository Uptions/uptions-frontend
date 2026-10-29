import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
}

/**
 * Route group for admin UI (`/admin/*`). Keeps admin routes colocated without
 * affecting URLs. Consider mirroring with `(business)` / `(marketing)` groups later
 * to isolate layouts and optional loading boundaries per surface.
 */
export default function AdminRouteGroupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
