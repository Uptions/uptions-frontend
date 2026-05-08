"use client"

import { Star } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatNaira, type CourierOptionDTO } from "@/lib/delivery-quotes"

import { CourierLogo } from "./courier-logo"

function StarRow({ rating }: { rating: number }) {
  const full = Math.max(0, Math.min(5, Math.round(rating)))
  return (
    <div className="flex gap-0.5" aria-label={`${full} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4 md:size-[1.05rem]",
            i < full ? "fill-brand-secondary text-brand-secondary" : "text-brand-secondary/25",
          )}
          aria-hidden
        />
      ))}
    </div>
  )
}

export function CourierCard({
  courier,
  selected,
  onSelect,
}: {
  courier: CourierOptionDTO
  selected: boolean
  onSelect: (id: string) => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(courier.id)}
      className={cn(
        "flex w-full gap-4 rounded-2xl border-2 p-4 text-left transition-colors md:gap-5 md:p-5",
        "bg-[#EEF5FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:ring-offset-2",
        selected
          ? "border-brand-secondary shadow-[0_0_0_1px_rgba(0,123,255,0.12)]"
          : "border-brand-secondary/35 hover:border-brand-secondary/60",
      )}
    >
      <CourierLogo courierId={courier.id} name={courier.name} />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-brand-foreground">{courier.name}</p>
        <div className="mt-1.5">
          <StarRow rating={courier.rating} />
        </div>
      </div>
      <div className="shrink-0 self-center text-right">
        <p className="text-lg font-bold text-brand-primary md:text-xl">
          {formatNaira(courier.priceNaira)}
        </p>
      </div>
    </button>
  )
}
