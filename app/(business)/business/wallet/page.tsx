"use client"

import { Landmark } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { BusinessShell } from "@/components/business/business-shell"
import { BusinessNoSession } from "@/components/business/business-no-session"
import {
  formatNaira,
  getWalletSummary,
  getWalletTransactions,
  type WalletSummary,
  type WalletTransactionRow,
} from "@/lib/business-api"
import { useBusinessSession } from "@/hooks/use-business-session"

type WalletTab = "overview" | "transactions"

function formatTxDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `Date: ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
}

export default function BusinessWalletPage() {
  const { ready, authenticated, companyId } = useBusinessSession()
  const [tab, setTab] = useState<WalletTab>("overview")
  const [summary, setSummary] = useState<WalletSummary | null>(null)
  const [transactions, setTransactions] = useState<WalletTransactionRow[]>([])
  const [showAllTx, setShowAllTx] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!companyId) return
    setError(null)
    try {
      const [s, tx] = await Promise.all([
        getWalletSummary(companyId),
        getWalletTransactions(companyId),
      ])
      setSummary(s)
      setTransactions(tx)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load wallet")
    }
  }, [companyId])

  useEffect(() => {
    if (!ready || !companyId) return
    queueMicrotask(() => {
      void load()
    })
  }, [ready, companyId, load])

  const recentTransactions = transactions.slice(0, 4)
  const displayList = showAllTx ? transactions : recentTransactions

  if (!ready) {
    return (
      <BusinessShell activeNav="wallet">
        <p className="mt-8 text-brand-secondary">Loading…</p>
      </BusinessShell>
    )
  }

  if (!authenticated) {
    return <BusinessNoSession activeNav="wallet" reason="sign-in" />
  }

  if (!companyId) {
    return <BusinessNoSession activeNav="wallet" reason="onboarding" />
  }

  return (
    <BusinessShell activeNav="wallet">
      {error ? (
        <p className="mt-4 text-sm text-[#E11D48]" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-10">
        <h1 className="text-5xl font-bold text-brand-foreground">Wallet</h1>
        <div className="mt-5 flex items-center gap-8 border-b border-brand-foreground/15 pb-2 text-sm font-semibold text-brand-secondary">
          <button
            type="button"
            onClick={() => setTab("overview")}
            className={tab === "overview" ? "text-brand-foreground" : ""}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setTab("transactions")}
            className={tab === "transactions" ? "text-brand-foreground" : ""}
          >
            Transactions
          </button>
        </div>
      </div>

      {tab === "overview" && !summary ? (
        <p className="mt-6 text-brand-secondary">Loading wallet…</p>
      ) : null}

      {tab === "overview" && summary ? (
        <section className="mt-6 rounded-lg bg-white/70 p-4">
          <p className="text-2xl font-semibold text-brand-foreground">Current Payout Balance</p>
          <p className="text-5xl font-bold text-brand-secondary">
            {formatNaira(summary.currentPayoutBalanceNaira)}
          </p>
          <p className="mt-1 text-xs text-brand-secondary">{summary.nextPayoutNote}</p>

          <div className="mt-6 grid max-w-2xl grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-brand-secondary">Pending Amount</p>
              <p className="text-4xl font-semibold text-brand-foreground">
                {formatNaira(summary.pendingAmountNaira)}
              </p>
            </div>
            <div>
              <p className="text-xs text-brand-secondary">Last Payout</p>
              <p className="text-4xl font-semibold text-brand-foreground">
                {formatNaira(summary.lastPayoutNaira)}
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-lg bg-[#edf2f8] px-3 py-2">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex size-9 items-center justify-center rounded-md bg-[#dce6f2]">
                <Landmark className="size-4 text-brand-foreground" />
              </span>
              <div>
                <p className="text-sm font-semibold text-brand-foreground">Bank Account</p>
                <p className="text-xs text-brand-secondary">{summary.bankAccount.label}</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-full bg-[#dce4ee] px-4 py-1.5 text-sm font-medium text-brand-foreground"
            >
              Add Account
            </button>
          </div>
        </section>
      ) : null}

      {tab === "overview" ? (
        <section className="mt-6">
          <h2 className="text-3xl font-bold text-brand-foreground">Transaction History</h2>
          <div className="mt-3 space-y-1 rounded-lg bg-white/70 p-2">
            {displayList.length === 0 ? (
              <p className="py-6 text-center text-sm text-brand-secondary">No transactions yet.</p>
            ) : (
              displayList.map((transaction, index) => (
                <div
                  key={`${transaction.date}-${index}`}
                  className="flex items-center justify-between rounded-md bg-[#edf2f8] px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-brand-foreground">
                      {formatTxDate(transaction.date)}
                    </p>
                    <p className="text-sm text-brand-secondary">
                      {transaction.orderRef
                        ? `Order ID: ${transaction.orderRef}`
                        : transaction.description ?? "—"}
                    </p>
                  </div>
                  <p className="text-2xl font-semibold text-brand-foreground md:text-4xl">
                    {transaction.direction === "debit" ? "− " : "+ "}
                    {formatNaira(transaction.amountNaira)}
                  </p>
                </div>
              ))
            )}
          </div>

          {transactions.length > 4 ? (
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAllTx((v) => !v)}
                className="inline-flex h-11 items-center rounded-lg bg-brand-secondary px-6 text-sm font-medium text-white"
              >
                {showAllTx ? "Show less" : "View All Transactions"}
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {tab === "transactions" ? (
        <section className="mt-6">
          <h2 className="text-3xl font-bold text-brand-foreground">Transaction History</h2>
          <div className="mt-3 space-y-1 rounded-lg bg-white/70 p-2">
            {transactions.length === 0 ? (
              <p className="py-6 text-center text-sm text-brand-secondary">No transactions yet.</p>
            ) : (
              transactions.map((transaction, index) => (
                <div
                  key={`${transaction.date}-full-${index}`}
                  className="flex items-center justify-between rounded-md bg-[#edf2f8] px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-brand-foreground">
                      {formatTxDate(transaction.date)}
                    </p>
                    <p className="text-sm text-brand-secondary">
                      {transaction.orderRef
                        ? `Order ID: ${transaction.orderRef}`
                        : transaction.description ?? "—"}
                    </p>
                  </div>
                  <p className="text-2xl font-semibold text-brand-foreground md:text-4xl">
                    {transaction.direction === "debit" ? "− " : "+ "}
                    {formatNaira(transaction.amountNaira)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      ) : null}
    </BusinessShell>
  )
}
