"use client"

import { Check, Circle, Clock3, UploadCloud, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchBusinessMe, getBusinessAccessToken, setBusinessAccessToken } from "@/lib/business-auth"
import { submitBusinessOnboarding } from "@/lib/business-api"
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

const deliveryCategories = ["Within a state", "State to state", "Both"] as const
const itemClasses = [
  "Small (Frames, clothes, documents, clothes)",
  "Medium (Shoes, clothes, electronics)",
  "Large (Furniture, appliances, equipment)",
  "All 3 classes",
] as const
const chargeModes = ["Distance (per km)", "Weight (per kg)", "Distance + Weight"] as const

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
  sunday: { from: "12:00", to: "12:00" },
  monday: { from: "12:00", to: "12:00" },
  tuesday: { from: "12:00", to: "12:00" },
  wednesday: { from: "12:00", to: "12:00" },
  thursday: { from: "12:00", to: "12:00" },
  friday: { from: "12:00", to: "12:00" },
  saturday: { from: "12:00", to: "12:00" },
}

function ChoicePill({
  label,
  active,
  onClick,
  tag,
}: {
  label: string
  active: boolean
  onClick: () => void
  tag: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm transition-colors",
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
  const [deliveryCategory, setDeliveryCategory] = useState<(typeof deliveryCategories)[number] | "">("")
  const [itemClass, setItemClass] = useState<(typeof itemClasses)[number] | "">("")
  const [hours, setHours] = useState<HoursState>(defaultHours)

  const [chargeMode, setChargeMode] = useState<(typeof chargeModes)[number] | "">("")
  const [weightSensitive, setWeightSensitive] = useState<"yes" | "no" | "">("")
  const [weightPriceMin, setWeightPriceMin] = useState("")
  const [weightPriceMax, setWeightPriceMax] = useState("")
  const [flatRatePerKm, setFlatRatePerKm] = useState("")
  const [hasInsurance, setHasInsurance] = useState<"yes" | "no" | "">("")
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
        setBusinessEmail((prev) => (prev.trim() ? prev : me.email))
        setAuthGate("ready")
      })
      .catch(() => {
        router.replace("/business/auth/signup")
        setAuthGate("redirect")
      })
  }, [router])

  useEffect(() => {
    if (authGate !== "ready") return
    queueMicrotask(() => {
      const draft = loadBusinessSignUpFormDraft()
      if (!draft) return

      setStep(draft.step)
      setRepresentativeName(draft.representativeName)
      setRepresentativeRole(draft.representativeRole)
      setOrganizationName(draft.organizationName)
      setBusinessEmail(draft.businessEmail)
      setBusinessPhone(draft.businessPhone)
      setBusinessAddress(draft.businessAddress)
      setCacOrNin(draft.cacOrNin)
      setYearsInBusiness(draft.yearsInBusiness)
      setOperatingNote(draft.operatingNote)
      setUploadedLogoName(draft.uploadedLogoName)
      setDeliveryCategory(draft.deliveryCategory as (typeof deliveryCategories)[number] | "")
      setItemClass(draft.itemClass as (typeof itemClasses)[number] | "")
      setHours(draft.hours)
      setChargeMode(draft.chargeMode as (typeof chargeModes)[number] | "")
      setWeightSensitive(draft.weightSensitive)
      setWeightPriceMin(draft.weightPriceMin)
      setWeightPriceMax(draft.weightPriceMax)
      setFlatRatePerKm(draft.flatRatePerKm)
      setHasInsurance(draft.hasInsurance)
      setAcceptedTerms(draft.acceptedTerms)
    })
  }, [authGate])

  useEffect(() => {
    if (authGate !== "ready") return
    saveBusinessSignUpFormDraft({
      v: 1,
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
      deliveryCategory,
      itemClass,
      hours,
      chargeMode,
      weightSensitive,
      weightPriceMin,
      weightPriceMax,
      flatRatePerKm,
      hasInsurance,
      acceptedTerms,
    })
  }, [
    acceptedTerms,
    authGate,
    businessAddress,
    businessEmail,
    businessPhone,
    cacOrNin,
    chargeMode,
    deliveryCategory,
    flatRatePerKm,
    hasInsurance,
    hours,
    itemClass,
    operatingNote,
    organizationName,
    representativeName,
    representativeRole,
    step,
    uploadedLogoName,
    weightPriceMax,
    weightPriceMin,
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
          businessPhone.trim() &&
          businessAddress.trim() &&
          cacOrNin.trim() &&
          yearsInBusiness.trim() &&
          operatingNote.trim(),
      ),
    [
      businessAddress,
      businessEmail,
      businessPhone,
      cacOrNin,
      operatingNote,
      organizationName,
      representativeName,
      representativeRole,
      yearsInBusiness,
    ],
  )

  const canContinueStep2 = useMemo(() => {
    const hasHours = weekDays.every(
      (day) => hours[day.key].from.trim().length > 0 && hours[day.key].to.trim().length > 0,
    )
    return Boolean(uploadedLogoName && deliveryCategory && itemClass && hasHours)
  }, [deliveryCategory, hours, itemClass, uploadedLogoName])

  const canSubmit = useMemo(() => {
    const hasWeightRange =
      weightSensitive === "no" || (weightPriceMin.trim().length > 0 && weightPriceMax.trim().length > 0)
    return Boolean(chargeMode && weightSensitive && hasWeightRange && flatRatePerKm.trim() && hasInsurance && acceptedTerms)
  }, [acceptedTerms, chargeMode, flatRatePerKm, hasInsurance, weightPriceMax, weightPriceMin, weightSensitive])

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
                  placeholder="Enter Official Business Phone Number"
                  className={inputClassName}
                  value={businessPhone}
                  onChange={(event) => setBusinessPhone(event.target.value)}
                />
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
                <Input
                  placeholder="How many years have you been in business?"
                  className={inputClassName}
                  value={yearsInBusiness}
                  onChange={(event) => setYearsInBusiness(event.target.value)}
                />
                <Input
                  placeholder="What are your Operating Hours ?"
                  className={inputClassName}
                  value={operatingNote}
                  onChange={(event) => setOperatingNote(event.target.value)}
                />

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
                  <Label className="text-xl font-semibold text-brand-primary">Business Details</Label>
                  <Input
                    placeholder="Upload Business Logo"
                    className={inputClassName}
                    value={uploadedLogoName}
                    onChange={(event) => setUploadedLogoName(event.target.value)}
                  />
                  <p className="text-xs text-brand-foreground">*Upload headshot if a solopreneur</p>
                </div>

                <div className="rounded-lg border border-dashed border-brand-secondary/60 bg-white/60 p-8 text-center">
                  <UploadCloud className="mx-auto size-12 text-brand-secondary" />
                  <p className="mt-3 text-sm text-brand-foreground">Drag and drop your file here</p>
                  <p className="mt-1 text-xs text-brand-foreground/60">
                    Accepted formats: JPG, PNG
                  </p>
                  <button
                    type="button"
                    className="mt-4 inline-flex h-8 items-center rounded-md bg-brand-secondary px-4 text-xs font-semibold text-brand-white"
                  >
                    Upload
                  </button>
                </div>

                <div className="space-y-3">
                  <Input placeholder="Select a Delivery Category" className={inputClassName} />
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
                  <Input placeholder="What type of items do you deliver?" className={inputClassName} />
                  <div className="flex flex-col gap-2">
                    {itemClasses.map((option, index) => (
                      <ChoicePill
                        key={option}
                        tag={String.fromCharCode(65 + index)}
                        label={option}
                        active={itemClass === option}
                        onClick={() => setItemClass(option)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Input placeholder="Input working hours" className={inputClassName} />
                  <div className="space-y-2">
                    {weekDays.map((day) => (
                      <div key={day.key} className="flex items-center gap-3">
                        <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand-primary text-xs font-semibold text-brand-white">
                          {day.short}
                        </span>
                        <Input
                          className={cn(inputClassName, "h-9 w-24")}
                          value={hours[day.key].from}
                          onChange={(event) =>
                            setHours((current) => ({
                              ...current,
                              [day.key]: { ...current[day.key], from: event.target.value },
                            }))
                          }
                        />
                        <span className="text-sm text-brand-foreground/70">-</span>
                        <Input
                          className={cn(inputClassName, "h-9 w-24")}
                          value={hours[day.key].to}
                          onChange={(event) =>
                            setHours((current) => ({
                              ...current,
                              [day.key]: { ...current[day.key], to: event.target.value },
                            }))
                          }
                        />
                        <X className="size-4 text-brand-foreground/50" />
                        <Clock3 className="size-4 text-brand-foreground/50" />
                        <Check className="size-4 text-brand-foreground/50" />
                      </div>
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
                  <Input placeholder="How do you charge?" className={inputClassName} />
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
                  <Input
                    placeholder="Does the weight or size of an item affect influence your price?"
                    className={inputClassName}
                  />
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
                    <span className="text-sm text-brand-foreground">Provide your weight price per kg</span>
                    <button type="button" className="text-sm font-semibold text-brand-secondary hover:underline">
                      see weight guide
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Input
                      className={cn(inputClassName, "h-9 w-24")}
                      placeholder="1kg"
                      value={weightPriceMin}
                      onChange={(event) => setWeightPriceMin(event.target.value)}
                    />
                    <span className="text-brand-foreground">to</span>
                    <Input
                      className={cn(inputClassName, "h-9 w-24")}
                      placeholder="2kg"
                      value={weightPriceMax}
                      onChange={(event) => setWeightPriceMax(event.target.value)}
                    />
                  </div>
                </div>

                <Input
                  placeholder="What is your flat rate charge per kilometer (km)"
                  className={inputClassName}
                  value={flatRatePerKm}
                  onChange={(event) => setFlatRatePerKm(event.target.value)}
                />

                <div className="space-y-3">
                  <Input placeholder="Do you cover item insurance" className={inputClassName} />
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
                            uploadedLogoName,
                            deliveryCategoryUi: deliveryCategory,
                            itemClass,
                            hours,
                            chargeModeUi: chargeMode,
                            weightSensitive: weightSensitive as "yes" | "no",
                            weightPriceMin,
                            weightPriceMax,
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
                          clearBusinessSignUpFormDraft()
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

            <Progress step={step} />
          </section>
        </div>
      </main>
    </div>
  )
}

