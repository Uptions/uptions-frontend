"use client"

import * as React from "react"
import { ChevronRight, LoaderCircle, MapPin } from "lucide-react"
import { isRedirectError } from "next/dist/client/components/redirect-error"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import { submitFindUptionFormAction } from "@/app/actions/checkout-flow-actions"
import {
  clearFindFormDraft,
  loadFindFormDraft,
  saveFindFormDraft,
  type FindFormDraftV1,
} from "@/lib/find-form-draft"
import { type DeliveryQuoteRequest } from "@/lib/delivery-quotes"

import { NIGERIAN_STATES } from "./nigerian-states"
import { PACKAGE_WEIGHT_CLASSES } from "./package-options"

type PartyDetails = {
  name: string
  email: string
  phone: string
  address: string
  state: string
}

const emptyParty = (): PartyDetails => ({
  name: "",
  email: "",
  phone: "",
  address: "",
  state: "",
})

function isValidEmail(email: string) {
  const t = email.trim()
  if (!t) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)
}

function isPartyComplete(p: PartyDetails): boolean {
  const phoneDigits = p.phone.replace(/\D/g, "")
  return (
    p.name.trim().length > 0 &&
    isValidEmail(p.email) &&
    phoneDigits.length >= 11 &&
    p.address.trim().length > 0 &&
    p.state.trim().length > 0
  )
}

function isValidNairaValue(raw: string): boolean {
  const n = raw.replace(/[,\s]/g, "")
  if (!/^\d+$/.test(n)) return false
  const num = Number(n)
  return Number.isFinite(num) && num > 0
}

function addressesMatch(first: string, second: string): boolean {
  const normalize = (address: string) =>
    address
      .normalize("NFKD")
      .toLocaleLowerCase("en-NG")
      .replace(/[^\p{L}\p{N}]/gu, "")

  const normalizedFirst = normalize(first)
  return normalizedFirst.length > 0 && normalizedFirst === normalize(second)
}

function matchNigerianState(value?: string): string | undefined {
  if (!value) return undefined
  const normalized = value.trim().toLocaleLowerCase("en-NG")
  if (normalized.includes("federal capital") || normalized === "fct") return "FCT"
  return NIGERIAN_STATES.find((state) => state.toLocaleLowerCase("en-NG") === normalized)
}

const PROGRESS_SEGMENTS = 3

function progressFilledSegments(step: 1 | 2 | 3): number {
  if (step === 1) return 1
  if (step === 2) return 2
  return 3
}

const inputFieldClass =
  "h-11 rounded-lg border-brand-secondary/90 bg-[#EEF2F6] text-brand-foreground shadow-none placeholder:text-brand-foreground/45 focus-visible:border-brand-secondary focus-visible:ring-2 focus-visible:ring-brand-secondary/25 md:h-11"

const selectTriggerClass =
  "h-11 w-full rounded-lg border-brand-secondary/90 bg-[#EEF2F6] text-brand-foreground shadow-none focus-visible:border-brand-secondary focus-visible:ring-2 focus-visible:ring-brand-secondary/25 [&_svg]:text-brand-secondary"

function AddressField({
  id,
  label,
  value,
  onChange,
  onLocationResolved,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  onLocationResolved: (location: { address: string; state?: string }) => void
  placeholder: string
}) {
  const [showHint, setShowHint] = React.useState(true)
  const [isLocating, setIsLocating] = React.useState(false)
  const [locationError, setLocationError] = React.useState("")

  React.useEffect(() => {
    const timeout = window.setTimeout(() => setShowHint(false), 5_000)
    return () => window.clearTimeout(timeout)
  }, [])

  async function useCurrentLocation() {
    setLocationError("")
    if (!navigator.geolocation) {
      setLocationError("Your browser does not support location services.")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(
            `/api/reverse-geocode?lat=${encodeURIComponent(coords.latitude)}&lon=${encodeURIComponent(coords.longitude)}`,
            { cache: "no-store" },
          )
          const payload: unknown = await response.json()
          if (!response.ok || !payload || typeof payload !== "object" || !("address" in payload) || typeof payload.address !== "string") {
            throw new Error("We could not find an address for your current location.")
          }
          onLocationResolved({
            address: payload.address,
            state: "state" in payload && typeof payload.state === "string" ? payload.state : undefined,
          })
          setShowHint(false)
        } catch (error) {
          setLocationError(error instanceof Error ? error.message : "We could not look up your current location.")
        } finally {
          setIsLocating(false)
        }
      },
      (error) => {
        setIsLocating(false)
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. Please allow it and try again."
            : "We could not get your current location. Please try again.",
        )
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-brand-primary">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="street-address"
          className={cn(inputFieldClass, "pr-11")}
        />
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={isLocating}
          aria-label={`Use my current location for ${label.toLowerCase()}`}
          aria-describedby={showHint ? `${id}-location-hint` : undefined}
          className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-brand-secondary transition-colors hover:bg-brand-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/40 disabled:cursor-wait disabled:opacity-60"
        >
          {isLocating ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <MapPin className="size-5" aria-hidden />}
        </button>
        {showHint ? (
          <span
            id={`${id}-location-hint`}
            role="tooltip"
            className="absolute right-0 top-[calc(100%+0.45rem)] z-20 w-56 rounded-md bg-brand-primary px-3 py-2 text-xs font-medium leading-snug text-white shadow-lg"
          >
            Click this icon to use your current location.
          </span>
        ) : null}
      </div>
      {locationError ? <p className="text-sm text-red-600" role="alert">{locationError}</p> : null}
    </div>
  )
}

function StateSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-brand-primary">
        {label}
      </Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger id={id} className={selectTriggerClass}>
          <SelectValue placeholder="Select state" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {NIGERIAN_STATES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function PackageSelect({
  id,
  label,
  labelClassName,
  value,
  onChange,
  placeholder,
  options,
}: {
  id: string
  label: string
  labelClassName?: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  options: readonly string[]
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={labelClassName ?? "text-brand-primary"}>
        {label}
      </Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger id={id} className={selectTriggerClass}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

const textareaFieldClass = cn(
  inputFieldClass,
  "min-h-[6.5rem] resize-y py-2.5 md:min-h-[7rem]",
)

export function FindAnUptionForm() {
  const [isPending, startTransition] = React.useTransition()
  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [senderSameAsReceiver, setSenderSameAsReceiver] = React.useState(false)
  const [skippedReceiverStep, setSkippedReceiverStep] = React.useState(false)

  const [sender, setSender] = React.useState<PartyDetails>(() => emptyParty())
  const [receiver, setReceiver] = React.useState<PartyDetails>(() => emptyParty())
  const [packageDescription, setPackageDescription] = React.useState("")
  // Vehicle capacity is selected by the quote engine from the parcel weight
  // and each provider's declared fleet.
  const vehicleType = "auto"
  const [weightClass, setWeightClass] = React.useState("")
  const [packageValueNaira, setPackageValueNaira] = React.useState("")
  const [additionalInstruction, setAdditionalInstruction] = React.useState("")
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [draftReady, setDraftReady] = React.useState(false)

  React.useEffect(() => {
    queueMicrotask(() => {
      const d = loadFindFormDraft()
      if (d) {
        setStep(d.step)
        setSenderSameAsReceiver(d.senderSameAsReceiver)
        setSkippedReceiverStep(d.skippedReceiverStep)
        setSender(d.sender)
        setReceiver(d.receiver)
        setPackageDescription(d.packageDescription)
        setWeightClass(d.weightClass)
        setPackageValueNaira(d.packageValueNaira)
        setAdditionalInstruction(d.additionalInstruction)
      }
      setDraftReady(true)
    })
  }, [])

  React.useEffect(() => {
    if (!draftReady) return
    const id = window.setTimeout(() => {
      const draft: FindFormDraftV1 = {
        v: 1,
        step,
        senderSameAsReceiver,
        skippedReceiverStep,
        sender: { ...sender },
        receiver: { ...receiver },
        packageDescription,
        vehicleType,
        weightClass,
        packageValueNaira,
        additionalInstruction,
      }
      saveFindFormDraft(draft)
    }, 450)
    return () => window.clearTimeout(id)
  }, [
    draftReady,
    step,
    senderSameAsReceiver,
    skippedReceiverStep,
    sender,
    receiver,
    packageDescription,
    vehicleType,
    weightClass,
    packageValueNaira,
    additionalInstruction,
  ])

  const updateSender = (patch: Partial<PartyDetails>) =>
    setSender((s) => ({ ...s, ...patch }))
  const updateReceiver = (patch: Partial<PartyDetails>) =>
    setReceiver((r) => ({ ...r, ...patch }))
  const applySenderLocation = (location: { address: string; state?: string }) =>
    updateSender({ address: location.address, ...(matchNigerianState(location.state) ? { state: matchNigerianState(location.state) } : {}) })
  const applyReceiverLocation = (location: { address: string; state?: string }) =>
    updateReceiver({ address: location.address, ...(matchNigerianState(location.state) ? { state: matchNigerianState(location.state) } : {}) })

  const goNextFromStep1 = () => {
    if (senderSameAsReceiver) {
      setReceiver({ ...sender })
      setSkippedReceiverStep(true)
      setStep(3)
    } else {
      setSkippedReceiverStep(false)
      setStep(2)
    }
  }

  const goNextFromStep2 = () => {
    setStep(3)
  }

  const goBack = () => {
    if (step === 2) setStep(1)
    if (step === 3) {
      if (skippedReceiverStep) setStep(1)
      else setStep(2)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !weightClass ||
      !isValidNairaValue(packageValueNaira)
    ) {
      return
    }

    if (addressesMatch(sender.address, receiver.address)) {
      setSubmitError("Pickup and delivery addresses must be different.")
      return
    }

    const valueNaira = Number(packageValueNaira.replace(/[,\s]/g, ""))
    const payload: DeliveryQuoteRequest = {
      sender: { ...sender },
      receiver: { ...receiver },
      package: {
        description: packageDescription.trim() || undefined,
        vehicleType,
        weightClass,
        valueNaira,
        additionalInstruction: additionalInstruction.trim() || undefined,
      },
    }

    setSubmitError(null)
    startTransition(async () => {
      try {
        const err = await submitFindUptionFormAction(payload)
        if (err?.error) setSubmitError(err.error)
      } catch (caught) {
        if (isRedirectError(caught)) {
          clearFindFormDraft()
          throw caught
        }
        setSubmitError("Something went wrong. Try again.")
      }
    })
  }

  const stepValid =
    step === 1
      ? isPartyComplete(sender)
      : step === 2
        ? isPartyComplete(receiver)
        : Boolean(weightClass && isValidNairaValue(packageValueNaira))

  const ctaClassName = cn(
    "flex h-12 w-full items-center justify-center gap-1 rounded-lg px-6 font-poppins text-base font-semibold transition-colors",
    "disabled:cursor-not-allowed disabled:bg-[#D1D5DB] disabled:text-white disabled:opacity-100 disabled:hover:bg-[#D1D5DB]",
    "enabled:bg-brand-secondary enabled:text-brand-white enabled:hover:bg-brand-secondary/90",
  )

  const filledProgress = progressFilledSegments(step)

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-lg rounded-2xl border-2 border-brand-secondary bg-white p-6 shadow-sm md:p-8"
      noValidate
    >
      <div className={cn("mb-6", step === 3 && "text-center")}>
        {step === 1 ? (
          <h2 className="text-xl font-semibold text-brand-secondary md:text-2xl">
            Sender&apos;s Details
          </h2>
        ) : null}
        {step === 2 ? (
          <h2 className="text-xl font-semibold text-brand-secondary md:text-2xl">
            Receiver&apos;s Details
          </h2>
        ) : null}
        {step === 3 ? (
          <h2 className="text-xl font-bold text-brand-secondary md:text-2xl">
            Package Details
          </h2>
        ) : null}
      </div>

      <div
        key={step}
        className="animate-hero-content-swap space-y-4"
        aria-live="polite"
      >
        {step === 1 ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="sender-name" className="text-brand-primary">
                Sender&apos;s Name
              </Label>
              <Input
                id="sender-name"
                value={sender.name}
                onChange={(e) => updateSender({ name: e.target.value })}
                placeholder="Input Name"
                autoComplete="name"
                className={inputFieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sender-email" className="text-brand-primary">
                Sender&apos;s E-mail
              </Label>
              <Input
                id="sender-email"
                type="email"
                value={sender.email}
                onChange={(e) => updateSender({ email: e.target.value })}
                placeholder="Input E-mail"
                autoComplete="email"
                className={inputFieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sender-phone" className="text-brand-primary">
                Active Phone Number
              </Label>
              <Input
                id="sender-phone"
                type="tel"
                inputMode="tel"
                value={sender.phone}
                onChange={(e) => updateSender({ phone: e.target.value })}
                placeholder="Input active phone number"
                autoComplete="tel"
                className={inputFieldClass}
              />
            </div>
            <AddressField
              id="sender-address"
              label="Pickup Address"
              value={sender.address}
              onChange={(v) => updateSender({ address: v })}
              onLocationResolved={applySenderLocation}
              placeholder="Input pickup location"
            />
            <StateSelect
              id="sender-state"
              label="State"
              value={sender.state}
              onChange={(v) => updateSender({ state: v })}
            />
            <div className="hidden items-center gap-2 pt-2" aria-hidden="true">
              <Checkbox
                id="same-as-receiver"
                checked={senderSameAsReceiver}
                onCheckedChange={(c) => setSenderSameAsReceiver(c === true)}
                className="border-brand-secondary data-checked:border-brand-secondary data-checked:bg-brand-secondary"
              />
              <Label
                htmlFor="same-as-receiver"
                className="cursor-pointer font-normal text-brand-foreground"
              >
                Sender is same as receiver
              </Label>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="receiver-name" className="text-brand-primary">
                Receiver&apos;s Name
              </Label>
              <Input
                id="receiver-name"
                value={receiver.name}
                onChange={(e) => updateReceiver({ name: e.target.value })}
                placeholder="Input Name"
                autoComplete="name"
                className={inputFieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiver-email" className="text-brand-primary">
                Receiver&apos;s E-mail
              </Label>
              <Input
                id="receiver-email"
                type="email"
                value={receiver.email}
                onChange={(e) => updateReceiver({ email: e.target.value })}
                placeholder="Input E-mail"
                autoComplete="email"
                className={inputFieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiver-phone" className="text-brand-primary">
                Active Phone Number
              </Label>
              <Input
                id="receiver-phone"
                type="tel"
                inputMode="tel"
                value={receiver.phone}
                onChange={(e) => updateReceiver({ phone: e.target.value })}
                placeholder="Input active phone number"
                autoComplete="tel"
                className={inputFieldClass}
              />
            </div>
            <AddressField
              id="receiver-address"
              label="Delivery Address"
              value={receiver.address}
              onChange={(v) => updateReceiver({ address: v })}
              onLocationResolved={applyReceiverLocation}
              placeholder="Input delivery location"
            />
            <StateSelect
              id="receiver-state"
              label="State"
              value={receiver.state}
              onChange={(v) => updateReceiver({ state: v })}
            />
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div className="space-y-2">
              <Label
                htmlFor="package-description"
                className="text-sm font-medium text-brand-foreground/75"
              >
                Package Description{" "}
                <span className="font-normal text-brand-foreground/55">(optional)</span>
              </Label>
              <Textarea
                id="package-description"
                value={packageDescription}
                onChange={(e) => setPackageDescription(e.target.value)}
                placeholder="e.g., document, electronics, food, etc. (optional)"
                rows={4}
                className={textareaFieldClass}
              />
            </div>
            <PackageSelect
              id="package-weight"
              label="Package Weight Class (kg)"
              value={weightClass}
              onChange={setWeightClass}
              placeholder="Select weight"
              options={PACKAGE_WEIGHT_CLASSES}
            />
            <p className="text-sm text-brand-foreground/70">
              We&apos;ll recommend a suitable vehicle based on your package weight
              and each provider&apos;s available fleet.
            </p>
            <div className="space-y-2">
              <Label htmlFor="package-value" className="text-brand-primary">
                Package Value (Naira)
              </Label>
              <Input
                id="package-value"
                inputMode="numeric"
                autoComplete="off"
                value={packageValueNaira}
                onChange={(e) => setPackageValueNaira(e.target.value)}
                placeholder="Input value"
                className={inputFieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="additional-instruction"
                className="text-sm font-medium text-brand-foreground/75"
              >
                Additional Instruction{" "}
                <span className="font-normal text-brand-foreground/55">(optional)</span>
              </Label>
              <Textarea
                id="additional-instruction"
                value={additionalInstruction}
                onChange={(e) => setAdditionalInstruction(e.target.value)}
                placeholder="e.g., give uptions specific instructions (optional)"
                rows={3}
                className={cn(inputFieldClass, "min-h-[5.5rem] resize-y py-2.5")}
              />
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-8 space-y-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={goBack}
            className="text-sm font-medium text-brand-primary underline-offset-4 hover:underline"
          >
            Back
          </button>
        ) : null}

        {step < 3 ? (
          <button
            type="button"
            disabled={!stepValid}
            onClick={() => {
              if (!stepValid) return
              if (step === 1) goNextFromStep1()
              else goNextFromStep2()
            }}
            className={ctaClassName}
          >
            Proceed
            <ChevronRight className="size-5" aria-hidden />
          </button>
        ) : (
          <>
            <button
              type="submit"
              disabled={!stepValid || isPending}
              className={ctaClassName}
            >
              {isPending ? "Finding couriers…" : "Finish"}
              {!isPending ? (
                <ChevronRight className="size-5" aria-hidden />
              ) : null}
            </button>
            {submitError ? (
              <p className="text-center text-sm text-red-600" role="alert">
                {submitError}
              </p>
            ) : null}
          </>
        )}
      </div>

      <div
        className="mt-8 flex gap-2"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={PROGRESS_SEGMENTS}
        aria-valuenow={filledProgress}
        aria-label={`Form progress: ${filledProgress} of ${PROGRESS_SEGMENTS} segments`}
      >
        {Array.from({ length: PROGRESS_SEGMENTS }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < filledProgress ? "bg-brand-primary" : "bg-[#D9DDE4]",
            )}
          />
        ))}
      </div>
    </form>
  )
}
