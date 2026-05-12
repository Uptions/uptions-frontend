"use client"

import { useCallback, useEffect, useState } from "react"

import {
  clearBusinessAccessToken,
  fetchBusinessMe,
  getBusinessAccessToken,
} from "@/lib/business-auth"
import type { BusinessSessionV1 } from "@/lib/business-session"
import { clearBusinessSession, loadBusinessSession, saveBusinessSession } from "@/lib/business-session"

export function useBusinessSession() {
  const [session, setSession] = useState<BusinessSessionV1 | null>(null)
  const [ready, setReady] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => {
      void (async () => {
        const token = getBusinessAccessToken()
        if (!token) {
          clearBusinessSession()
          if (!cancelled) {
            setSession(null)
            setAuthenticated(false)
            setReady(true)
          }
          return
        }
        try {
          const me = await fetchBusinessMe()
          if (cancelled) return
          setAuthenticated(true)
          if (me.companyId) {
            const prev = loadBusinessSession()
            saveBusinessSession({
              v: 1,
              companyId: me.companyId,
              businessName: prev?.businessName ?? "",
            })
          }
          setSession(loadBusinessSession())
        } catch {
          clearBusinessAccessToken()
          clearBusinessSession()
          if (!cancelled) {
            setAuthenticated(false)
            setSession(null)
          }
        } finally {
          if (!cancelled) setReady(true)
        }
      })()
    })
    return () => {
      cancelled = true
    }
  }, [])

  const refresh = useCallback(() => {
    setSession(loadBusinessSession())
  }, [])

  return {
    ready,
    authenticated,
    session,
    companyId: session?.companyId ?? null,
    businessName: session?.businessName ?? "",
    refresh,
  }
}
