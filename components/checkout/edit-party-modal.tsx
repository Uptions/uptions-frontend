"use client"

import * as React from "react"

import { updateOrderPartyAction } from "@/app/actions/checkout-flow-actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PartyDetailsDTO } from "@/lib/delivery-quotes"

import { NIGERIAN_STATES } from "@/components/find-an-uption/nigerian-states"

type Party = "sender" | "receiver"

const inputClass =
  "h-11 border-brand-secondary/70 bg-[#EEF2F6] px-3 text-brand-foreground placeholder:text-brand-foreground/45 focus-visible:border-brand-secondary focus-visible:ring-brand-secondary/25"

const labelClass = "text-brand-primary"

const selectClass =
  "h-11 w-full border-brand-secondary/70 bg-[#EEF2F6] px-3 text-brand-foreground focus-visible:border-brand-secondary focus-visible:ring-brand-secondary/25"

function isValidDetails(details: PartyDetailsDTO): string | null {
  if (!details.name.trim() || !details.address.trim() || !details.state.trim()) {
    return "Complete all required fields."
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim())) {
    return "Enter a valid email address."
  }
  if (details.phone.replace(/\D/g, "").length < 11) {
    return "Enter a phone number with at least 11 digits."
  }
  return null
}

export function EditPartyModal({
  party,
  details,
}: {
  party: Party
  details: PartyDetailsDTO
}) {
  const [open, setOpen] = React.useState(false)
  const [values, setValues] = React.useState(details)
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()
  const label = party === "sender" ? "Sender" : "Receiver"
  const hasChanges =
    values.name !== details.name ||
    values.email !== details.email ||
    values.phone !== details.phone ||
    values.address !== details.address ||
    values.state !== details.state

  function update(field: keyof PartyDetailsDTO, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function close() {
    if (pending) return
    setValues(details)
    setError(null)
    setOpen(false)
  }

  function save() {
    const validationError = isValidDetails(values)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await updateOrderPartyAction(party, values)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-brand-secondary hover:underline"
      >
        Edit
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${party}-edit-title`}
        >
          <div className="max-h-[calc(100svh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={`${party}-edit-title`} className="font-heading text-2xl font-bold text-brand-primary">
                  Edit {label} details
                </h2>
                <p className="mt-1 text-sm text-brand-foreground/70">
                  Updating the address or state will refresh your courier options.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                disabled={pending}
                className="rounded-md px-2 py-1 text-sm font-semibold text-brand-foreground/70 hover:bg-slate-100"
                aria-label="Close edit dialog"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label className={labelClass} htmlFor={`${party}-edit-name`}>Name</Label>
                <Input className={inputClass} id={`${party}-edit-name`} value={values.name} onChange={(event) => update("name", event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass} htmlFor={`${party}-edit-email`}>Email</Label>
                <Input className={inputClass} id={`${party}-edit-email`} type="email" value={values.email} onChange={(event) => update("email", event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass} htmlFor={`${party}-edit-phone`}>Phone number</Label>
                <Input className={inputClass} id={`${party}-edit-phone`} type="tel" value={values.phone} onChange={(event) => update("phone", event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass} htmlFor={`${party}-edit-address`}>Address</Label>
                <Input className={inputClass} id={`${party}-edit-address`} value={values.address} onChange={(event) => update("address", event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>State</Label>
                <Select value={values.state} onValueChange={(value) => update("state", value)}>
                  <SelectTrigger className={selectClass}><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent>
                    {NIGERIAN_STATES.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error ? <p className="mt-4 text-sm text-red-600" role="alert">{error}</p> : null}

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={close} disabled={pending} className="rounded-lg border border-brand-secondary/30 px-4 py-2 text-sm font-semibold text-brand-primary">
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={pending || !hasChanges}
                className="rounded-lg bg-brand-secondary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                {pending ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
