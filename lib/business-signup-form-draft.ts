const STORAGE_KEY = "uptions_business_signup_form_draft_v1"

function keyForAccount(email: string) {
  return `${STORAGE_KEY}:${encodeURIComponent(email.trim().toLowerCase())}`
}

type WeekdayKey =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"

type HoursState = Record<WeekdayKey, { from: string; to: string }>
type WeightPricingTier = { id: string; minKg: string; maxKg: string; pricePerKg: string }

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
  uploadedLogoKey: string
  deliveryCategory: string
  itemClasses: string[]
  hours: HoursState
  chargeMode: string
  weightSensitive: "yes" | "no" | ""
  /** Retained only to migrate drafts saved before pricing bands were introduced. */
  weightPriceMin?: string
  weightPriceMax?: string
  weightPricingTiers?: WeightPricingTier[]
  flatRatePerKm: string
  hasInsurance: "yes" | "no" | ""
  acceptedTerms: boolean
}

export function loadBusinessSignUpFormDraft(email: string): BusinessSignUpFormDraftV1 | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(keyForAccount(email)) ?? localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as BusinessSignUpFormDraftV1 & { itemClass?: string; uploadedLogoKey?: string }
    if (data?.v !== 1) return null
    if (data.step !== 0 && data.step !== 1 && data.step !== 2) return null
    if (data.businessEmail.trim().toLowerCase() !== email.trim().toLowerCase()) return null
    if (!Array.isArray(data.itemClasses)) {
      data.itemClasses = data.itemClass ? [data.itemClass] : []
    }
    if (typeof data.uploadedLogoKey !== "string") data.uploadedLogoKey = ""
    return data
  } catch {
    return null
  }
}

export function saveBusinessSignUpFormDraft(email: string, draft: BusinessSignUpFormDraftV1): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(keyForAccount(email), JSON.stringify(draft))
  } catch {
    /* quota / private mode */
  }
}

export function clearBusinessSignUpFormDraft(email: string): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(keyForAccount(email))
  } catch {
    /* ignore */
  }
}

