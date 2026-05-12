import { getBackendBaseUrl } from "@/lib/backend-base-url"

const ACCESS_TOKEN_KEY = "uptions_business_access_v1"

function apiUrl(path: string): string {
  const base = getBackendBaseUrl()
  const p = path.startsWith("/") ? path : `/${path}`
  return `${base}/api${p}`
}

let refreshInFlight: Promise<string | null> | null = null

async function parseJsonOrThrow<T>(response: Response): Promise<T> {
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

export function getBusinessAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setBusinessAccessToken(token: string): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearBusinessAccessToken(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = (async () => {
    try {
      const res = await fetch(apiUrl("/v1/auth/business/refresh"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
      if (!res.ok) return null
      const data = (await res.json()) as { accessToken?: string }
      if (!data.accessToken) return null
      setBusinessAccessToken(data.accessToken)
      return data.accessToken
    } catch {
      return null
    } finally {
      refreshInFlight = null
    }
  })()
  return refreshInFlight
}

function shouldSkipAuthRefresh(url: string): boolean {
  return (
    url.includes("/v1/auth/business/login") ||
    url.includes("/v1/auth/business/register") ||
    url.includes("/v1/auth/business/refresh")
  )
}

export async function authFetch(input: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers ?? {})
  const token = getBusinessAccessToken()
  if (token) headers.set("Authorization", `Bearer ${token}`)

  const exec = () =>
    fetch(input, {
      ...init,
      credentials: "include",
      headers,
    })

  let res = await exec()
  if (res.status === 401 && !shouldSkipAuthRefresh(input)) {
    const next = await refreshAccessToken()
    if (next) {
      headers.set("Authorization", `Bearer ${next}`)
      res = await fetch(input, {
        ...init,
        credentials: "include",
        headers,
      })
    }
  }
  return res
}

export async function registerBusiness(
  email: string,
  password: string,
): Promise<{ id: string; email: string }> {
  const res = await fetch(apiUrl("/v1/auth/business/register"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  return parseJsonOrThrow(res)
}

export async function loginBusiness(
  email: string,
  password: string,
): Promise<{
  accessToken: string
  user: { id: string; email: string; companyId: string | null }
}> {
  const res = await fetch(apiUrl("/v1/auth/business/login"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  const data = await parseJsonOrThrow<{
    accessToken: string
    user: { id: string; email: string; companyId: string | null }
  }>(res)
  setBusinessAccessToken(data.accessToken)
  return data
}

export async function logoutBusiness(): Promise<void> {
  try {
    await authFetch(apiUrl("/v1/auth/business/logout"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
  } finally {
    clearBusinessAccessToken()
  }
}

export async function fetchBusinessMe(): Promise<{
  id: string
  email: string
  companyId: string | null
}> {
  const res = await authFetch(apiUrl("/v1/auth/business/me"), { method: "GET" })
  return parseJsonOrThrow(res)
}
