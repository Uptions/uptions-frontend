"use client"

import { PencilLine } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { BusinessShell } from "@/components/business/business-shell"
import { BusinessNoSession } from "@/components/business/business-no-session"
import { formatNaira, getBusinessProfile, patchBusinessProfile, uploadBusinessLogo, type BusinessProfile } from "@/lib/business-api"
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

type EditableField = "name" | "businessAddress" | "operatingHoursNote" | "pricePerKm" | "weightPricePerKg" | "insuranceCoverageNaira"
type EditDialogState = { field: EditableField; title: string; value: string; numeric?: boolean } | null

function ProfileEditDialog({
  edit,
  onClose,
  onSave,
}: {
  edit: NonNullable<EditDialogState>
  onClose: () => void
  onSave: (value: string) => void
}) {
  const [value, setValue] = useState(edit.value)
  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-brand-foreground/45 p-4" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-labelledby="profile-edit-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <h2 id="profile-edit-title" className="text-xl font-bold text-brand-primary">Edit {edit.title}</h2>
        <label className="mt-5 block text-sm font-semibold text-brand-foreground" htmlFor="profile-edit-value">{edit.title}</label>
        {edit.field === "operatingHoursNote" ? (
          <textarea id="profile-edit-value" value={value} onChange={(event) => setValue(event.target.value)} className="mt-2 min-h-28 w-full rounded-lg border border-brand-secondary/40 p-3 text-brand-foreground focus:outline-none focus:ring-2 focus:ring-brand-secondary/30" />
        ) : (
          <input id="profile-edit-value" type={edit.numeric ? "number" : "text"} min={edit.numeric ? "0" : undefined} step={edit.numeric ? "0.01" : undefined} value={value} onChange={(event) => setValue(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-brand-secondary/40 px-3 text-brand-foreground focus:outline-none focus:ring-2 focus:ring-brand-secondary/30" />
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="h-10 rounded-lg border border-brand-secondary/40 px-4 font-semibold text-brand-primary">Cancel</button>
          <button type="button" onClick={() => onSave(value)} className="h-10 rounded-lg bg-brand-secondary px-4 font-semibold text-white">Save changes</button>
        </div>
      </section>
    </div>,
    document.body,
  )
}

export default function BusinessAccountPage() {
  const { ready, authenticated, companyId } = useBusinessSession()
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoLoadFailed, setLogoLoadFailed] = useState(false)
  const [editing, setEditing] = useState<EditDialogState>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    setLogoLoadFailed(false)
  }, [profile?.logo])

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

  const saveEdit = (value: string) => {
    if (!editing) return
    if (editing.numeric) {
      const numberValue = Number.parseFloat(value)
      if (!Number.isFinite(numberValue) || numberValue < 0) {
        setError("Enter a valid non-negative amount")
        return
      }
      if (editing.field === "pricePerKm") void updateField({ pricePerKm: numberValue })
      if (editing.field === "weightPricePerKg") void updateField({ weightPricePerKg: numberValue, hasWeightPricing: true })
      if (editing.field === "insuranceCoverageNaira") void updateField({ offersInsurance: numberValue > 0, insuranceCoverageNaira: numberValue })
    } else if (value.trim()) {
      if (editing.field === "name") void updateField({ name: value.trim() })
      if (editing.field === "businessAddress") void updateField({ businessAddress: value.trim() })
      if (editing.field === "operatingHoursNote") void updateField({ operatingHoursNote: value.trim() })
    }
    setEditing(null)
  }

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
          {profile?.logo && !logoLoadFailed ? (
            // Remote logo URLs from profile; skip Next image optimization domain config.
            // eslint-disable-next-line @next/next/no-img-element -- business-supplied arbitrary URL
            <img
              src={profile.logo}
              alt=""
              className="size-full rounded-full object-cover"
              onError={() => setLogoLoadFailed(true)}
            />
          ) : (
            <span className="text-3xl font-semibold text-white">{companyName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return
            setError(null)
            setUploadingLogo(true)
            void uploadBusinessLogo(file)
              .then(({ key }) => updateField({ logo: key }))
              .catch((err) => setError(err instanceof Error ? err.message : "Could not upload logo"))
              .finally(() => {
                setUploadingLogo(false)
                event.target.value = ""
              })
          }}
        />
        <button
          type="button"
          disabled={uploadingLogo}
          className="-ml-4 inline-flex size-8 items-center justify-center rounded-full bg-white text-brand-secondary shadow disabled:opacity-50"
          aria-label="Edit profile image"
          onClick={() => logoInputRef.current?.click()}
        >
          <PencilLine className="size-4" />
        </button>
      </div>

      <section className="mt-8 space-y-5">
        <div>
          <h2 className="mb-2 text-3xl font-bold text-brand-foreground">General Information</h2>
          <div className="space-y-1">
            <ProfileRow
              title="Company Name"
              value={companyName}
              action="edit"
              onEdit={() => setEditing({ field: "name", title: "Company Name", value: companyName === "—" ? "" : companyName })}
            />
            <ProfileRow
              title="Address"
              value={address}
              action="edit"
              onEdit={() => setEditing({ field: "businessAddress", title: "Address", value: address === "—" ? "" : address })}
            />
            <ProfileRow
              title="Operating Hours"
              value={hours}
              action="edit"
              onEdit={() => setEditing({ field: "operatingHoursNote", title: "Operating Hours", value: hours === "—" ? "" : hours })}
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
              onEdit={() => setEditing({ field: "pricePerKm", title: "Price per Distance", value: String(profile?.pricePerKm ?? ""), numeric: true })}
            />
            <ProfileRow
              title="Price per kg"
              value={perKg}
              action="edit"
              onEdit={() => setEditing({ field: "weightPricePerKg", title: "Price per kg", value: String(profile?.weightPricePerKg ?? ""), numeric: true })}
            />
            <ProfileRow
              title="Insurance Coverage"
              value={insurance}
              action="edit"
              onEdit={() => setEditing({ field: "insuranceCoverageNaira", title: "Insurance Coverage (₦0 disables coverage)", value: String(profile?.insuranceCoverageNaira ?? 0), numeric: true })}
            />
          </div>
        </div>
      </section>
      {editing ? <ProfileEditDialog edit={editing} onClose={() => setEditing(null)} onSave={saveEdit} /> : null}
    </BusinessShell>
  )
}
