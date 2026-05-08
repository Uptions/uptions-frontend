import Image from "next/image"
import type { Audience } from "@/components/landing/audience"

export function AboutUsSection({ audience }: { audience: Audience }) {
  const isBusiness = audience === "business"

  return (
    <div
      key={audience}
      className="animate-hero-content-swap mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-8 pt-12 md:px-6 md:pb-10 md:pt-16"
    >
      <h2 className="max-w-3xl text-center font-heading text-3xl font-medium leading-snug tracking-tight text-brand-secondary md:text-4xl md:leading-snug">
        {isBusiness ? "Unlock Your Growth Power with " : "Unlock Your Delivery Power with "}
        <span className="font-bold font-poppins text-brand-secondary">Uptions.</span>
      </h2>

      <p className="mt-5 max-w-2xl text-center text-base leading-relaxed text-brand-foreground md:text-lg">
        {isBusiness
          ? "Uptions gives you access to ready-to-ship customers and helps your company maximize fleet usage, boost earnings, and reduce downtime."
          : "Uptions simplifies finding the best delivery options by suggesting providers based on your budget and speed needs."}
      </p>

      <div className="relative mt-12 w-full md:mt-14">
        <Image
          src={isBusiness ? "/business-about.png" : "/options.png"}
          alt={
            isBusiness
              ? "Courier handing a parcel to a customer, representing delivery completion"
              : "People comparing delivery options from trusted providers on their phones"
          }
          width={1440}
          height={802}
          className="h-auto w-full object-cover object-center"
          sizes="(min-width: 1280px) 80rem, (min-width: 768px) 90vw, 100vw"
          priority={false}
        />
      </div>
    </div>
  )
}
