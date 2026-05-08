"use client"

import { ChevronRight } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { Audience } from "@/components/landing/audience"
import { cn } from "@/lib/utils"

const USER_FAQ_ITEMS = [
  {
    q: "What is Uptions?",
    a: "Uptions is a delivery marketplace that connects you with trusted courier and logistics providers so you can book, compare, and track shipments in one place.",
  },
  {
    q: "Why use Uptions over a direct provider?",
    a: "You see multiple qualified options side by side—pricing, speed, and ratings—so you can pick what fits your budget and timeline instead of calling around.",
  },
  {
    q: "Is Uptions free to use?",
    a: "Browsing options and getting estimates is free. You pay your chosen provider according to their rates when you book a delivery.",
  },
  {
    q: "How does Uptions find the best price?",
    a: "We match your shipment details to providers that serve your route and vehicle needs, then surface competitive quotes from that eligible set.",
  },
  {
    q: "What if I have a problem with my delivery?",
    a: "You can report issues from your order timeline. Our team and the provider work with you to resolve delays, damage, or disputes as quickly as possible.",
  },
  {
    q: "How do I pay for my delivery?",
    a: "Payment methods depend on the provider you choose. You’ll see instructions at checkout—often bank transfer or card—and your receipt references your Uptions order ID.",
  },
] as const

const BUSINESS_FAQ_ITEMS = [
  {
    q: "What is Uptions for businesses?",
    a: "Uptions helps delivery businesses receive verified customer requests, assign riders faster, and keep fleets productive with less idle time.",
  },
  {
    q: "Why should I join instead of finding my own clients?",
    a: "Instead of spending heavily on outreach, you get matched to demand from customers already looking for delivery services right now.",
  },
  {
    q: "Is Uptions free to use?",
    a: "Creating and maintaining your business profile is free. Service-related charges, if any, are clearly shown before you accept jobs.",
  },
  {
    q: "Is it free to join?",
    a: "Yes, onboarding is free. You can complete setup and start receiving opportunities without an upfront subscription fee.",
  },
  {
    q: "How does Uptions send me jobs?",
    a: "When customer requests match your service area and capacity, jobs appear in your dashboard so you can review, assign, and track fulfillment.",
  },
  {
    q: "What if my rider has a problem on a job?",
    a: "You can update job status in real time and flag issues. Uptions support and your operations team can coordinate next actions quickly.",
  },
  {
    q: "How do I track my jobs?",
    a: "Your business dashboard shows job progress, assignments, and delivery status so you can monitor each order from acceptance to completion.",
  },
] as const

export function FaqSection({ audience }: { audience: Audience }) {
  const items = audience === "business" ? BUSINESS_FAQ_ITEMS : USER_FAQ_ITEMS

  return (
    <div
      key={audience}
      className="animate-hero-content-swap mx-auto w-full max-w-3xl px-4 py-16 md:px-6 md:py-24"
    >
      <div className="mx-auto w-fit max-w-full text-center">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-brand-primary md:text-4xl">
          We know you&apos;ve got{" "}
          <span className="text-brand-secondary">questions</span>
        </h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Doodle.svg"
          alt=""
          className="pointer-events-none mt-3 h-auto w-full min-w-0 object-contain object-center"
          aria-hidden
        />
      </div>

      <Accordion type="single" collapsible className="mt-12 flex w-full flex-col gap-3 md:mt-14">
        {items.map((item, index) => (
          <AccordionItem
            key={item.q}
            value={`faq-${index}`}
            className={cn(
              "rounded-xl border border-brand-secondary/25 bg-brand-white px-4 shadow-none",
              "not-last:border-b-0",
            )}
          >
            <AccordionTrigger
              className={cn(
                "items-center py-4 text-left hover:no-underline",
                "[&_[data-slot=accordion-trigger-icon]]:hidden",
              )}
            >
              <span className="flex w-full items-center justify-between gap-3 pr-1">
                <span className="font-semibold text-brand-primary">{item.q}</span>
                <ChevronRight
                  aria-hidden
                  className="pointer-events-none size-4 shrink-0 text-brand-primary transition-transform duration-200 group-aria-expanded/accordion-trigger:rotate-90"
                />
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-brand-foreground">
              <p className="pb-3 text-sm leading-relaxed md:text-base">{item.a}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
