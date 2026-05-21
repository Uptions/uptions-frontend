import Image from "next/image"

/** Matches public/Highway.png — keeps lane % positioning stable on all viewports */
const HIGHWAY_ASPECT = "1440 / 157"

const vehicleClass =
  "h-7 w-auto object-contain sm:h-8 md:h-9 [object-position:bottom]"

export function HighwaySection() {
  return (
    <section
      className="w-full border-y-2 border-brand-secondary bg-transparent"
      aria-hidden
    >
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: HIGHWAY_ASPECT }}
      >
        <Image
          src="/Highway.png"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
        />

        {/* Upper asphalt lane (below top blue border) */}
        <div className="pointer-events-none absolute inset-x-0 top-[11%] h-[34%]">
          <div className="flex h-full items-center">
            <div className="flex items-end gap-6 sm:gap-8 animate-highway-vehicle-ltr pl-[2%]">
              <Image
                src="/Delivery Man Riding Scooter.C01.2k 4.png"
                alt=""
                width={163}
                height={86}
                className={vehicleClass}
              />
              <Image
                src="/Delivery Man Riding Scooter.C01.2k 3.png"
                alt=""
                width={168}
                height={86}
                className={vehicleClass}
              />
            </div>
          </div>
        </div>

        {/* Lower asphalt lane (above bottom blue border) */}
        <div className="pointer-events-none absolute inset-x-0 top-[45%] h-[34%]">
          <div className="flex h-full items-center">
            <div className="flex w-full items-end justify-end gap-6 sm:gap-9 animate-highway-vehicle-rtl pr-[2%]">
              <Image
                src="/Delivery Man Riding Scooter.C01.2k 3.png"
                alt=""
                width={168}
                height={86}
                className={vehicleClass}
              />
              <Image
                src="/Electric Delivery Van.B09.2k.png"
                alt=""
                width={163}
                height={86}
                className={vehicleClass}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
