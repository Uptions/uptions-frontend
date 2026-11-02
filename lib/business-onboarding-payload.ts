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

const ITEM_CLASS_UI_TO_API: Record<string, "small" | "medium" | "large" | "all"> = {
  "Small (Frames, clothes, documents, clothes)": "small",
  "Medium (Shoes, clothes, electronics)": "medium",
  "Large (Furniture, appliances, equipment)": "large",
  "All 3 classes": "all",
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
  itemClasses: string[]
  hours: Record<string, { from: string; to: string }>
  chargeModeUi: string
  weightSensitive: "yes" | "no"
  weightPricingTiers: Array<{ minKg: string; maxKg: string; pricePerKg: string }>
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
  const mappedItemClasses = input.itemClasses.map((itemClass) => ITEM_CLASS_UI_TO_API[itemClass])
  if (
    mappedItemClasses.length < 1 ||
    mappedItemClasses.length > 2 ||
    mappedItemClasses.some((itemClass) => !itemClass)
  ) {
    throw new Error("Select one or two item classes")
  }
  if (mappedItemClasses.includes("all") && mappedItemClasses.length !== 1) {
    throw new Error("All 3 classes must be selected on its own")
  }
  const itemClasses = mappedItemClasses as Array<"small" | "medium" | "large" | "all">
  const flat = Number.parseFloat(input.flatRatePerKm.replace(/[^\d.]/g, ""))
  if (!Number.isFinite(flat) || flat < 0) {
    throw new Error("Enter a valid flat rate per km")
  }
  const weightPricingTiers = input.weightPricingTiers.map((tier) => ({
    minKg: Number.parseFloat(tier.minKg),
    maxKg: Number.parseFloat(tier.maxKg),
    pricePerKg: Number.parseFloat(tier.pricePerKg),
  }))
  const needsWeightPricing = input.weightSensitive === "yes" || chargeMode !== "distance_per_km"
  if (
    needsWeightPricing &&
    (!weightPricingTiers.length || weightPricingTiers.some((tier) =>
      !Number.isFinite(tier.minKg) || tier.minKg < 0 ||
      !Number.isFinite(tier.maxKg) || tier.maxKg <= tier.minKg ||
      !Number.isFinite(tier.pricePerKg) || tier.pricePerKg < 0,
    ))
  ) {
    throw new Error("Enter a valid weight range and price for every weight band")
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
    itemClasses,
    workingHours: input.hours,
    chargeMode,
    weightSensitive: input.weightSensitive,
    weightPriceTierMinLabel: input.weightPricingTiers[0]?.minKg.trim() || undefined,
    weightPriceTierMaxLabel: input.weightPricingTiers[0]?.maxKg.trim() || undefined,
    weightPricingTiers: needsWeightPricing ? weightPricingTiers : undefined,
    flatRatePerKm: flat,
    offersInsurance: input.hasInsurance === "yes",
    insuranceCoverageNaira: input.hasInsurance === "yes" ? 5000 : undefined,
    acceptedTerms: input.acceptedTerms,
  }
}
