import { cn } from "@/lib/utils"

const LOGO_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  jumia: {
    bg: "bg-[#F97316]",
    text: "text-white",
    label: "J",
  },
  speedaf: {
    bg: "bg-[#EA580C]",
    text: "text-white",
    label: "S",
  },
  "uber-eats": {
    bg: "bg-neutral-900",
    text: "text-[#06C167]",
    label: "UE",
  },
  "grocery-express": {
    bg: "bg-white ring-1 ring-neutral-200",
    text: "text-emerald-600",
    label: "GE",
  },
}

export function CourierLogo({
  courierId,
  name,
  className,
}: {
  courierId: string
  name: string
  className?: string
}) {
  const style = LOGO_STYLES[courierId] ?? {
    bg: "bg-brand-secondary/15",
    text: "text-brand-primary",
    label: name.slice(0, 2).toUpperCase(),
  }

  return (
    <div
      className={cn(
        "flex size-14 shrink-0 items-center justify-center rounded-xl text-sm font-bold md:size-16 md:text-base",
        style.bg,
        style.text,
        className,
      )}
      aria-hidden
    >
      {style.label}
    </div>
  )
}
