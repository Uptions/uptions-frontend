"use client"

import { MapPin } from "lucide-react"
import Link from "next/link"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const inputClassName =
  "h-12 rounded-lg border-brand-secondary/70 bg-[#EEF2F6] text-brand-foreground placeholder:text-brand-foreground/50 focus-visible:border-brand-secondary focus-visible:ring-2 focus-visible:ring-brand-secondary/25"

export default function BusinessForgotPasswordPage() {
  return (
    <div
      className="relative min-h-svh w-full bg-transparent bg-[url('/layer.svg')] bg-top bg-no-repeat [background-size:100%_auto]"
      data-landing-root
    >
      <main className="relative z-10 w-full bg-transparent" aria-label="Forgot password">
        <header className="px-4 pt-6 md:px-6 md:pt-8">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.86)_0%,rgba(236,246,255,0.86)_42%,rgba(218,236,253,0.8)_100%)] px-3 py-2 shadow-[0_4px_28px_-6px_rgba(0,27,108,0.1),0_2px_10px_-4px_rgba(0,123,255,0.07)] backdrop-blur-md backdrop-saturate-150 md:px-5 md:py-2.5">
            <Link
              href="/#why-us"
              className="inline-flex items-center gap-2 rounded-full px-2 py-1"
              aria-label="Uptions home"
            >
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-brand-secondary text-brand-white">
                <MapPin className="size-4" />
              </span>
              <span className="text-3xl font-bold leading-none text-brand-primary">Uptions</span>
            </Link>

            <a
              href="mailto:support@uptions.com"
              className="inline-flex h-9 items-center justify-center rounded-full bg-brand-secondary px-5 text-sm font-medium text-brand-white transition-colors hover:bg-brand-secondary/90"
            >
              Contact support
            </a>
          </div>
        </header>

        <section className="mx-auto flex w-full max-w-4xl justify-center px-4 pb-20 pt-10 md:px-6 md:pt-14">
          <div className="w-full max-w-lg rounded-2xl bg-transparent p-3 md:p-4">
            <h1 className="text-center text-4xl font-bold tracking-tight text-brand-primary md:text-5xl">
              Forgot Password
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-center text-base text-brand-foreground">
              Enter the email address associated with your account and we&apos;ll send you a link
              to reset your password.
            </p>

            <form className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="business-forgot-email" className="text-brand-foreground">
                  Email
                </Label>
                <Input
                  id="business-forgot-email"
                  type="email"
                  placeholder="Enter your email"
                  className={inputClassName}
                  autoComplete="email"
                />
              </div>

              <button
                type="button"
                className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-brand-secondary px-6 font-poppins text-base font-semibold text-brand-white transition-colors hover:bg-brand-secondary/90"
              >
                Send Reset Link
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-brand-foreground/80">
                Remember your password?{" "}
                <Link
                  href="/business/auth"
                  className="font-semibold text-brand-secondary hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

