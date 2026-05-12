"use client"

import { Eye, MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { clearBusinessSession, saveBusinessSession } from "@/lib/business-session"
import { fetchBusinessMe, loginBusiness } from "@/lib/business-auth"
import { cn } from "@/lib/utils"

const inputClassName =
  "h-12 rounded-lg border-brand-secondary/70 bg-[#EEF2F6] text-brand-foreground placeholder:text-brand-foreground/50 focus-visible:border-brand-secondary focus-visible:ring-2 focus-visible:ring-brand-secondary/25"

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.805 10.023H12v3.955h5.614c-.242 1.274-.969 2.354-2.06 3.08v2.56h3.33c1.95-1.796 3.075-4.444 3.075-7.594 0-.676-.06-1.326-.174-2Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.79 0 5.13-.924 6.84-2.5l-3.33-2.56c-.923.62-2.106.987-3.51.987-2.699 0-4.983-1.822-5.8-4.274H2.757v2.64A10.334 10.334 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.2 13.653A6.214 6.214 0 0 1 5.876 12c0-.574.117-1.127.324-1.653v-2.64H2.757A10.334 10.334 0 0 0 1.666 12c0 1.652.397 3.217 1.091 4.293l3.443-2.64Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.073c1.518 0 2.88.523 3.95 1.55l2.963-2.964C17.126 2.997 14.786 2 12 2A10.334 10.334 0 0 0 2.757 7.707l3.443 2.64c.817-2.452 3.101-4.274 5.8-4.274Z"
        fill="#EA4335"
      />
    </svg>
  )
}

export default function BusinessAuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  return (
    <div
      className="relative min-h-svh w-full bg-transparent bg-[url('/layer.svg')] bg-top bg-no-repeat [background-size:100%_auto]"
      data-landing-root
    >
      <main className="relative z-10 w-full bg-transparent" aria-label="Business auth">
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
              Hello, <span className="text-brand-foreground">welcome back</span>
            </h1>

            <form
              className="mt-10 space-y-5"
              onSubmit={(event) => {
                event.preventDefault()
                void (async () => {
                  setError(null)
                  setSubmitting(true)
                  try {
                    await loginBusiness(email.trim(), password)
                    clearBusinessSession()
                    const me = await fetchBusinessMe()
                    if (me.companyId) {
                      saveBusinessSession({
                        v: 1,
                        companyId: me.companyId,
                        businessName: "",
                      })
                      router.push("/business/dashboard")
                    } else {
                      router.push("/business/auth/signup/form")
                    }
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Sign in failed")
                  } finally {
                    setSubmitting(false)
                  }
                })()
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="business-email" className="text-brand-foreground">
                  Email
                </Label>
                <Input
                  id="business-email"
                  type="email"
                  placeholder="Enter your email"
                  className={inputClassName}
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-password" className="text-brand-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="business-password"
                    type="password"
                    placeholder="Enter Password"
                    className={cn(inputClassName, "pr-10")}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <Eye
                    className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-brand-secondary"
                    aria-hidden
                  />
                </div>
              </div>

              {error ? (
                <p className="text-sm text-[#E11D48]" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-lg bg-brand-secondary px-6 font-poppins text-base font-semibold text-brand-white transition-colors hover:bg-brand-secondary/90 disabled:opacity-60"
              >
                {submitting ? "Signing in…" : "Sign in"}
              </button>

              <button
                type="button"
                tabIndex={-1}
                aria-disabled="true"
                className="pointer-events-none inline-flex h-12 w-full select-none items-center justify-center gap-2 rounded-lg bg-[#D1D5DB] px-6 font-poppins text-base font-semibold text-brand-foreground"
              >
                <GoogleIcon />
                Sign Up with Google
              </button>
            </form>

            <div className="mt-6 space-y-2 text-center text-sm">
              <p className="text-brand-foreground/80">
                Don&apos;t have an account?{" "}
                <Link
                  href="/business/auth/signup"
                  className="font-semibold text-brand-secondary hover:underline"
                >
                  Sign Up
                </Link>
              </p>
              <Link
                href="/business/auth/forgot-password"
                className="font-semibold text-brand-secondary hover:underline"
              >
                Forgotten Password?
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

