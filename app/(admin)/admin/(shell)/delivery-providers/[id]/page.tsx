"use client"

import { Pencil } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

import {
  deactivateAdminDeliveryProvider,
  deleteAdminDeliveryProvider,
  fetchAdminDeliveryProviderDetail,
  formatNairaAdmin,
  suspendAdminDeliveryProvider,
  updateAdminDeliveryProvider,
  type AdminDeliveryProviderDetail,
} from "@/lib/admin-api"

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-sky-700">{label}</p>
      <p className="mt-0.5 font-semibold text-slate-900">{value}</p>
    </div>
  )
}

export default function AdminDeliveryProviderDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id ?? ""
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [data, setData] = useState<AdminDeliveryProviderDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [acting, setActing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [companyName, setCompanyName] = useState("")
  const [email, setEmail] = useState("")
  const [priceKm, setPriceKm] = useState("")
  const [priceKg, setPriceKg] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [logo, setLogo] = useState("")

  const load = useCallback(async () => {
    if (!id) return
    setError(null)
    setActionError(null)
    try {
      const d = await fetchAdminDeliveryProviderDetail(id)
      setData(d)
      setCompanyName(d.company.name)
      setEmail(d.company.businessEmail)
      setPriceKm(String(d.company.pricePerKm))
      setPriceKg(String(d.company.weightPricePerKg))
      setPhone(d.company.businessPhone)
      setAddress(d.company.businessAddress)
      setLogo(d.company.logo ?? "")
    } catch (e) {
      setData(null)
      setError(e instanceof Error ? e.message : "Failed to load provider")
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  if (error) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
        <Link href="/admin/delivery-providers" className="text-sm font-medium text-[#007BFF] hover:underline">
          Back to list
        </Link>
      </div>
    )
  }

  if (!data) {
    return <p className="text-slate-500">Loading…</p>
  }

  const placeholderLogo =
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112" viewBox="0 0 112 112"><rect fill="#e2e8f0" width="112" height="112"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-size="14" font-family="system-ui">Logo</text></svg>`,
    )
  const logoSrc = logo.trim() || placeholderLogo

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {actionError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {actionError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/delivery-providers"
            className="text-sm font-medium text-[#007BFF] hover:underline"
          >
            ← Back to delivery providers
          </Link>
          <h1 className="mt-2 font-heading text-3xl font-bold text-slate-900">Delivery Providers</h1>
          <p className="mt-1 text-slate-600">Manage Providers</p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-semibold text-slate-900">Company Information</h2>
        <p className="mt-1 text-sm text-slate-500">Status: {data.statusLabel}</p>

        <div className="relative mx-auto mt-6 flex w-fit flex-col items-center">
          <div className="relative">
            <img
              src={logoSrc}
              alt=""
              className="size-28 rounded-full border border-slate-200 bg-slate-50 object-cover"
              onError={(e) => {
                e.currentTarget.src = placeholderLogo
              }}
            />
            <button
              type="button"
              title="Edit logo URL"
              onClick={() => logoInputRef.current?.focus()}
              className="absolute bottom-0 right-0 flex size-9 items-center justify-center rounded-full bg-[#007BFF] text-white shadow-md hover:bg-[#0066d6]"
            >
              <Pencil className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Company name</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none ring-[#007BFF]/30 focus:ring-2"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Contact email</span>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none ring-[#007BFF]/30 focus:ring-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Delivery price / km (₦)</span>
            <input
              inputMode="decimal"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none ring-[#007BFF]/30 focus:ring-2"
              value={priceKm}
              onChange={(e) => setPriceKm(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Delivery price / kg (₦)</span>
            <input
              inputMode="decimal"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none ring-[#007BFF]/30 focus:ring-2"
              value={priceKg}
              onChange={(e) => setPriceKg(e.target.value)}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Phone number</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none ring-[#007BFF]/30 focus:ring-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Address</span>
            <textarea
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none ring-[#007BFF]/30 focus:ring-2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Logo URL</span>
            <input
              ref={logoInputRef}
              type="url"
              placeholder="https://…"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none ring-[#007BFF]/30 focus:ring-2"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
            />
          </label>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={saving || acting}
            onClick={() => {
              void (async () => {
                setSaving(true)
                setActionError(null)
                try {
                  const pk = Number(priceKm)
                  const pkg = Number(priceKg)
                  if (!Number.isFinite(pk) || !Number.isFinite(pkg)) {
                    setActionError("Enter valid prices.")
                    return
                  }
                  const updated = await updateAdminDeliveryProvider(id, {
                    name: companyName.trim(),
                    businessEmail: email.trim(),
                    pricePerKm: pk,
                    weightPricePerKg: pkg,
                    businessPhone: phone.trim(),
                    businessAddress: address.trim(),
                    logo: logo.trim() || undefined,
                  })
                  setData(updated)
                  setActionError(null)
                } catch (e) {
                  setActionError(e instanceof Error ? e.message : "Update failed")
                } finally {
                  setSaving(false)
                }
              })()
            }}
            className="rounded-lg bg-[#007BFF] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0066d6] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Update Information"}
          </button>
          <button
            type="button"
            disabled={acting || saving}
            onClick={() => {
              void (async () => {
                setActing(true)
                setActionError(null)
                try {
                  const updated = await deactivateAdminDeliveryProvider(id)
                  setData(updated)
                } catch (e) {
                  setActionError(e instanceof Error ? e.message : "Deactivate failed")
                } finally {
                  setActing(false)
                }
              })()
            }}
            className="rounded-lg border border-slate-200 bg-slate-100 px-6 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-200 disabled:opacity-60"
          >
            Deactivate
          </button>
          <button
            type="button"
            disabled={acting || saving}
            onClick={() => {
              void (async () => {
                setActing(true)
                setActionError(null)
                try {
                  const updated = await suspendAdminDeliveryProvider(id)
                  setData(updated)
                } catch (e) {
                  setActionError(e instanceof Error ? e.message : "Suspend failed")
                } finally {
                  setActing(false)
                }
              })()
            }}
            className="rounded-lg border border-slate-200 bg-slate-100 px-6 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-200 disabled:opacity-60"
          >
            Suspend partner
          </button>
          <button
            type="button"
            disabled={acting || saving}
            onClick={() => {
              if (!window.confirm("Delete this partner? This cannot be undone if they have no orders.")) {
                return
              }
              void (async () => {
                setActing(true)
                setActionError(null)
                try {
                  const res = await deleteAdminDeliveryProvider(id)
                  if (res.soft && res.message) {
                    setActionError(res.message)
                    await load()
                    return
                  }
                  router.push("/admin/delivery-providers")
                  router.refresh()
                } catch (e) {
                  setActionError(e instanceof Error ? e.message : "Delete failed")
                } finally {
                  setActing(false)
                }
              })()
            }}
            className="rounded-lg bg-[#E11D48] px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            Delete partner
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-sky-50/80 p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-semibold text-slate-900">Provider Details</h2>
        <p className="mt-1 text-sm font-semibold text-[#007BFF]">{data.statusLabel}</p>

        <h3 className="mt-8 text-base font-semibold text-slate-900">Business Details</h3>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <Field label="Legal Business Name" value={data.business.legalBusinessName} />
          <Field label="Business Registration Number" value={data.business.businessRegistrationNumber} />
          <Field label="Business Address" value={data.business.businessAddress} />
          <Field label="Contact Email" value={data.business.contactEmail} />
          <Field label="Contact Phone" value={data.business.contactPhone} />
          <Field
            label="Business Website"
            value={data.business.businessWebsite?.trim() || "—"}
          />
        </div>

        <h3 className="mt-10 text-base font-semibold text-slate-900">Service Details</h3>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <Field label="Vehicle Types" value={data.service.vehicleTypes} />
          <Field
            label="Insurance Coverage"
            value={data.service.insuranceCoverage ? "Yes" : "No"}
          />
          <Field
            label="Max Insurance Coverage"
            value={formatNairaAdmin(data.service.maxInsuranceCoverageNaira)}
          />
          <Field label="Operating Hours" value={data.service.operatingHours} />
        </div>

        <h3 className="mt-10 text-base font-semibold text-slate-900">Delivery Option (Pricing)</h3>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <Field label="Base Price" value={formatNairaAdmin(data.pricing.basePriceNaira)} />
          <Field label="Per Kilometer price" value={formatNairaAdmin(data.pricing.pricePerKm)} />
          <Field label="Price per KG" value={formatNairaAdmin(data.pricing.pricePerKg)} />
        </div>
      </section>
    </div>
  )
}
