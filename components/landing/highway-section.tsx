import Image from "next/image"

export function HighwaySection() {
  return (
    <section
      className="w-full border-y-2 border-brand-secondary bg-transparent"
      aria-hidden
    >
      <div className="relative w-full overflow-hidden">
        <Image
          src="/Highway.png"
          alt=""
          width={1440}
          height={157}
          className="h-auto w-full object-cover object-center"
          sizes="100vw"
        />

        {/* Top lane (LTR): two bikes visible as a pair */}
        <div className="pointer-events-none absolute left-[-12%] top-[28%]">
          <div className="flex items-center gap-8 sm:gap-10 animate-highway-vehicle-ltr">
            
            <Image
              src="/Delivery Man Riding Scooter.C01.2k 4.png"
              alt="Delivery bike"
              width={163}
              height={86}
              className="h-6 w-auto object-contain sm:h-7 md:h-8"
            />
          </div>
        </div>

        {/* Bottom lane (RTL): pink-bag bike + truck visible as a pair */}
        <div className="pointer-events-none absolute right-[-12%] top-[62%]">
          <div className="flex items-center gap-9 sm:gap-11 animate-highway-vehicle-rtl">
            <Image
              src="/Delivery Man Riding Scooter.C01.2k 3.png"
              alt="Delivery bike"
              width={168}
              height={86}
              className="h-6 w-auto object-contain sm:h-7 md:h-8"
            />
            <Image
              src="/Electric Delivery Van.B09.2k.png"
              alt="Delivery van"
              width={163}
              height={86}
              className="h-6 w-auto object-contain sm:h-7 md:h-8"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
