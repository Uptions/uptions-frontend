"use client"

import Link from "next/link"
import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetBusinessPassword } from "@/lib/business-auth"

export default function ResetBusinessPasswordPage() {
  return <Suspense fallback={<main className="mx-auto flex min-h-svh items-center justify-center">Loading…</main>}><ResetBusinessPasswordContent /></Suspense>
}

function ResetBusinessPasswordContent() {
  const token = useSearchParams().get("token") ?? ""
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  return (
    <main className="mx-auto flex min-h-svh max-w-lg items-center px-5 py-12" data-landing-root>
      <section className="w-full rounded-2xl bg-white p-8 shadow-[0_12px_40px_-16px_rgba(0,27,108,0.2)]">
        <h1 className="text-center text-3xl font-bold text-brand-primary">Choose a new password</h1>
        {done ? <div className="mt-6 text-center"><p className="text-emerald-700">Your password has been reset. Please sign in.</p><Link href="/business/auth" className="mt-6 inline-block rounded-lg bg-brand-secondary px-5 py-3 font-semibold text-white">Sign in</Link></div> : <form className="mt-8 space-y-5" onSubmit={(event) => { event.preventDefault(); void (async () => { setError(null); if (!token) { setError("This reset link is invalid."); return } if (password.length < 8) { setError("Password must be at least 8 characters."); return } if (password !== confirmPassword) { setError("Passwords do not match."); return } setSubmitting(true); try { await resetBusinessPassword(token, password); setDone(true) } catch (err) { setError(err instanceof Error ? err.message : "Unable to reset password") } finally { setSubmitting(false) } })() }}>
          <div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="confirm-password">Confirm new password</Label><Input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></div>
          {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
          <button type="submit" disabled={submitting} className="h-12 w-full rounded-lg bg-brand-secondary font-semibold text-white disabled:opacity-60">{submitting ? "Resetting…" : "Reset password"}</button>
        </form>}
      </section>
    </main>
  )
}
