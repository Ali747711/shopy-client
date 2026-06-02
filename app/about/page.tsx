import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  MessageSquare,
  PackageCheck,
  ShieldCheck,
  AudioWaveform,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "About — Shopy",
  description:
    "Shopy is an AI-native store. Describe what you want in plain English and the assistant recommends real products from the catalog.",
};

const VALUES = [
  {
    icon: MessageSquare,
    title: "Describe, don’t dig",
    desc: "Skip endless filters. Tell the assistant what you mean and it does the searching for you.",
  },
  {
    icon: AudioWaveform,
    title: "Grounded recommendations",
    desc: "Every suggestion is pulled from the live catalog — no invented products, no hallucinations.",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    desc: "Card payments via Stripe and cash on delivery, with clear order and payment status.",
  },
  {
    icon: PackageCheck,
    title: "Multi-currency",
    desc: "USD base with live conversion to EUR, GBP, KWD and UZS at checkout.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Describe",
    desc: "Open the assistant and say what you’re after — a budget, a use case, a vibe.",
  },
  {
    n: "02",
    title: "Refine",
    desc: "It asks the right follow-ups and narrows results across the live catalog.",
  },
  {
    n: "03",
    title: "Decide",
    desc: "Pick from grounded recommendations and head straight to the product or checkout.",
  },
];

const FAQS = [
  {
    q: "How is this different from a normal search bar?",
    a: "A keyword search matches words. Shopy reads intent — it understands “lightweight jacket for rainy weather under $80” as a category, a price ceiling, and attributes, then blends vector similarity with structured filters.",
  },
  {
    q: "Does the assistant make up products?",
    a: "No. Every answer is grounded in the live catalog using retrieval-augmented generation — the model only recommends products that were actually retrieved.",
  },
  {
    q: "Do I need an account to browse?",
    a: "No. You can chat, search, and explore the full catalog anonymously. An account is only needed to place an order and get personalized recommendations.",
  },
  {
    q: "What payment methods are supported?",
    a: "Card payments via Stripe Checkout, plus cash on delivery. Orders track payment status from unpaid through paid, failed, or refunded.",
  },
  {
    q: "Which currencies can I shop in?",
    a: "USD is the base currency, with live conversion to EUR, GBP, KWD and UZS. Prices and order totals are shown in your chosen currency.",
  },
];

export default function AboutPage() {
  return (
    <main className="lime-wash min-h-svh">
      <div className="mx-auto w-full max-w-4xl px-4 pt-24 pb-16 sm:pt-28">
        {/* Intro */}
        <span className="inline-flex items-center gap-2 border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium tracking-wide text-primary uppercase">
          <AudioWaveform className="size-3.5" />
          About Shopy
        </span>
        <h1 className="font-heading mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          Shopping that understands what you mean
        </h1>
        <p className="mt-4 max-w-2xl text-base/relaxed text-muted-foreground text-pretty">
          Shopy is an AI-native store. Instead of hunting through filters, you
          describe what you want in plain English — and a shopping assistant,
          grounded in the real catalog, finds it.
        </p>

        {/* Values */}
        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          {VALUES.map((value) => (
            <div key={value.title} className="border border-border bg-card p-5">
              <span className="grid size-9 place-items-center bg-primary/15 text-primary ring-1 ring-primary/25">
                <value.icon className="size-4.5" />
              </span>
              <h3 className="font-heading mt-4 text-base font-semibold">
                {value.title}
              </h3>
              <p className="mt-1.5 text-sm/relaxed text-muted-foreground">
                {value.desc}
              </p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <h2 className="font-heading mt-16 text-2xl font-bold tracking-tight">
          How it works
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="border border-border bg-card p-5">
              <span className="font-heading text-3xl font-bold text-primary">
                {step.n}
              </span>
              <h3 className="font-heading mt-3 text-base font-semibold">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm/relaxed text-muted-foreground">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <h2 className="font-heading mt-16 text-2xl font-bold tracking-tight">
          Frequently asked
        </h2>
        <Accordion type="single" collapsible className="mt-4 w-full">
          {FAQS.map((faq, index) => (
            <AccordionItem key={faq.q} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-sm">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="max-w-prose text-sm/relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* CTA */}
        <div className="mt-14 flex flex-col items-start gap-4 border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold tracking-tight">
              Ready to try it?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Describe what you need — the assistant takes it from there.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-1.5 bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start shopping
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
