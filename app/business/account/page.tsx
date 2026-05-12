"use client"

import { PencilLine } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { BusinessShell } from "@/components/business/business-shell"
import { BusinessNoSession } from "@/components/business/business-no-session"
import { formatNaira, getBusinessProfile, patchBusinessProfile, type BusinessProfile } from "@/lib/business-api"
import { useBusinessSession } from "@/hooks/use-business-session"

function ProfileRow({
  title,
  value,
  action,
  onEdit,
}: {
  title: string
  value: string
  action?: "edit" | "support"
  onEdit?: () => void
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[#edf2f8] px-4 py-3">
      <div>
        <p className="font-semibold text-brand-foreground">{title}</p>
        <p className="text-sm text-brand-secondary">{value}</p>
      </div>
      {action === "support" ? (
        <a
          href="mailto:support@uptions.com"
          className="rounded-full bg-brand-secondary px-4 py-2 text-sm font-medium text-white"
        >
          Contact support
        </a>
      ) : (
        <button type="button" onClick={onEdit} aria-label={`Edit ${title}`}>
          <PencilLine className="size-4 text-brand-foreground" />
        </button>
      )}
    </div>
  )
}

export default function BusinessAccountPage() {
  const { ready, authenticated, companyId } = useBusinessSession()
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!companyId) return
    setError(null)
    try {
      const p = await getBusinessProfile(companyId)
      setProfile(p)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile")
    }
  }, [companyId])

  useEffect(() => {
    if (!ready || !companyId) return
    queueMicrotask(() => {
      void load()
    })
  }, [ready, companyId, load])

  const updateField = useCallback(
    async (patch: Parameters<typeof patchBusinessProfile>[1]) => {
      if (!companyId) return
      try {
        const next = await patchBusinessProfile(companyId, patch)
        setProfile(next)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Update failed")
      }
    },
    [companyId],
  )

  if (!ready) {
    return (
      <BusinessShell activeNav="account">
        <p className="mt-8 text-brand-secondary">Loading…</p>
      </BusinessShell>
    )
  }

  if (!authenticated) {
    return <BusinessNoSession activeNav="account" reason="sign-in" />
  }

  if (!companyId) {
    return <BusinessNoSession activeNav="account" reason="onboarding" />
  }

  const companyName = profile?.name ?? "—"
  const address = profile?.businessAddress ?? "—"
  const hours =
    profile?.operatingHoursNote ??
    (profile?.workingHours && Object.keys(profile.workingHours).length > 0
      ? JSON.stringify(profile.workingHours)
      : "—")
  const perKm =
    profile?.pricePerKm != null ? `${formatNaira(profile.pricePerKm)} per km` : "—"
  const perKg =
    profile?.hasWeightPricing && profile.weightPricePerKg != null
      ? `${formatNaira(profile.weightPricePerKg)} per kg`
      : "Not set"
  const insurance =
    profile?.offersInsurance && profile.insuranceCoverageNaira != null
      ? `Up to ${formatNaira(profile.insuranceCoverageNaira)} coverage`
      : "Not offered"

  return (
    <BusinessShell activeNav="account">
      {error ? (
        <p className="mt-4 text-sm text-[#E11D48]" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-10">
        <h1 className="text-5xl font-bold text-brand-foreground">My Business Profile</h1>
      </div>

      <div className="mt-4 inline-flex items-end">
        <div className="flex size-28 items-center justify-center rounded-full border-4 border-brand-secondary bg-black">
          {profile?.logo ? (
            // Remote logo URLs from profile; skip Next image optimization domain config.
            // eslint-disable-next-line @next/next/no-img-element -- business-supplied arbitrary URL
            <img src={profile.logo} alt="" className="size-full rounded-full object-cover" />
          ) : (
            <span className="text-xs font-semibold text-white">Uptions</span>
          )}
        </div>
        <button
          type="button"
          className="-ml-4 inline-flex size-8 items-center justify-center rounded-full bg-white text-brand-secondary shadow"
          aria-label="Edit profile image"
          onClick={() => {
            const url = window.prompt("Logo image URL", profile?.logo ?? "")
            if (url === null) return
            void updateField({ logo: url.trim() || undefined })
          }}
        >
          <PencilLine className="size-4" />
        </button>
      </div>

      <section className="mt-8 space-y-5">
        <div>
          <h2 className="mb-2 text-3xl font-bold text-brand-foreground">General Information</h2>
          <div className="space-y-1">
            <ProfileRow title="Company Name" value={companyName} action="support" />
            <ProfileRow
              title="Address"
              value={address}
              action="edit"
              onEdit={() => {
                const next = window.prompt("Business address", address === "—" ? "" : address)
                if (next === null) return
                void updateField({ businessAddress: next })
              }}
            />
            <ProfileRow
              title="Operating Hours"
              value={hours}
              action="edit"
              onEdit={() => {
                const next = window.prompt("Operating hours note", hours === "—" ? "" : hours)
                if (next === null) return
                void updateField({ operatingHoursNote: next })
              }}
            />
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-3xl font-bold text-brand-foreground">My Pricing</h2>
          <div className="space-y-1">
            <ProfileRow
              title="Price per Distance"
              value={perKm}
              action="edit"
              onEdit={() => {
                const raw = window.prompt("Price per km (number)", String(profile?.pricePerKm ?? ""))
                if (raw === null) return
                const n = Number.parseFloat(raw)
                if (!Number.isFinite(n) || n < 0) return
                void updateField({ pricePerKm: n })
              }}
            />
            <ProfileRow
              title="Price per kg"
              value={perKg}
              action="edit"
              onEdit={() => {
                const raw = window.prompt("Price per kg (number)", String(profile?.weightPricePerKg ?? ""))
                if (raw === null) return
                const n = Number.parseFloat(raw)
                if (!Number.isFinite(n) || n < 0) return
                void updateField({ weightPricePerKg: n, hasWeightPricing: true })
              }}
            />
            <ProfileRow
              title="Insurance Coverage"
              value={insurance}
              action="edit"
              onEdit={() => {
                const raw = window.prompt("Insurance coverage in ₦ (0 to disable)", "5000")
                if (raw === null) return
                const n = Number.parseFloat(raw)
                if (!Number.isFinite(n) || n < 0) return
                void updateField({
                  offersInsurance: n > 0,
                  insuranceCoverageNaira: n,
                })
              }}
            />
          </div>
        </div>
      </section>
    </BusinessShell>
  )
}
