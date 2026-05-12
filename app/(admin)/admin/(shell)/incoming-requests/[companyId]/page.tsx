"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

import {
  approveBusinessOnboarding,
  fetchPendingOnboardingDetail,
  formatNairaAdmin,
  rejectBusinessOnboarding,
  type PendingOnboardingDetail,
} from "@/lib/admin-api"

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-sky-700">{label}</p>
      <p className="mt-0.5 font-semibold text-slate-900">{value}</p>
    </div>
  )
}

export default function AdminIncomingRequestDetailPage() {
  const params = useParams<{ companyId: string }>()
  const router = useRouter()
  const companyId = params.companyId ?? ""
  const [data, setData] = useState<PendingOnboardingDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [acting, setActing] = useState(false)

  const load = useCallback(async () => {
    if (!companyId) return
    setError(null)
    setActionError(null)
    try {
      const d = await fetchPendingOnboardingDetail(companyId)
      setData(d)
    } catch (e) {
      setData(null)
      setError(e instanceof Error ? e.message : "Failed to load request")
    }
  }, [companyId])

  useEffect(() => {
    void load()
  }, [load])

  if (error) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
        <Link href="/admin/incoming-requests" className="text-sm font-medium text-[#007BFF] hover:underline">
          Back to list
        </Link>
      </div>
    )
  }

  if (!data) {
    return <p className="text-slate-500">Loading…</p>
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {actionError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {actionError}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/incoming-requests"
            className="text-sm font-medium text-[#007BFF] hover:underline"
          >
            ← Back to incoming requests
          </Link>
          <h1 className="mt-2 font-heading text-3xl font-bold text-slate-900">Provider Details</h1>
          <p className="mt-1 text-sm font-semibold text-[#007BFF]">{data.statusLabel}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-sky-50/80 p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-semibold text-slate-900">Business Details</h2>
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

        <h2 className="mt-10 text-lg font-semibold text-slate-900">Service Details</h2>
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

        <h2 className="mt-10 text-lg font-semibold text-slate-900">Delivery Option</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <Field label="Base Price" value={formatNairaAdmin(data.pricing.basePriceNaira)} />
          <Field label="Per Kilometer price" value={formatNairaAdmin(data.pricing.pricePerKm)} />
          <Field label="Price per KG" value={formatNairaAdmin(data.pricing.pricePerKg)} />
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <button
            type="button"
            disabled={acting}
            onClick={() => {
              void (async () => {
                setActing(true)
                setActionError(null)
                try {
                  await approveBusinessOnboarding(companyId)
                  router.push("/admin/incoming-requests")
                  router.refresh()
                } catch (e) {
                  setActionError(e instanceof Error ? e.message : "Approve failed")
                } finally {
                  setActing(false)
                }
              })()
            }}
            className="rounded-lg bg-[#007BFF] px-8 py-3 font-semibold text-white hover:bg-[#0066d6] disabled:opacity-60"
          >
            Approve
          </button>
          <button
            type="button"
            disabled={acting}
            onClick={() => {
              void (async () => {
                setActing(true)
                setActionError(null)
                try {
                  await rejectBusinessOnboarding(companyId)
                  router.push("/admin/incoming-requests")
                  router.refresh()
                } catch (e) {
                  setActionError(e instanceof Error ? e.message : "Reject failed")
                } finally {
                  setActing(false)
                }
              })()
            }}
            className="rounded-lg bg-[#E11D48] px-8 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  )
}
