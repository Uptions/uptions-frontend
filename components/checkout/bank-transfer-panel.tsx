"use client"

import * as React from "react"
import type { ReactNode } from "react"
import { useFormStatus } from "react-dom"
import { Copy } from "lucide-react"

import { acknowledgeBankTransferAction } from "@/app/actions/checkout-flow-actions"
import { formatNaira } from "@/lib/delivery-quotes"
import { MOCK_BANK_TRANSFER } from "@/lib/mock-bank-transfer"
import { cn } from "@/lib/utils"

function useCountdownSeconds(expiresAt: number) {
  const [secondsLeft, setSecondsLeft] = React.useState(() =>
    Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)),
  )

  React.useEffect(() => {
    const tick = () =>
      setSecondsLeft(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [expiresAt])

  const m = Math.floor(secondsLeft / 60)
  const s = secondsLeft % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

async function copyText(label: string, text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    window.alert(`Copy ${label} manually: ${text}`)
  }
}

function CopyRow({
  label,
  value,
  copyValue,
}: {
  label: string
  value: ReactNode
  copyValue: string
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-brand-secondary/15 py-3 last:border-b-0 last:pb-0">
      <div>
        <p className="text-xs font-semibold tracking-wide text-brand-secondary uppercase">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium text-brand-foreground">{value}</p>
      </div>
      <button
        type="button"
        onClick={() => copyText(label, copyValue)}
        className="shrink-0 rounded-lg p-2 text-brand-secondary transition-colors hover:bg-brand-secondary/10"
        aria-label={`Copy ${label}`}
      >
        <Copy className="size-5" />
      </button>
    </div>
  )
}

function SentMoneyButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "flex h-12 w-full max-w-md items-center justify-center gap-1 rounded-lg px-6 font-poppins text-base font-semibold transition-colors",
        "bg-brand-secondary text-white hover:bg-brand-secondary/90 disabled:opacity-70",
      )}
    >
      {pending ? "Submitting…" : "I've sent the money"}
      {!pending ? <span aria-hidden>{">"}</span> : null}
    </button>
  )
}

export function BankTransferPanel({
  totalNaira,
  expiresAt,
}: {
  totalNaira: number
  expiresAt: number
}) {
  const timer = useCountdownSeconds(expiresAt)
  const amount = formatNaira(totalNaira)

  return (
    <div className="mx-auto w-full max-w-lg space-y-8 px-4 pb-20 pt-8 md:px-0 md:pb-24 md:pt-12">
      <p className="text-center text-base text-brand-foreground md:text-lg">
        Transfer{" "}
        <span className="font-semibold text-brand-secondary">{amount}</span> to the
        Moniepoint checkout
      </p>

      <div className="rounded-2xl border-2 border-brand-secondary/50 bg-[#EEF2F6] p-5 md:p-6">
        <div className="border-b border-brand-secondary/15 py-3">
          <p className="text-xs font-semibold tracking-wide text-brand-secondary uppercase">
            Bank name
          </p>
          <p className="mt-1 text-sm font-medium text-brand-foreground">
            {MOCK_BANK_TRANSFER.bankName}
          </p>
        </div>
        <CopyRow
          label="Account number"
          value={MOCK_BANK_TRANSFER.accountNumber}
          copyValue={MOCK_BANK_TRANSFER.accountNumber}
        />
        <CopyRow label="Amount" value={amount} copyValue={String(totalNaira)} />
        <p className="mt-4 text-center text-sm text-brand-foreground">
          This transaction expires in{" "}
          <span className="font-semibold text-brand-secondary tabular-nums">{timer}</span>
        </p>
      </div>

      <form action={acknowledgeBankTransferAction} className="flex justify-center">
        <SentMoneyButton />
      </form>
    </div>
  )
}
