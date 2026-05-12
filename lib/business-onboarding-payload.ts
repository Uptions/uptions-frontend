import type { BusinessOnboardingPayload } from "@/lib/business-api"

const DELIVERY_UI_TO_API: Record<string, "within_state" | "state_to_state" | "both"> = {
  "Within a state": "within_state",
  "State to state": "state_to_state",
  Both: "both",
}

const CHARGE_UI_TO_API: Record<
  string,
  "distance_per_km" | "weight_per_kg" | "distance_and_weight"
> = {
  "Distance (per km)": "distance_per_km",
  "Weight (per kg)": "weight_per_kg",
  "Distance + Weight": "distance_and_weight",
}

export function buildBusinessOnboardingPayload(input: {
  representativeName: string
  representativeRole: string
  organizationName: string
  businessEmail: string
  businessPhone: string
  businessAddress: string
  cacOrNin: string
  yearsInBusiness: string
  operatingHoursNote: string
  uploadedLogoName: string
  deliveryCategoryUi: string
  itemClass: string
  hours: Record<string, { from: string; to: string }>
  chargeModeUi: string
  weightSensitive: "yes" | "no"
  weightPriceMin: string
  weightPriceMax: string
  flatRatePerKm: string
  hasInsurance: "yes" | "no"
  acceptedTerms: boolean
}): BusinessOnboardingPayload {
  const serviceCoverage = DELIVERY_UI_TO_API[input.deliveryCategoryUi]
  if (!serviceCoverage) {
    throw new Error("Invalid delivery category selection")
  }
  const chargeMode = CHARGE_UI_TO_API[input.chargeModeUi]
  if (!chargeMode) {
    throw new Error("Invalid charge mode selection")
  }
  const flat = Number.parseFloat(input.flatRatePerKm.replace(/[^\d.]/g, ""))
  if (!Number.isFinite(flat) || flat < 0) {
    throw new Error("Enter a valid flat rate per km")
  }

  return {
    representativeName: input.representativeName.trim(),
    representativeRole: input.representativeRole.trim(),
    organizationName: input.organizationName.trim(),
    businessEmail: input.businessEmail.trim(),
    businessPhone: input.businessPhone.trim(),
    businessAddress: input.businessAddress.trim(),
    cacOrNin: input.cacOrNin.trim(),
    yearsInBusiness: input.yearsInBusiness.trim(),
    operatingHoursNote: input.operatingHoursNote.trim(),
    logoUrl: input.uploadedLogoName.trim() || undefined,
    serviceCoverage,
    itemClassLabel: input.itemClass.trim(),
    workingHours: input.hours,
    chargeMode,
    weightSensitive: input.weightSensitive,
    weightPriceTierMinLabel: input.weightPriceMin.trim() || undefined,
    weightPriceTierMaxLabel: input.weightPriceMax.trim() || undefined,
    flatRatePerKm: flat,
    offersInsurance: input.hasInsurance === "yes",
    insuranceCoverageNaira: input.hasInsurance === "yes" ? 5000 : undefined,
    acceptedTerms: input.acceptedTerms,
  }
}
