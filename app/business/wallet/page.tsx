"use client"

import { Landmark } from "lucide-react"

import { BusinessShell } from "@/components/business/business-shell"

const recentTransactions = [
  { date: "Date: Oct 11, 2025", id: "Order ID: #UPT2381", amount: "+ ₦1,850" },
  { date: "Date: Oct 10, 2025", id: "Order ID: #UPT2382", amount: "+ ₦2,100" },
  { date: "Date: Oct 9, 2025", id: "Order ID: #UPT2383", amount: "+ ₦1,500" },
  { date: "Date: Oct 8, 2025", id: "Order ID: #UPT2384", amount: "+ ₦1,750" },
]

const allTransactions = [
  ...recentTransactions,
  { date: "Date: Oct 7, 2025", id: "Order ID: #UPT2385", amount: "+ ₦7,200" },
  { date: "Date: Oct 6, 2025", id: "Order ID: #UPT2386", amount: "+ ₦1,900" },
  { date: "Date: Oct 5, 2025", id: "Order ID: #UPT2387", amount: "+ ₦5,050" },
  { date: "Date: Oct 4, 2025", id: "Order ID: #UPT2388", amount: "+ ₦1,600" },
]

export default function BusinessWalletPage() {
  return (
    <BusinessShell activeNav="wallet">
      <div className="mt-10">
        <h1 className="text-5xl font-bold text-brand-foreground">Wallet</h1>
        <div className="mt-5 flex items-center gap-8 border-b border-brand-foreground/15 pb-2 text-sm font-semibold text-brand-secondary">
          <span className="text-brand-foreground">Overview</span>
          <span>Transactions</span>
        </div>
      </div>

      <section className="mt-6 rounded-lg bg-white/70 p-4">
        <p className="text-2xl font-semibold text-brand-foreground">Current Payout Balance</p>
        <p className="text-5xl font-bold text-brand-secondary">₦85,400</p>
        <p className="mt-1 text-xs text-brand-secondary">
          Next payout scheduled for Friday, Oct 17th.
        </p>

        <div className="mt-6 grid max-w-2xl grid-cols-2 gap-8">
          <div>
            <p className="text-xs text-brand-secondary">Pending Amount</p>
            <p className="text-4xl font-semibold text-brand-foreground">₦15,200</p>
          </div>
          <div>
            <p className="text-xs text-brand-secondary">Last Payout</p>
            <p className="text-4xl font-semibold text-brand-foreground">₦72,150</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-lg bg-[#edf2f8] px-3 py-2">
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex size-9 items-center justify-center rounded-md bg-[#dce6f2]">
              <Landmark className="size-4 text-brand-foreground" />
            </span>
            <div>
              <p className="text-sm font-semibold text-brand-foreground">Bank Account</p>
              <p className="text-xs text-brand-secondary">GTBank - **** 1234</p>
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

      <section className="mt-6">
        <h2 className="text-3xl font-bold text-brand-foreground">Transaction History</h2>
        <div className="mt-3 space-y-1 rounded-lg bg-white/70 p-2">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between rounded-md bg-[#edf2f8] px-3 py-2"
            >
              <div>
                <p className="font-medium text-brand-foreground">{transaction.date}</p>
                <p className="text-sm text-brand-secondary">{transaction.id}</p>
              </div>
              <p className="text-4xl font-semibold text-brand-foreground">{transaction.amount}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            className="inline-flex h-11 items-center rounded-lg bg-brand-secondary px-6 text-sm font-medium text-white"
            aria-label={`View all ${allTransactions.length} transactions`}
          >
            View All Transactions
          </button>
        </div>
      </section>
    </BusinessShell>
  )
}

