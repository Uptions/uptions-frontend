"use client"

import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

import { Input } from "@/components/ui/input"
import { resendBusinessVerification, verifyBusinessEmail } from "@/lib/business-auth"

export default function VerifyBusinessEmailPage() {
  return <Suspense fallback={<main className="mx-auto flex min-h-svh items-center justify-center">Loading…</main>}><VerifyBusinessEmailContent /></Suspense>
}

function VerifyBusinessEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const initialEmail = searchParams.get("email") ?? ""
  const [email, setEmail] = useState(initialEmail)
  const [status, setStatus] = useState<"idle" | "checking" | "verified" | "error">(token ? "checking" : "idle")
  const [message, setMessage] = useState("")
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!token) return
    void (async () => {
      try {
        await verifyBusinessEmail(token)
        setStatus("verified")
      } catch (err) {
        setStatus("error")
        setMessage(err instanceof Error ? err.message : "This verification link could not be used")
      }
    })()
  }, [token])

  async function resend() {
    if (!email) {
      setMessage("Return to sign up and request a new verification email.")
      return
    }
    setResending(true)
    setMessage("")
    try {
      await resendBusinessVerification(email)
      setMessage("If this account needs verification, a new link has been sent.")
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to resend the verification email")
    } finally {
      setResending(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-lg items-center px-5 py-12" data-landing-root>
      <section className="w-full rounded-2xl bg-white p-8 text-center shadow-[0_12px_40px_-16px_rgba(0,27,108,0.2)]">
        <h1 className="text-3xl font-bold text-brand-primary">Verify your email</h1>
        {status === "checking" ? <p className="mt-4">Verifying your secure link…</p> : null}
        {status === "idle" ? <p className="mt-4">Check your inbox and open the verification link to activate sign in.</p> : null}
        {status === "verified" ? <p className="mt-4 text-emerald-700">Email verified. You can now sign in to your business account.</p> : null}
        {status === "error" ? <p className="mt-4 text-red-600">{message}</p> : null}
        {(status === "idle" || status === "error") ? <div className="mt-6 space-y-3"><Input type="email" aria-label="Business email" placeholder="Business email" value={email} onChange={(event) => setEmail(event.target.value)} /><button type="button" onClick={() => void resend()} disabled={resending} className="rounded-lg border border-brand-secondary px-5 py-3 font-semibold text-brand-secondary disabled:opacity-60">{resending ? "Sending…" : "Resend verification email"}</button></div> : null}
        {message && status !== "error" ? <p className="mt-4 text-sm text-brand-foreground/80">{message}</p> : null}
        {status === "verified" ? <Link href="/business/auth" className="mt-6 inline-block rounded-lg bg-brand-secondary px-5 py-3 font-semibold text-white">Sign in</Link> : null}
      </section>
    </main>
  )
}
