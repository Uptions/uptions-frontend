import { authFetch } from "@/lib/business-auth"
import { getBackendBaseUrl } from "@/lib/backend-base-url"

const JSON_HEADERS = { "Content-Type": "application/json" } as const

function apiUrl(path: string): string {
  const base = getBackendBaseUrl()
  const p = path.startsWith("/") ? path : `/${path}`
  return `${base}/api${p}`
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text()
  if (!response.ok) {
    let message = text || response.statusText
    try {
      const body = JSON.parse(text) as { message?: string | string[] }
      if (Array.isArray(body.message)) message = body.message.join(", ")
      else if (typeof body.message === "string") message = body.message
    } catch {
      /* use raw */
    }
    throw new Error(message || `Request failed (${response.status})`)
  }
  if (!text) return {} as T
  return JSON.parse(text) as T
}

export type BusinessOnboardingPayload = {
  representativeName: string
  representativeRole: string
  organizationName: string
  businessEmail: string
  businessPhone: string
  businessAddress: string
  cacOrNin: string
  yearsInBusiness: string
  operatingHoursNote: string
  logoUrl?: string
  serviceCoverage: "within_state" | "state_to_state" | "both"
  itemClassLabel: string
  workingHours: Record<string, { from: string; to: string }>
  chargeMode: "distance_per_km" | "weight_per_kg" | "distance_and_weight"
  weightSensitive: "yes" | "no"
  weightPriceTierMinLabel?: string
  weightPriceTierMaxLabel?: string
  flatRatePerKm: number
  offersInsurance: boolean
  insuranceCoverageNaira?: number
  acceptedTerms: boolean
}

export type OnboardingResponse = {
  companyId: string
  onboardingStatus: string
  message: string
  accessToken?: string
}

export async function submitBusinessOnboarding(
  body: BusinessOnboardingPayload,
): Promise<OnboardingResponse> {
  const response = await authFetch(apiUrl("/v1/business/onboarding"), {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  })
  return parseJson<OnboardingResponse>(response)
}

export type BusinessProfile = {
  _id?: string
  name?: string
  businessAddress?: string
  businessEmail?: string
  businessPhone?: string
  operatingHoursNote?: string
  workingHours?: Record<string, { from: string; to: string }>
  pricePerKm?: number
  weightPricePerKg?: number
  hasWeightPricing?: boolean
  offersInsurance?: boolean
  insuranceCoverageNaira?: number
  onboardingStatus?: string
  availabilityEnabled?: boolean
  logo?: string
  representativeName?: string
}

export async function getBusinessProfile(companyId: string): Promise<BusinessProfile> {
  const response = await authFetch(apiUrl(`/v1/business/companies/${companyId}/profile`))
  return parseJson<BusinessProfile>(response)
}

export async function patchBusinessProfile(
  companyId: string,
  body: Partial<{
    representativeName: string
    representativeRole: string
    businessEmail: string
    businessPhone: string
    businessAddress: string
    operatingHoursNote: string
    workingHours: Record<string, { from: string; to: string }>
    pricePerKm: number
    weightPricePerKg: number
    hasWeightPricing: boolean
    offersInsurance: boolean
    insuranceCoverageNaira: number
    logo: string
  }>,
): Promise<BusinessProfile> {
  const response = await authFetch(apiUrl(`/v1/business/companies/${companyId}/profile`), {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  })
  return parseJson<BusinessProfile>(response)
}

export async function patchBusinessAvailability(
  companyId: string,
  available: boolean,
): Promise<{ companyId: string; availabilityEnabled: boolean }> {
  const response = await authFetch(apiUrl(`/v1/business/companies/${companyId}/availability`), {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify({ available }),
  })
  return parseJson(response)
}

export type BusinessOverview = {
  newOrders: number
  inProgress: number
  earningsToday: number
}

export async function getBusinessOverview(companyId: string): Promise<BusinessOverview> {
  const response = await authFetch(apiUrl(`/v1/business/companies/${companyId}/overview`))
  return parseJson<BusinessOverview>(response)
}

export type BusinessOrderRow = {
  id: string
  title: string
  etaLabel: string
  route: string
  status: string
  totalNaira: number
}

export async function getBusinessOrders(
  companyId: string,
  tab: "new" | "pending" | "completed",
): Promise<BusinessOrderRow[]> {
  const qs = new URLSearchParams({ tab })
  const response = await authFetch(
    apiUrl(`/v1/business/companies/${companyId}/orders?${qs.toString()}`),
  )
  return parseJson<BusinessOrderRow[]>(response)
}

export type BusinessOrderDetail = {
  _id: string
  sender: { name: string; phone: string; address: string; email?: string; state?: string }
  receiver: { name: string; phone: string; address: string; email?: string; state?: string }
  package: {
    description?: string
    vehicleType: string
    weightClass: string
    valueNaira: number
    additionalInstruction?: string
  }
  subtotalNaira: number
  serviceChargeNaira: number
  totalNaira: number
  status: string
}

export async function getBusinessOrderDetail(
  companyId: string,
  orderId: string,
): Promise<BusinessOrderDetail> {
  const response = await authFetch(
    apiUrl(`/v1/business/companies/${companyId}/orders/${orderId}`),
  )
  return parseJson<BusinessOrderDetail>(response)
}

export type PoolOrderRow = {
  id: string
  title: string
  eta: string
  route: string
  suggestedPriceNaira: number
}

export async function getBusinessOrderPool(): Promise<PoolOrderRow[]> {
  const response = await authFetch(apiUrl("/v1/business/order-pool"))
  return parseJson<PoolOrderRow[]>(response)
}

export async function claimBusinessOrderPool(
  companyId: string,
  orderId: string,
): Promise<{ orderId: string; selectedCompanyId: string; claimed: boolean }> {
  const response = await fetch(
    apiUrl(`/v1/business/companies/${companyId}/order-pool/${orderId}/claim`),
    { method: "POST", headers: JSON_HEADERS },
  )
  return parseJson(response)
}

export type WalletSummary = {
  currentPayoutBalanceNaira: number
  nextPayoutNote: string
  pendingAmountNaira: number
  lastPayoutNaira: number
  bankAccount: { label: string }
}

export async function getWalletSummary(companyId: string): Promise<WalletSummary> {
  const response = await authFetch(apiUrl(`/v1/business/companies/${companyId}/wallet/summary`))
  return parseJson<WalletSummary>(response)
}

export type WalletTransactionRow = {
  date: string
  orderRef?: string
  amountNaira: number
  direction: "credit" | "debit"
  description?: string
}

export async function getWalletTransactions(
  companyId: string,
): Promise<WalletTransactionRow[]> {
  const response = await authFetch(
    apiUrl(`/v1/business/companies/${companyId}/wallet/transactions`),
  )
  return parseJson<WalletTransactionRow[]>(response)
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
