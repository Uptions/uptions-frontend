const STORAGE_KEY = "uptions_find_form_draft_v1"

export type FindFormDraftV1 = {
  v: 1
  step: 1 | 2 | 3
  senderSameAsReceiver: boolean
  skippedReceiverStep: boolean
  sender: {
    name: string
    email: string
    phone: string
    address: string
    state: string
  }
  receiver: {
    name: string
    email: string
    phone: string
    address: string
    state: string
  }
  packageDescription: string
  vehicleType: string
  weightClass: string
  packageValueNaira: string
  additionalInstruction: string
}

export function loadFindFormDraft(): FindFormDraftV1 | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as FindFormDraftV1
    if (data?.v !== 1) return null
    if (data.step !== 1 && data.step !== 2 && data.step !== 3) return null
    return data
  } catch {
    return null
  }
}

export function saveFindFormDraft(draft: FindFormDraftV1): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    /* quota / private mode */
  }
}

export function clearFindFormDraft(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
