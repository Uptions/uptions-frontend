import Image from "next/image"
import type { Audience } from "@/components/landing/audience"

const USER_WHO_TAGS = [
  "Restaurants",
  "Logistic companies",
  "Students",
  "Individuals",
  "SMEs",
  "E-commerce/Marketplace companies",
  "And lots more",
] as const

const BUSINESS_WHO_TAGS = [
  "Small & mid-size delivery companies",
  "Established logistics companies",
  "Inter-state transport providers",
  "Independent Riders",
] as const

function WhoCanUseBanner({ audience }: { audience: Audience }) {
  const tags = audience === "business" ? BUSINESS_WHO_TAGS : USER_WHO_TAGS

  return (
    <div className="w-full bg-brand-secondary px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between md:gap-10">
        <h2 className="max-w-xl shrink-0 font-poppins font-heading text-2xl font-bold leading-tight text-brand-white md:text-3xl lg:text-4xl">
          Who can use <span className="font-bold text-[#001B6C]">Uptions</span>?
        </h2>
        <ul className="flex flex-1 flex-wrap justify-start gap-2.5 md:justify-end">
          {tags.map((label) => (
            <li key={label}>
              <span className="inline-flex rounded-full bg-brand-white px-4 py-2 text-center text-sm font-medium text-brand-secondary shadow-sm">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function HowItWorksSection({ audience }: { audience: Audience }) {
  const isBusiness = audience === "business"

  return (
    <div key={audience} className="animate-hero-content-swap w-full">
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-6 md:px-6 md:pb-10 md:pt-10">
        <h2 className="mb-12 text-center font-heading text-3xl font-semibold tracking-tight text-brand-secondary md:mb-16 md:text-4xl">
          How <span className="font-bold text-[#001B6C]">Uptions</span> work
        </h2>

        <div className="flex flex-col gap-14 md:gap-20 lg:gap-24">
          {/* Step 1 — image left, text right */}
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
            <div className="relative w-full justify-self-center md:justify-self-start">
              <Image
                src={isBusiness ? "/business-how-1.png" : "/how-1.png"}
                alt={
                  isBusiness
                    ? "Dashboard list showing incoming customer requests"
                    : "Package details form: enter pickup, delivery, and parcel information"
                }
                width={611}
                height={418}
                className="h-auto w-full max-w-xl rounded-lg object-contain md:max-w-none"
                sizes="(min-width: 768px) 45vw, 100vw"
              />
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-poppins text-2xl font-bold text-[#007BFF] md:text-6xl">
                {isBusiness ? "We get the Details." : "Give us the details."}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-brand-foreground md:text-lg">
                {isBusiness
                  ? "Customers tell us what they need delivered."
                  : "Tell us what you&apos;re sending and where—it only takes a sec."}
              </p>
            </div>
          </div>

          {/* Step 2 — text left, image right */}
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
            <div className="order-2 text-center md:order-1 md:text-left">
              <h3 className="font-poppins text-2xl font-bold text-[#007BFF] md:text-6xl">
                {isBusiness ? (
                  "We Ping You"
                ) : (
                  <>
                    Compare delivery <br /> uptions instantly.
                  </>
                )}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-brand-foreground md:text-lg">
                {isBusiness
                  ? "Your company gets matched with a request."
                  : "We scan the streets so you don&apos;t have to—get the best deals instantly."}
              </p>
            </div>
            <div className="relative order-1 w-full justify-self-center md:order-2 md:justify-self-end">
              <Image
                src={isBusiness ? "/business-how-2.svg" : "/how-2.png"}
                alt={
                  isBusiness
                    ? "Business order details panel for accepting and managing delivery jobs"
                    : "List of courier options with ratings and prices"
                }
                width={610}
                height={417}
                className="h-auto w-full max-w-xl rounded-lg object-contain md:max-w-none"
                sizes="(min-width: 768px) 45vw, 100vw"
              />
            </div>
          </div>

          {/* Step 3 — image left, text right */}
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
            <div className="relative w-full justify-self-center md:justify-self-start">
              <Image
                src={isBusiness ? "/business-how-3.svg" : "/how-3.png"}
                alt={
                  isBusiness
                    ? "Courier assignment options for dispatching the right rider"
                    : "Selected courier highlighted to confirm your choice"
                }
                width={610}
                height={417}
                className="h-auto w-full max-w-xl rounded-lg object-contain md:max-w-none"
                sizes="(min-width: 768px) 45vw, 100vw"
              />
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-poppins text-2xl font-bold text-[#007BFF] md:text-6xl">
                {isBusiness ? "Assign & Deliver" : "Pick your fave and get started."}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-brand-foreground md:text-lg">
                {isBusiness
                  ? "Choose a rider, close the job, and get to the next order!"
                  : "Choose your perfect match and let&apos;s get that package moving!"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <WhoCanUseBanner audience={audience} />
    </div>
  )
}
