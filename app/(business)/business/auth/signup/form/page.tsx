"use client"

import { Circle, UploadCloud, X } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchBusinessMe, getBusinessAccessToken, setBusinessAccessToken } from "@/lib/business-auth"
import { submitBusinessOnboarding, uploadBusinessLogo } from "@/lib/business-api"
import { buildBusinessOnboardingPayload } from "@/lib/business-onboarding-payload"
import { saveBusinessSession } from "@/lib/business-session"
import {
  clearBusinessSignUpFormDraft,
  loadBusinessSignUpFormDraft,
  saveBusinessSignUpFormDraft,
} from "@/lib/business-signup-form-draft"
import { cn } from "@/lib/utils"

const inputClassName =
  "h-11 rounded-md border-brand-secondary/60 bg-[#EEF2F6] text-brand-foreground placeholder:text-brand-foreground/50 focus-visible:border-brand-secondary focus-visible:ring-2 focus-visible:ring-brand-secondary/25"

type Step = 0 | 1 | 2
type WeightPricingTier = { id: string; minKg: string; maxKg: string; pricePerKg: string }

const emptyWeightPricingTier = (): WeightPricingTier => ({
  id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
  minKg: "",
  maxKg: "",
  pricePerKg: "",
})

const deliveryCategories = ["Within a state", "State to state", "Both"] as const
const itemClasses = [
  "Small (Frames, clothes, documents, clothes)",
  "Medium (Shoes, clothes, electronics)",
  "Large (Furniture, appliances, equipment)",
  "All 3 classes",
] as const
const allItemClassesOption = "All 3 classes"
const chargeModes = ["Distance (per km)", "Weight (per kg)", "Distance + Weight"] as const
const businessExperienceOptions = [
  "0.5 years (6 months)",
  "1 year",
  "2 years",
  "3 years",
  "4 years",
  "5 years",
  "More than 5 years",
] as const

const weightGuide = [
  {
    range: "0.1 – 2 kg",
    examples: "Documents, clothing, small accessories",
    vehicle: "Bicycle, bike, or motorcycle",
  },
  {
    range: "2.1 – 5 kg",
    examples: "Shoes, small electronics, boxed parcels",
    vehicle: "Motorcycle, tricycle, or car",
  },
  {
    range: "5.1 – 10 kg",
    examples: "Medium electronics and compact appliances",
    vehicle: "Tricycle, car, or van",
  },
  {
    range: "10.1 kg and above",
    examples: "Furniture, large appliances, and bulk items",
    vehicle: "Van or truck",
  },
] as const

const weekDays = [
  { key: "sunday", short: "S" },
  { key: "monday", short: "M" },
  { key: "tuesday", short: "T" },
  { key: "wednesday", short: "W" },
  { key: "thursday", short: "T" },
  { key: "friday", short: "F" },
  { key: "saturday", short: "S" },
] as const

type HoursState = Record<(typeof weekDays)[number]["key"], { from: string; to: string }>

const defaultHours: HoursState = {
  sunday: { from: "", to: "" },
  monday: { from: "", to: "" },
  tuesday: { from: "", to: "" },
  wednesday: { from: "", to: "" },
  thursday: { from: "", to: "" },
  friday: { from: "", to: "" },
  saturday: { from: "", to: "" },
}

function formatOperatingHours(hours: HoursState) {
  return weekDays
    .filter((day) => hours[day.key].from && hours[day.key].to)
    .map((day) => `${day.key.slice(0, 3)} ${hours[day.key].from}–${hours[day.key].to}`)
    .join(", ")
}

function ChoicePill({
  label,
  active,
  onClick,
  tag,
  disabled = false,
}: {
  label: string
  active: boolean
  onClick: () => void
  tag: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-45",
        active
          ? "border-brand-secondary bg-[#d7eaff] text-brand-primary"
          : "border-brand-secondary/40 bg-[#cfe3f7]/70 text-brand-foreground hover:bg-[#d7eaff]",
      )}
    >
      <span
        className={cn(
          "inline-flex size-5 items-center justify-center rounded-sm text-xs font-semibold",
          active ? "bg-brand-secondary text-brand-white" : "bg-[#B4CCE6] text-brand-primary",
        )}
      >
        {tag}
      </span>
      {label}
    </button>
  )
}

function Progress({ step }: { step: Step }) {
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={cn(
            "h-1.5 w-14 rounded-full",
            index <= step ? "bg-brand-primary" : "bg-brand-foreground/25",
          )}
        />
      ))}
    </div>
  )
}

export default function BusinessSignUpFormPage() {
  const router = useRouter()
  const [authGate, setAuthGate] = useState<"pending" | "ready" | "redirect">("pending")
  const [draftAccountEmail, setDraftAccountEmail] = useState("")
  const [draftHydrated, setDraftHydrated] = useState(false)
  const [step, setStep] = useState<Step>(0)

  const [representativeName, setRepresentativeName] = useState("")
  const [representativeRole, setRepresentativeRole] = useState("")
  const [organizationName, setOrganizationName] = useState("")
  const [businessEmail, setBusinessEmail] = useState("")
  const [businessPhone, setBusinessPhone] = useState("")
  const [businessAddress, setBusinessAddress] = useState("")
  const [cacOrNin, setCacOrNin] = useState("")
  const [yearsInBusiness, setYearsInBusiness] = useState("")
  const [operatingNote, setOperatingNote] = useState("")

  const [uploadedLogoName, setUploadedLogoName] = useState("")
  const [uploadedLogoKey, setUploadedLogoKey] = useState("")
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [deliveryCategory, setDeliveryCategory] = useState<(typeof deliveryCategories)[number] | "">("")
  const [selectedItemClasses, setSelectedItemClasses] = useState<Array<(typeof itemClasses)[number]>>([])
  const [hours, setHours] = useState<HoursState>(defaultHours)

  const [chargeMode, setChargeMode] = useState<(typeof chargeModes)[number] | "">("")
  const [weightSensitive, setWeightSensitive] = useState<"yes" | "no" | "">("")
  const [weightPricingTiers, setWeightPricingTiers] = useState<WeightPricingTier[]>([emptyWeightPricingTier()])
  const [flatRatePerKm, setFlatRatePerKm] = useState("")
  const [hasInsurance, setHasInsurance] = useState<"yes" | "no" | "">("")
  const [showWeightGuide, setShowWeightGuide] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!getBusinessAccessToken()) {
      router.replace("/business/auth/signup")
      setAuthGate("redirect")
      return
    }
    void fetchBusinessMe()
      .then((me) => {
        if (me.companyId) {
          router.replace("/business/dashboard")
          setAuthGate("redirect")
          return
        }
        setBusinessEmail(me.email)
        setDraftAccountEmail(me.email)
        setAuthGate("ready")
      })
      .catch(() => {
        router.replace("/business/auth/signup")
        setAuthGate("redirect")
      })
  }, [router])

  useEffect(() => {
    if (authGate !== "ready" || !draftAccountEmail || draftHydrated) return
    const draft = loadBusinessSignUpFormDraft(draftAccountEmail)
    if (draft) {

      setStep(draft.step)
      setRepresentativeName(draft.representativeName)
      setRepresentativeRole(draft.representativeRole)
      setOrganizationName(draft.organizationName)
      setBusinessEmail(draftAccountEmail)
      setBusinessPhone(draft.businessPhone)
      setBusinessAddress(draft.businessAddress)
      setCacOrNin(draft.cacOrNin)
      setYearsInBusiness(draft.yearsInBusiness)
      setOperatingNote(draft.operatingNote)
      setUploadedLogoName(draft.uploadedLogoName)
      setUploadedLogoKey(draft.uploadedLogoKey)
      setDeliveryCategory(draft.deliveryCategory as (typeof deliveryCategories)[number] | "")
      setSelectedItemClasses(
        draft.itemClasses
          .filter((itemClass): itemClass is (typeof itemClasses)[number] =>
            itemClasses.includes(itemClass as (typeof itemClasses)[number]),
          )
          .slice(0, 2),
      )
      setHours(draft.hours)
      setChargeMode(draft.chargeMode as (typeof chargeModes)[number] | "")
      setWeightSensitive(draft.weightSensitive)
      const restoredWeightPricingTiers = (draft.weightPricingTiers ?? [])
        .filter(
          (tier): tier is WeightPricingTier =>
            Boolean(tier) &&
            typeof tier.minKg === "string" &&
            typeof tier.maxKg === "string" &&
            typeof tier.pricePerKg === "string",
        )
        .map((tier) => ({ ...tier, id: tier.id || emptyWeightPricingTier().id }))
      setWeightPricingTiers(
        restoredWeightPricingTiers.length
          ? restoredWeightPricingTiers
          : [{ ...emptyWeightPricingTier(), minKg: draft.weightPriceMin ?? "", maxKg: draft.weightPriceMax ?? "" }],
      )
      setFlatRatePerKm(draft.flatRatePerKm)
      setHasInsurance(draft.hasInsurance)
      setAcceptedTerms(draft.acceptedTerms)
    }
    setDraftHydrated(true)
  }, [authGate, draftAccountEmail, draftHydrated])

  useEffect(() => {
    setOperatingNote(formatOperatingHours(hours))
  }, [hours])

  useEffect(() => {
    if (authGate !== "ready" || !draftAccountEmail || !draftHydrated) return
    const draft = {
      v: 1 as const,
      step,
      representativeName,
      representativeRole,
      organizationName,
      businessEmail,
      businessPhone,
      businessAddress,
      cacOrNin,
      yearsInBusiness,
      operatingNote,
      uploadedLogoName,
      uploadedLogoKey,
      deliveryCategory,
      itemClasses: selectedItemClasses,
      hours,
      chargeMode,
      weightSensitive,
      weightPricingTiers,
      flatRatePerKm,
      hasInsurance,
      acceptedTerms,
    }
    const saveDraft = () => saveBusinessSignUpFormDraft(draftAccountEmail, draft)
    const timer = window.setTimeout(saveDraft, 750)
    window.addEventListener("pagehide", saveDraft)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("pagehide", saveDraft)
    }
  }, [
    acceptedTerms,
    authGate,
    businessAddress,
    businessEmail,
    businessPhone,
    cacOrNin,
    chargeMode,
    draftAccountEmail,
    draftHydrated,
    deliveryCategory,
    flatRatePerKm,
    hasInsurance,
    hours,
    selectedItemClasses,
    operatingNote,
    organizationName,
    representativeName,
    representativeRole,
    step,
    uploadedLogoName,
    uploadedLogoKey,
    weightPricingTiers,
    weightSensitive,
    yearsInBusiness,
  ])

  const canContinueStep1 = useMemo(
    () =>
      Boolean(
        representativeName.trim() &&
          representativeRole.trim() &&
          organizationName.trim() &&
          businessEmail.trim() &&
          businessPhone.replace(/\D/g, "").length >= 11 &&
          businessAddress.trim() &&
          cacOrNin.trim() &&
          yearsInBusiness.trim() &&
          weekDays.some((day) => hours[day.key].from && hours[day.key].to),
      ),
    [
      businessAddress,
      businessEmail,
      businessPhone,
      cacOrNin,
      hours,
      organizationName,
      representativeName,
      representativeRole,
      yearsInBusiness,
    ],
  )

  const canContinueStep2 = useMemo(() => {
    const hasHours = weekDays.some(
      (day) => hours[day.key].from.trim().length > 0 && hours[day.key].to.trim().length > 0,
    )
    return Boolean(uploadedLogoKey && !uploadingLogo && deliveryCategory && selectedItemClasses.length && hasHours)
  }, [deliveryCategory, hours, selectedItemClasses.length, uploadedLogoKey, uploadingLogo])

  const uploadSelectedLogo = useCallback(async (file: File | null) => {
    setLogoUploadError(null)
    if (!file) {
      setUploadedLogoName("")
      setUploadedLogoKey("")
      return
    }
    setUploadedLogoName(file.name)
    setUploadedLogoKey("")
    setUploadingLogo(true)
    try {
      const { key } = await uploadBusinessLogo(file)
      setUploadedLogoKey(key)
    } catch (error) {
      setLogoUploadError(error instanceof Error ? error.message : "Could not upload the logo")
    } finally {
      setUploadingLogo(false)
    }
  }, [])

  const canSubmit = useMemo(() => {
    const needsWeightPricing = weightSensitive === "yes" || chargeMode !== "Distance (per km)"
    const hasValidWeightTiers = !needsWeightPricing || weightPricingTiers.length > 0 && weightPricingTiers.every(
      (tier) =>
        typeof tier?.minKg === "string" &&
        typeof tier?.maxKg === "string" &&
        typeof tier?.pricePerKg === "string" &&
        tier.minKg.trim() && tier.maxKg.trim() && tier.pricePerKg.trim(),
    )
    return Boolean(chargeMode && weightSensitive && hasValidWeightTiers && flatRatePerKm.trim() && hasInsurance && acceptedTerms)
  }, [acceptedTerms, chargeMode, flatRatePerKm, hasInsurance, weightPricingTiers, weightSensitive])

  if (authGate !== "ready") {
    return (
      <div
        className="relative min-h-svh w-full bg-transparent bg-[url('/layer.svg')] bg-top bg-no-repeat [background-size:100%_auto]"
        data-landing-root
      >
        <main className="relative z-10 flex min-h-svh items-center justify-center px-6 text-brand-secondary">
          {authGate === "redirect" ? "Redirecting…" : "Loading…"}
        </main>
      </div>
    )
  }

  return (
    <div
      className="relative min-h-svh w-full bg-transparent bg-[url('/layer.svg')] bg-top bg-no-repeat [background-size:100%_auto]"
      data-landing-root
    >
      <main className="relative z-10 w-full px-4 pb-16 pt-10 md:px-6 md:pt-12" aria-label="Business onboarding form">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
          <Link
            href="/#why-us"
            className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(90deg,rgba(255,255,255,0.9)_0%,rgba(236,246,255,0.9)_42%,rgba(218,236,253,0.85)_100%)] px-4 py-3 shadow-[0_4px_28px_-6px_rgba(0,27,108,0.1),0_2px_10px_-4px_rgba(0,123,255,0.07)]"
            aria-label="Uptions home"
          >
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-brand-secondary text-brand-white">
              <Circle className="size-3 fill-current" />
            </span>
            <span className="text-3xl font-bold leading-none text-brand-primary">Uptions</span>
          </Link>

          <section className="mt-8 w-full max-w-2xl rounded-xl border border-[#9dc5e9] bg-white/70 p-5 shadow-[0_6px_30px_-20px_rgba(0,27,108,0.35)] backdrop-blur-sm md:p-8">
            <h1 className="text-center text-4xl font-bold text-brand-primary">Uptions Form</h1>
            <p className="mt-2 text-center text-sm text-brand-foreground/65">
              Your progress is saved automatically.
            </p>

            {step === 0 ? (
              <div className="mt-8 space-y-4">
                <Input
                  placeholder="Enter Representative Name"
                  className={inputClassName}
                  value={representativeName}
                  onChange={(event) => setRepresentativeName(event.target.value)}
                />
                <Input
                  placeholder="Enter Representative Role"
                  className={inputClassName}
                  value={representativeRole}
                  onChange={(event) => setRepresentativeRole(event.target.value)}
                />
                <Input
                  placeholder="Enter Organization Name"
                  className={inputClassName}
                  value={organizationName}
                  onChange={(event) => setOrganizationName(event.target.value)}
                />
                <Input
                  placeholder="Enter Official Business Email"
                  className={inputClassName}
                  value={businessEmail}
                  onChange={(event) => setBusinessEmail(event.target.value)}
                />
                <Input
                  type="tel"
                  placeholder="Enter Official Business Phone Number"
                  className={inputClassName}
                  value={businessPhone}
                  onChange={(event) =>
                    setBusinessPhone(
                      event.target.value
                        .replace(/[^\d+]/g, "")
                        .replace(/(?!^)\+/g, "")
                        .slice(0, 16),
                    )
                  }
                  inputMode="tel"
                  pattern="\+?[0-9]*"
                  maxLength={16}
                  autoComplete="tel"
                  aria-describedby="business-phone-help"
                />
                <p id="business-phone-help" className="-mt-2 text-xs text-brand-foreground/65">
                  Use digits only, with an optional + at the beginning (minimum 11 digits).
                </p>
                <Input
                  placeholder="Enter Official Business Address"
                  className={inputClassName}
                  value={businessAddress}
                  onChange={(event) => setBusinessAddress(event.target.value)}
                />
                <Input
                  placeholder="Kindly share your CAC (if register) or NIN (if not) For Verification"
                  className={inputClassName}
                  value={cacOrNin}
                  onChange={(event) => setCacOrNin(event.target.value)}
                />
                <div className="space-y-2">
                  <Label htmlFor="years-in-business" className="text-sm font-semibold text-brand-primary">
                    Years in business
                  </Label>
                  <select
                    id="years-in-business"
                    className={cn(inputClassName, "w-full px-3")}
                    value={yearsInBusiness}
                    onChange={(event) => setYearsInBusiness(event.target.value)}
                  >
                    <option value="" disabled>
                      Select years in business
                    </option>
                    {businessExperienceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3 rounded-lg border border-brand-secondary/30 bg-[#f7fbff] p-4">
                  <div>
                    <Label className="text-sm font-semibold text-brand-primary">Operating hours</Label>
                    <p className="mt-1 text-xs text-brand-foreground/65">
                      Choose the days you operate, then set your opening and closing times.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {weekDays.map((day) => {
                      const isOpen = Boolean(hours[day.key].from && hours[day.key].to)
                      return (
                        <div key={day.key} className="grid grid-cols-[88px_1fr_1fr] items-center gap-2">
                          <button
                            type="button"
                            aria-pressed={isOpen}
                            onClick={() =>
                              setHours((current) => ({
                                ...current,
                                [day.key]: isOpen ? { from: "", to: "" } : { from: "08:00", to: "17:00" },
                              }))
                            }
                            className={cn(
                              "h-9 rounded-md border px-2 text-sm font-medium transition-colors",
                              isOpen
                                ? "border-brand-secondary bg-brand-secondary text-brand-white"
                                : "border-brand-secondary/40 bg-white text-brand-primary hover:bg-[#e9f4ff]",
                            )}
                          >
                            {day.key.slice(0, 3).replace(/^./, (letter) => letter.toUpperCase())}
                          </button>
                          <Input
                            type="time"
                            aria-label={`${day.key} opening time`}
                            className={cn(inputClassName, "h-9 px-2 text-sm")}
                            disabled={!isOpen}
                            value={hours[day.key].from}
                            onChange={(event) =>
                              setHours((current) => ({
                                ...current,
                                [day.key]: { ...current[day.key], from: event.target.value },
                              }))
                            }
                          />
                          <Input
                            type="time"
                            aria-label={`${day.key} closing time`}
                            className={cn(inputClassName, "h-9 px-2 text-sm")}
                            disabled={!isOpen}
                            value={hours[day.key].to}
                            onChange={(event) =>
                              setHours((current) => ({
                                ...current,
                                [day.key]: { ...current[day.key], to: event.target.value },
                              }))
                            }
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={!canContinueStep1}
                  className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-lg bg-brand-secondary px-6 font-poppins text-base font-semibold text-brand-white transition-colors disabled:bg-[#D1D5DB] disabled:text-brand-foreground/50"
                >
                  Next
                </button>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="mt-8 space-y-5">
                <div className="space-y-2">
                  <Label className="text-xl font-semibold text-brand-primary">Upload business logo</Label>
                  <p className="text-xs text-brand-foreground">*Upload headshot if a solopreneur</p>
                </div>

                <div
                  className="rounded-lg border border-dashed border-brand-secondary/60 bg-white/60 p-8 text-center"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()
                    const [file] = Array.from(event.dataTransfer.files)
                    void uploadSelectedLogo(file ?? null)
                  }}
                >
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null
                      void uploadSelectedLogo(file)
                    }}
                  />
                  <UploadCloud className="mx-auto size-12 text-brand-secondary" />
                  <p className="mt-3 text-sm text-brand-foreground">Drag and drop your file here</p>
                  <p className="mt-1 text-xs text-brand-foreground/60">
                    Accepted formats: JPG, PNG
                  </p>
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="mt-4 inline-flex h-8 items-center rounded-md bg-brand-secondary px-4 text-xs font-semibold text-brand-white"
                  >
                    Upload
                  </button>
                  {uploadingLogo ? <p className="mt-3 text-xs font-medium text-brand-primary">Uploading logo…</p> : null}
                  {uploadedLogoName && uploadedLogoKey ? (
                    <p className="mt-3 text-xs font-medium text-brand-primary">Saved: {uploadedLogoName}</p>
                  ) : null}
                  {logoUploadError ? <p className="mt-3 text-xs font-medium text-[#E11D48]">{logoUploadError}</p> : null}
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold text-brand-primary">Select a delivery category</Label>
                  <div className="flex flex-wrap gap-2">
                    {deliveryCategories.map((option, index) => (
                      <ChoicePill
                        key={option}
                        tag={String.fromCharCode(65 + index)}
                        label={option}
                        active={deliveryCategory === option}
                        onClick={() => setDeliveryCategory(option)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold text-brand-primary">What type of items do you deliver?</Label>
                  <p className="text-xs text-brand-foreground/65">
                    Select up to two item classes, or choose All 3 classes.
                  </p>
                  <div className="flex flex-col gap-2">
                    {itemClasses.map((option, index) => (
                      <ChoicePill
                        key={option}
                        tag={String.fromCharCode(65 + index)}
                        label={option}
                        active={selectedItemClasses.includes(option)}
                        disabled={
                          !selectedItemClasses.includes(option) &&
                          option !== allItemClassesOption &&
                          !selectedItemClasses.includes(allItemClassesOption) &&
                          selectedItemClasses.length >= 2
                        }
                        onClick={() =>
                          setSelectedItemClasses((current) =>
                            option === allItemClassesOption
                              ? current.includes(option)
                                ? []
                                : [option]
                              : current.includes(option)
                                ? current.filter((itemClass) => itemClass !== option)
                                : current.includes(allItemClassesOption)
                                  ? [option]
                                  : current.length < 2
                                    ? [...current, option]
                                    : current,
                          )
                        }
                      />
                    ))}
                  </div>
                </div>


                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="inline-flex h-12 items-center justify-center rounded-lg border border-brand-secondary/40 bg-white px-6 font-poppins text-base font-semibold text-brand-primary transition-colors hover:bg-[#eef5ff]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!canContinueStep2}
                    className="inline-flex h-12 items-center justify-center rounded-lg bg-brand-secondary px-6 font-poppins text-base font-semibold text-brand-white transition-colors disabled:bg-[#D1D5DB] disabled:text-brand-foreground/50"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="mt-8 space-y-5">
                <div>
                  <h2 className="text-3xl font-bold text-brand-primary">Pricing Details</h2>
                  <p className="mt-2 text-sm text-brand-foreground">
                    When setting delivery prices we understand that three factors may apply:
                    distance, weight/size, and urgency (optional). Here&apos;s a walkthrough:
                    <br />- For weight + distance pricing, the final cost is the sum of both.
                    <br />- For distance-only pricing, the final cost is based on distance alone.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold text-brand-primary">How do you charge?</Label>
                  <div className="flex flex-col gap-2">
                    {chargeModes.map((option, index) => (
                      <ChoicePill
                        key={option}
                        tag={String.fromCharCode(65 + index)}
                        label={option}
                        active={chargeMode === option}
                        onClick={() => setChargeMode(option)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold text-brand-primary">
                    Does the weight or size of an item affect your price?
                  </Label>
                  <div className="flex gap-2">
                    <ChoicePill
                      tag="A"
                      label="Yes"
                      active={weightSensitive === "yes"}
                      onClick={() => setWeightSensitive("yes")}
                    />
                    <ChoicePill
                      tag="B"
                      label="No"
                      active={weightSensitive === "no"}
                      onClick={() => setWeightSensitive("no")}
                    />
                  </div>
                </div>

                <div className="rounded-md border border-brand-secondary/40 bg-[#eaf3ff] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-brand-primary">Set weight bands and prices</span>
                    <button
                      type="button"
                      onClick={() => setShowWeightGuide(true)}
                      className="text-sm font-semibold text-brand-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/40"
                    >
                      see weight guide
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {weightPricingTiers.map((tier, index) => (
                      <div key={tier.id} className="flex flex-wrap items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          inputMode="decimal"
                          aria-label={`Weight band ${index + 1} minimum kilograms`}
                          className={cn(inputClassName, "h-9 w-28")}
                          placeholder="From kg"
                          value={tier.minKg}
                          onChange={(event) => setWeightPricingTiers((tiers) => tiers.map((item) => item.id === tier.id ? { ...item, minKg: event.target.value } : item))}
                        />
                        <span className="text-sm text-brand-foreground">to</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          inputMode="decimal"
                          aria-label={`Weight band ${index + 1} maximum kilograms`}
                          className={cn(inputClassName, "h-9 w-28")}
                          placeholder="To kg"
                          value={tier.maxKg}
                          onChange={(event) => setWeightPricingTiers((tiers) => tiers.map((item) => item.id === tier.id ? { ...item, maxKg: event.target.value } : item))}
                        />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          inputMode="decimal"
                          aria-label={`Weight band ${index + 1} price per kilogram`}
                          className={cn(inputClassName, "h-9 w-28")}
                          placeholder="₦ / kg"
                          value={tier.pricePerKg}
                          onChange={(event) => setWeightPricingTiers((tiers) => tiers.map((item) => item.id === tier.id ? { ...item, pricePerKg: event.target.value } : item))}
                        />
                        {weightPricingTiers.length > 1 ? (
                          <button type="button" onClick={() => setWeightPricingTiers((tiers) => tiers.filter((item) => item.id !== tier.id))} className="text-sm font-semibold text-red-600 hover:underline">
                            Remove
                          </button>
                        ) : null}
                      </div>
                    ))}
                    <button type="button" onClick={() => setWeightPricingTiers((tiers) => [...tiers, emptyWeightPricingTier()])} className="text-sm font-semibold text-brand-secondary hover:underline">
                      + Add another weight band
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold text-brand-primary">
                    What is your flat rate charge per kilometer (km)?
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    placeholder="Enter amount"
                    className={inputClassName}
                    value={flatRatePerKm}
                    onChange={(event) => setFlatRatePerKm(event.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold text-brand-primary">Do you cover item insurance?</Label>
                  <div className="flex gap-2">
                    <ChoicePill
                      tag="A"
                      label="Yes"
                      active={hasInsurance === "yes"}
                      onClick={() => setHasInsurance("yes")}
                    />
                    <ChoicePill
                      tag="B"
                      label="No"
                      active={hasInsurance === "no"}
                      onClick={() => setHasInsurance("no")}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-brand-foreground">
                  <Checkbox
                    checked={acceptedTerms}
                    onCheckedChange={(value) => setAcceptedTerms(Boolean(value))}
                    aria-label="Agree to the terms and conditions"
                    className="size-5 border-2 border-brand-secondary bg-white text-brand-white shadow-sm data-[state=checked]:border-brand-secondary data-[state=checked]:bg-brand-secondary"
                  />
                  I agree to the terms and conditions
                </label>

                {submitError ? (
                  <p className="text-sm text-[#E11D48]" role="alert">
                    {submitError}
                  </p>
                ) : null}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex h-12 items-center justify-center rounded-lg border border-brand-secondary/40 bg-white px-6 font-poppins text-base font-semibold text-brand-primary transition-colors hover:bg-[#eef5ff]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void (async () => {
                        if (!canSubmit || submitting) return
                        setSubmitError(null)
                        setSubmitting(true)
                        try {
                          if (weightSensitive !== "yes" && weightSensitive !== "no") {
                            throw new Error("Select whether weight affects your pricing")
                          }
                          if (hasInsurance !== "yes" && hasInsurance !== "no") {
                            throw new Error("Select whether you offer insurance")
                          }
                          if (!uploadedLogoKey) {
                            throw new Error("Please wait for your logo upload to finish")
                          }
                          const payload = buildBusinessOnboardingPayload({
                            representativeName,
                            representativeRole,
                            organizationName,
                            businessEmail,
                            businessPhone,
                            businessAddress,
                            cacOrNin,
                            yearsInBusiness,
                            operatingHoursNote: operatingNote,
                            uploadedLogoName: uploadedLogoKey,
                            deliveryCategoryUi: deliveryCategory,
                            itemClasses: selectedItemClasses,
                            hours,
                            chargeModeUi: chargeMode,
                            weightSensitive: weightSensitive as "yes" | "no",
                            weightPricingTiers,
                            flatRatePerKm,
                            hasInsurance: hasInsurance as "yes" | "no",
                            acceptedTerms,
                          })
                          const res = await submitBusinessOnboarding(payload)
                          if (res.accessToken) {
                            setBusinessAccessToken(res.accessToken)
                          }
                          saveBusinessSession({
                            v: 1,
                            companyId: res.companyId,
                            businessName: organizationName.trim(),
                          })
                          clearBusinessSignUpFormDraft(draftAccountEmail)
                          router.push("/business/dashboard?welcome=1")
                        } catch (err) {
                          setSubmitError(err instanceof Error ? err.message : "Submission failed")
                        } finally {
                          setSubmitting(false)
                        }
                      })()
                    }}
                    disabled={!canSubmit || submitting}
                    className="inline-flex h-12 items-center justify-center rounded-lg bg-brand-secondary px-6 font-poppins text-base font-semibold text-brand-white transition-colors disabled:bg-[#D1D5DB] disabled:text-brand-foreground/50"
                  >
                    {submitting ? "Submitting…" : "Submit"}
                  </button>
                </div>
              </div>
            ) : null}

            {showWeightGuide && typeof document !== "undefined" ? createPortal(
              <div
                className="fixed inset-0 z-50 grid place-items-center bg-brand-foreground/45 p-4"
                role="presentation"
                onMouseDown={() => setShowWeightGuide(false)}
              >
                <section
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="weight-guide-title"
                  className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 id="weight-guide-title" className="text-2xl font-bold text-brand-primary">
                        Delivery weight guide
                      </h2>
                      <p className="mt-1 text-sm text-brand-foreground/70">
                        Use these ranges as a practical guide when setting your per-kilogram price.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowWeightGuide(false)}
                      className="grid size-9 shrink-0 place-items-center rounded-md text-brand-foreground/70 hover:bg-brand-secondary/10 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/40"
                      aria-label="Close weight guide"
                    >
                      <X className="size-5" aria-hidden />
                    </button>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-lg border border-brand-secondary/25">
                    {weightGuide.map((entry) => (
                      <div
                        key={entry.range}
                        className="grid gap-1 border-b border-brand-secondary/15 p-3 last:border-b-0 sm:grid-cols-[110px_1fr] sm:gap-x-4"
                      >
                        <span className="font-semibold text-brand-primary">{entry.range}</span>
                        <div className="text-sm text-brand-foreground">
                          <p>{entry.examples}</p>
                          <p className="mt-1 text-brand-foreground/65">Suggested vehicle: {entry.vehicle}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowWeightGuide(false)}
                    className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-lg bg-brand-secondary px-4 font-semibold text-brand-white hover:bg-brand-secondary/90"
                  >
                    Got it
                  </button>
                </section>
              </div>
            , document.body) : null}

            <Progress step={step} />
          </section>
        </div>
      </main>
    </div>
  )
}

