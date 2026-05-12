const STORAGE_KEY = "uptions_business_session_v1"

export type BusinessSessionV1 = {
  v: 1
  companyId: string
  businessName: string
}

export function loadBusinessSession(): BusinessSessionV1 | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as BusinessSessionV1
    if (data?.v !== 1 || !data.companyId) return null
    return data
  } catch {
    return null
  }
}

export function saveBusinessSession(session: BusinessSessionV1): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    /* quota */
  }
}

export function clearBusinessSession(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
