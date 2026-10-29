import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Choose a Delivery Provider",
  description: "Review available delivery options and choose the provider that fits your package.",
  robots: { index: false, follow: false },
}

export default function PickAnUptionLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
