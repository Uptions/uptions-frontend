import { Geist_Mono, Outfit, Poppins, Space_Grotesk } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://uptions-frontend-production.up.railway.app"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Uptions | Deliver More, Stress Less", template: "%s | Uptions" },
  description: "Compare trusted delivery providers, book deliveries, and keep your parcels moving across Nigeria.",
  applicationName: "Uptions",
  keywords: ["delivery", "courier", "logistics", "Nigeria", "Lagos", "Abuja", "Enugu"],
  icons: { icon: [{ url: "/icon", type: "image/png" }] },
  openGraph: {
    type: "website",
    siteName: "Uptions",
    title: "Uptions | Deliver More, Stress Less",
    description: "Compare trusted delivery providers and book the right delivery for your package.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Uptions — Deliver More, Stress Less" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Uptions | Deliver More, Stress Less",
    description: "Compare trusted delivery providers and book the right delivery for your package.",
    images: ["/opengraph-image"],
  },
}

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        "scroll-smooth",
        "scroll-pt-28",
        "font-sans",
        outfit.variable,
        spaceGrotesk.variable,
        poppins.variable,
        fontMono.variable,
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
