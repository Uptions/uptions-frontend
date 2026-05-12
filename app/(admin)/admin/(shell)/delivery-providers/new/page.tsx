"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { createAdminDeliveryProvider } from "@/lib/admin-api"

export default function AdminNewDeliveryProviderPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    businessEmail: "",
    pricePerKm: "",
    weightPricePerKg: "",
    businessPhone: "",
    businessAddress: "",
    logo: "",
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/delivery-providers"
          className="text-sm font-medium text-[#007BFF] hover:underline"
        >
          ← Back to delivery providers
        </Link>
        <h1 className="mt-2 font-heading text-3xl font-bold text-slate-900">Add Provider</h1>
        <p className="mt-1 text-slate-600">Create a new delivery partner record.</p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <form
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault()
          const pricePerKm = Number(form.pricePerKm)
          const weightPricePerKg = Number(form.weightPricePerKg)
          if (!form.name.trim() || !form.businessEmail.trim()) {
            setError("Name and email are required.")
            return
          }
          if (!Number.isFinite(pricePerKm) || !Number.isFinite(weightPricePerKg)) {
            setError("Enter valid prices.")
            return
          }
          void (async () => {
            setSubmitting(true)
            setError(null)
            try {
              const { id } = await createAdminDeliveryProvider({
                name: form.name.trim(),
                businessEmail: form.businessEmail.trim(),
                pricePerKm,
                weightPricePerKg,
                businessPhone: form.businessPhone.trim(),
                businessAddress: form.businessAddress.trim(),
                logo: form.logo.trim() || undefined,
              })
              router.push(`/admin/delivery-providers/${id}`)
              router.refresh()
            } catch (err) {
              setError(err instanceof Error ? err.message : "Create failed")
            } finally {
              setSubmitting(false)
            }
          })()
        }}
      >
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Company name</span>
          <input
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none ring-[#007BFF]/30 focus:ring-2"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Contact email</span>
          <input
            required
            type="email"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none ring-[#007BFF]/30 focus:ring-2"
            value={form.businessEmail}
            onChange={(e) => setForm((f) => ({ ...f, businessEmail: e.target.value }))}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Delivery price / km (₦)</span>
            <input
              required
              inputMode="decimal"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none ring-[#007BFF]/30 focus:ring-2"
              value={form.pricePerKm}
              onChange={(e) => setForm((f) => ({ ...f, pricePerKm: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Delivery price / kg (₦)</span>
            <input
              required
              inputMode="decimal"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none ring-[#007BFF]/30 focus:ring-2"
              value={form.weightPricePerKg}
              onChange={(e) => setForm((f) => ({ ...f, weightPricePerKg: e.target.value }))}
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Phone number</span>
          <input
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none ring-[#007BFF]/30 focus:ring-2"
            value={form.businessPhone}
            onChange={(e) => setForm((f) => ({ ...f, businessPhone: e.target.value }))}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Address</span>
          <textarea
            required
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none ring-[#007BFF]/30 focus:ring-2"
            value={form.businessAddress}
            onChange={(e) => setForm((f) => ({ ...f, businessAddress: e.target.value }))}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Logo URL (optional)</span>
          <input
            type="url"
            placeholder="https://…"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none ring-[#007BFF]/30 focus:ring-2"
            value={form.logo}
            onChange={(e) => setForm((f) => ({ ...f, logo: e.target.value }))}
          />
        </label>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[#007BFF] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0066d6] disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Create provider"}
          </button>
          <Link
            href="/admin/delivery-providers"
            className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
