"use client"

import { MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adminFetch, clearAdminKey, setAdminEmail, setAdminKey } from "@/lib/admin-api"
import { cn } from "@/lib/utils"

const inputClass =
  "h-12 rounded-lg border-slate-300 bg-[#F0F4F8] text-slate-900 placeholder:text-slate-400 focus-visible:border-[#007BFF] focus-visible:ring-2 focus-visible:ring-[#007BFF]/25"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div
      className="relative min-h-svh w-full bg-white bg-[url('/layer.svg')] bg-top bg-no-repeat [background-size:100%_auto]"
      data-admin-login
    >
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="Uptions home">
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[#007BFF] text-white">
              <MapPin className="size-4" />
            </span>
            <span className="font-heading text-xl font-bold text-[#001B6C]">Uptions</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-lg flex-col px-4 pb-24 pt-16 md:px-6 md:pt-20">
        <h1 className="text-center font-heading text-4xl font-bold text-[#001B6C] md:text-5xl">
          Hello, <span className="text-slate-800">welcome back</span>
        </h1>

        <form
          className="mt-12 space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            setError(null)
            setLoading(true)
            const key = password.trim()
            if (!key) {
              setError("Password is required")
              setLoading(false)
              return
            }
            setAdminKey(key)
            setAdminEmail(email)
            void (async () => {
              try {
                const res = await adminFetch("/v1/admin/dashboard/summary?range=week")
                if (!res.ok) {
                  throw new Error("Invalid credentials")
                }
                router.push("/admin/dashboard")
                router.refresh()
              } catch {
                clearAdminKey()
                setError("Invalid email or admin key. Check your server ADMIN_API_KEY.")
              } finally {
                setLoading(false)
              }
            })()
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="admin-email" className="font-semibold text-slate-900">
              Email
            </Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="username"
              placeholder="Enter your email"
              className={inputClass}
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password" className="font-semibold text-slate-900">
              Password
            </Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              className={cn(inputClass)}
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
            />
            <p className="text-xs text-slate-500">
              Use the same value as <code className="rounded bg-slate-100 px-1">ADMIN_API_KEY</code> on the
              API.
            </p>
          </div>
          {error ? (
            <p className="text-sm text-[#E11D48]" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-lg bg-[#007BFF] font-poppins text-base font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>
      </main>
    </div>
  )
}
