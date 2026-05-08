"use client"

import { PencilLine } from "lucide-react"

import { BusinessShell } from "@/components/business/business-shell"

function ProfileRow({
  title,
  value,
  action,
}: {
  title: string
  value: string
  action?: "edit" | "support"
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[#edf2f8] px-4 py-3">
      <div>
        <p className="font-semibold text-brand-foreground">{title}</p>
        <p className="text-sm text-brand-secondary">{value}</p>
      </div>
      {action === "support" ? (
        <button
          type="button"
          className="rounded-full bg-brand-secondary px-4 py-2 text-sm font-medium text-white"
        >
          Contact support
        </button>
      ) : (
        <button type="button" aria-label={`Edit ${title}`}>
          <PencilLine className="size-4 text-brand-foreground" />
        </button>
      )}
    </div>
  )
}

export default function BusinessAccountPage() {
  return (
    <BusinessShell activeNav="account">
      <div className="mt-10">
        <h1 className="text-5xl font-bold text-brand-foreground">My Business Profile</h1>
      </div>

      <div className="mt-4 inline-flex items-end">
        <div className="flex size-28 items-center justify-center rounded-full border-4 border-brand-secondary bg-black">
          <span className="text-xs font-semibold text-white">Uptions</span>
        </div>
        <button
          type="button"
          className="-ml-4 inline-flex size-8 items-center justify-center rounded-full bg-white text-brand-secondary shadow"
          aria-label="Edit profile image"
        >
          <PencilLine className="size-4" />
        </button>
      </div>

      <section className="mt-8 space-y-5">
        <div>
          <h2 className="mb-2 text-3xl font-bold text-brand-foreground">General Information</h2>
          <div className="space-y-1">
            <ProfileRow title="Company Name" value="Tech Solutions Inc." action="support" />
            <ProfileRow title="Address" value="123 Innovation Drive, Tech City, CA 90210" action="edit" />
            <ProfileRow title="Operating Hours" value="Mon-Fri: 9 AM - 6 PM" action="edit" />
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-3xl font-bold text-brand-foreground">My Pricing</h2>
          <div className="space-y-1">
            <ProfileRow title="Price per Distance" value="₦500 per km" action="edit" />
            <ProfileRow title="Price per kg" value="₦500 per weight tier" action="edit" />
            <ProfileRow title="Insurance Coverage" value="Up to ₦5,000 coverage" action="edit" />
          </div>
        </div>
      </section>
    </BusinessShell>
  )
}

