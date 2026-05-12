import Link from "next/link"

import { BusinessShell } from "@/components/business/business-shell"

type BusinessNoSessionReason = "sign-in" | "onboarding"

export function BusinessNoSession({
  activeNav,
  reason = "sign-in",
}: {
  activeNav: "home" | "orders" | "order-pool" | "wallet" | "account"
  reason?: BusinessNoSessionReason
}) {
  const onboarding = reason === "onboarding"

  return (
    <BusinessShell activeNav={activeNav}>
      <div className="mt-16 rounded-xl border border-brand-foreground/15 bg-white/80 p-8 text-center">
        <p className="text-lg font-semibold text-brand-foreground">
          {onboarding ? "Finish setting up your business" : "Sign in to your business account"}
        </p>
        <p className="mt-2 text-sm text-brand-secondary">
          {onboarding
            ? "Complete the onboarding form to link your account to a company profile."
            : "Use your business email and password to access the dashboard."}
        </p>
        <Link
          href={onboarding ? "/business/auth/signup/form" : "/business/auth"}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-brand-secondary px-6 text-sm font-medium text-white"
        >
          {onboarding ? "Continue onboarding" : "Sign in"}
        </Link>
      </div>
    </BusinessShell>
  )
}
