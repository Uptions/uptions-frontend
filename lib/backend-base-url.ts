export function getBackendBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim()
  if (configured) {
    return configured.replace(/\/$/, "")
  }
  return "http://localhost:3001"
}

