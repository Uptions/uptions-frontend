import { getBackendBaseUrl } from "@/lib/backend-base-url"

const ADMIN_KEY_STORAGE = "uptions_admin_key"
const ADMIN_EMAIL_STORAGE = "uptions_admin_email"

export function getAdminKey(): string | null {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem(ADMIN_KEY_STORAGE)
}

export function setAdminKey(key: string): void {
  sessionStorage.setItem(ADMIN_KEY_STORAGE, key.trim())
}

export function clearAdminKey(): void {
  sessionStorage.removeItem(ADMIN_KEY_STORAGE)
  sessionStorage.removeItem(ADMIN_EMAIL_STORAGE)
}

export function setAdminEmail(email: string): void {
  const t = email.trim()
  if (!t) {
    sessionStorage.removeItem(ADMIN_EMAIL_STORAGE)
    return
  }
  sessionStorage.setItem(ADMIN_EMAIL_STORAGE, t)
}

export function getAdminEmail(): string | null {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem(ADMIN_EMAIL_STORAGE)
}

function apiUrl(path: string): string {
  const base = getBackendBaseUrl().replace(/\/$/, "")
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
      /* raw */
    }
    throw new Error(message || `Request failed (${response.status})`)
  }
  if (!text) return {} as T
  return JSON.parse(text) as T
}

export async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const key = getAdminKey()
  const headers = new Headers(init?.headers ?? {})
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json")
  if (key) headers.set("x-admin-key", key)
  return fetch(apiUrl(path), { ...init, headers })
}

export type AdminDashboardRange = "today" | "week" | "month" | "all"

export type AdminDashboardSummary = {
  range: AdminDashboardRange
  overview: {
    totalOrders: number
    totalOrdersChangePct: number
    deliveryProviders: number
    revenueNaira: number
    revenueChangePct: number
    activeProviders: number
    completedOrders: number
    completedOrdersChangePct: number
    ordersInPool: number
    newRequests: number
    users: number
    usersChangePct: number
    newUserSignups: number
    newUserSignupsChangePct: number
  }
  ordersGrowth: {
    series: Array<{ dayKey: string; label: string; count: number }>
    headlinePct: number
    sublabel: string
    weekTotalOrders: number
  }
  topPartners: Array<{
    partnerId: string
    partnerName: string
    ordersDelivered: number
    averageRating: number
    revenueNaira: number
  }>
}

export async function fetchAdminDashboardSummary(
  range: AdminDashboardRange,
): Promise<AdminDashboardSummary> {
  const qs = new URLSearchParams({ range })
  const res = await adminFetch(`/v1/admin/dashboard/summary?${qs.toString()}`)
  return parseJson<AdminDashboardSummary>(res)
}

export type PendingOnboardingRow = {
  id: string
  requestId: string
  submittedAt: string
  sender: string
  statusLabel: string
}

export type PendingOnboardingPage = {
  page: number
  limit: number
  total: number
  totalPages: number
  items: PendingOnboardingRow[]
}

export async function fetchPendingOnboarding(
  page: number,
  limit: number,
): Promise<PendingOnboardingPage> {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const res = await adminFetch(`/v1/admin/companies/pending-onboarding?${qs.toString()}`)
  return parseJson<PendingOnboardingPage>(res)
}

export async function approveBusinessOnboarding(companyId: string): Promise<unknown> {
  const res = await adminFetch(`/v1/admin/companies/${companyId}/approve-onboarding`, {
    method: "POST",
    body: JSON.stringify({}),
  })
  return parseJson(res)
}

export async function rejectBusinessOnboarding(companyId: string): Promise<unknown> {
  const res = await adminFetch(`/v1/admin/companies/${companyId}/reject-onboarding`, {
    method: "POST",
    body: JSON.stringify({}),
  })
  return parseJson(res)
}

export function formatNairaAdmin(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export type AdminOrderTab = "new" | "pending" | "completed"

export type AdminOrderRow = {
  id: string
  orderRef: string
  deliverySummary: string
  status: string
  statusLabel: string
  deliveryPartner: string
  date: string
  timeLabel: string
  distanceKm: number | null
  costNaira: number
}

export type AdminOrdersListResponse = {
  tab: AdminOrderTab
  page: number
  limit: number
  total: number
  totalPages: number
  items: AdminOrderRow[]
}

export type AdminDeliveryPartner = { id: string; name: string }

export async function fetchAdminDeliveryPartners(): Promise<AdminDeliveryPartner[]> {
  const res = await adminFetch("/v1/admin/orders/delivery-partners")
  return parseJson<AdminDeliveryPartner[]>(res)
}

export async function fetchAdminOrdersList(params: {
  tab: AdminOrderTab
  page: number
  limit: number
  q?: string
  status?: string
  companyId?: string
  dateFrom?: string
  dateTo?: string
}): Promise<AdminOrdersListResponse> {
  const qs = new URLSearchParams()
  qs.set("tab", params.tab)
  qs.set("page", String(params.page))
  qs.set("limit", String(params.limit))
  if (params.q?.trim()) qs.set("q", params.q.trim())
  if (params.status) qs.set("status", params.status)
  if (params.companyId) qs.set("companyId", params.companyId)
  if (params.dateFrom) qs.set("dateFrom", params.dateFrom)
  if (params.dateTo) qs.set("dateTo", params.dateTo)
  const res = await adminFetch(`/v1/admin/orders?${qs.toString()}`)
  return parseJson<AdminOrdersListResponse>(res)
}

export type AdminOrderDetail = {
  id: string
  orderRef: string
  status: string
  statusLabel: string
  sender: { name: string; phone: string; phoneMasked: string }
  receiver: { name: string; phone: string; phoneMasked: string }
  pickupAddress: string
  deliveryAddress: string
  package: {
    typeLabel: string
    weightClass: string
    vehicleType: string
    description?: string
  }
  pricing: {
    baseFareNaira: number
    distanceFeeNaira: number
    totalNaira: number
  }
  selectedCompanyName: string | null
  createdAt: string
  countdownSeconds: number | null
}

export async function fetchAdminOrderDetail(orderId: string): Promise<AdminOrderDetail> {
  const res = await adminFetch(`/v1/admin/orders/${orderId}`)
  return parseJson<AdminOrderDetail>(res)
}

export type PendingOnboardingDetail = {
  id: string
  statusLabel: string
  business: {
    legalBusinessName: string
    businessRegistrationNumber: string
    businessAddress: string
    contactEmail: string
    contactPhone: string
    businessWebsite: string | null
  }
  service: {
    vehicleTypes: string
    insuranceCoverage: boolean
    maxInsuranceCoverageNaira: number
    operatingHours: string
  }
  pricing: {
    basePriceNaira: number
    pricePerKm: number
    pricePerKg: number
  }
}

export async function fetchPendingOnboardingDetail(
  companyId: string,
): Promise<PendingOnboardingDetail> {
  const res = await adminFetch(`/v1/admin/companies/pending-onboarding/${companyId}/detail`)
  return parseJson<PendingOnboardingDetail>(res)
}

// --- Delivery providers (admin directory) ---

export type AdminDeliveryProviderRow = {
  id: string
  name: string
  status: "Active" | "Inactive"
  activeJobs: number
}

export type AdminDeliveryProvidersListResponse = {
  page: number
  limit: number
  total: number
  totalPages: number
  items: AdminDeliveryProviderRow[]
}

export async function fetchAdminDeliveryProvidersList(params: {
  page: number
  limit: number
  q?: string
}): Promise<AdminDeliveryProvidersListResponse> {
  const qs = new URLSearchParams()
  qs.set("page", String(params.page))
  qs.set("limit", String(params.limit))
  if (params.q?.trim()) qs.set("q", params.q.trim())
  const res = await adminFetch(`/v1/admin/delivery-providers?${qs.toString()}`)
  return parseJson<AdminDeliveryProvidersListResponse>(res)
}

export type AdminDeliveryProviderDetail = {
  id: string
  statusLabel: string
  onboardingStatus: string
  availabilityEnabled: boolean
  company: {
    name: string
    businessEmail: string
    businessPhone: string
    businessAddress: string
    pricePerKm: number
    weightPricePerKg: number
    logo: string
  }
  business: PendingOnboardingDetail["business"]
  service: PendingOnboardingDetail["service"]
  pricing: PendingOnboardingDetail["pricing"]
}

export async function fetchAdminDeliveryProviderDetail(
  id: string,
): Promise<AdminDeliveryProviderDetail> {
  const res = await adminFetch(`/v1/admin/delivery-providers/${id}`)
  return parseJson<AdminDeliveryProviderDetail>(res)
}

export async function createAdminDeliveryProvider(body: {
  name: string
  businessEmail: string
  pricePerKm: number
  weightPricePerKg: number
  businessPhone: string
  businessAddress: string
  logo?: string
}): Promise<{ id: string }> {
  const res = await adminFetch("/v1/admin/delivery-providers", {
    method: "POST",
    body: JSON.stringify(body),
  })
  return parseJson<{ id: string }>(res)
}

export async function updateAdminDeliveryProvider(
  id: string,
  body: Partial<{
    name: string
    businessEmail: string
    pricePerKm: number
    weightPricePerKg: number
    businessPhone: string
    businessAddress: string
    logo: string
  }>,
): Promise<AdminDeliveryProviderDetail> {
  const res = await adminFetch(`/v1/admin/delivery-providers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
  return parseJson<AdminDeliveryProviderDetail>(res)
}

export async function deactivateAdminDeliveryProvider(
  id: string,
): Promise<AdminDeliveryProviderDetail> {
  const res = await adminFetch(`/v1/admin/delivery-providers/${id}/deactivate`, {
    method: "PATCH",
    body: JSON.stringify({}),
  })
  return parseJson<AdminDeliveryProviderDetail>(res)
}

export async function suspendAdminDeliveryProvider(
  id: string,
): Promise<AdminDeliveryProviderDetail> {
  const res = await adminFetch(`/v1/admin/delivery-providers/${id}/suspend`, {
    method: "PATCH",
    body: JSON.stringify({}),
  })
  return parseJson<AdminDeliveryProviderDetail>(res)
}

export async function deleteAdminDeliveryProvider(
  id: string,
): Promise<{ removed: boolean; soft?: boolean; message?: string }> {
  const res = await adminFetch(`/v1/admin/delivery-providers/${id}`, { method: "DELETE" })
  return parseJson<{ removed: boolean; soft?: boolean; message?: string }>(res)
}
