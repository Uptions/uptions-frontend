const STORAGE_KEY = "uptions_business_signup_form_draft_v1"

type WeekdayKey =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"

type HoursState = Record<WeekdayKey, { from: string; to: string }>

export type BusinessSignUpFormDraftV1 = {
  v: 1
  step: 0 | 1 | 2
  representativeName: string
  representativeRole: string
  organizationName: string
  businessEmail: string
  businessPhone: string
  businessAddress: string
  cacOrNin: string
  yearsInBusiness: string
  operatingNote: string
  uploadedLogoName: string
  deliveryCategory: string
  itemClass: string
  hours: HoursState
  chargeMode: string
  weightSensitive: "yes" | "no" | ""
  weightPriceMin: string
  weightPriceMax: string
  flatRatePerKm: string
  hasInsurance: "yes" | "no" | ""
  acceptedTerms: boolean
}

export function loadBusinessSignUpFormDraft(): BusinessSignUpFormDraftV1 | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as BusinessSignUpFormDraftV1
    if (data?.v !== 1) return null
    if (data.step !== 0 && data.step !== 1 && data.step !== 2) return null
    return data
  } catch {
    return null
  }
}

export function saveBusinessSignUpFormDraft(draft: BusinessSignUpFormDraftV1): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    /* quota / private mode */
  }
}

export function clearBusinessSignUpFormDraft(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

