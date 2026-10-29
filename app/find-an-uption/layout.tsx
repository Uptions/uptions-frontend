import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Find a Delivery Provider",
  description: "Tell Uptions about your package and compare delivery providers for your route.",
}

export default function FindAnUptionLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
