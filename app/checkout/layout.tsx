import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Confirm your delivery details and complete your secure checkout.",
  robots: { index: false, follow: false },
}

export default function CheckoutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
