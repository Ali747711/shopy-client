"use client";

import { useState } from "react";
import { ArrowUp, AudioWaveform } from "lucide-react";

import { ShoppingAssistant } from "@/components/ai/shopping-assistant";
import { ProductShowcase } from "@/components/landing/product-showcase";
import { BlurFade } from "@/components/ui/blur-fade";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";

export function LandingExperience() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <main className="lime-wash relative min-h-svh">
      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(480px_circle_at_50%_22%,white,transparent)]",
        )}
      />

      {/* Hero */}
      <section className="relative flex h-svh flex-col items-center px-4 pt-[15vh] text-center sm:pt-[17vh]">
        <BlurFade delay={0.1} inView>
          <span className="inline-flex items-center gap-2 border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium tracking-wide text-primary uppercase">
            <AudioWaveform className="size-3.5" />
            AI shopping assistant
          </span>
        </BlurFade>

        <BlurFade delay={0.22} inView>
          <h1 className="font-heading mt-6 text-4xl font-bold tracking-tight text-balance sm:text-6xl xl:text-7xl">
            Just describe it.
            <br />
            We&apos;ll find it.
          </h1>
        </BlurFade>

        <BlurFade delay={0.34} inView>
          <p className="mx-auto mt-5 max-w-xl text-base/relaxed text-muted-foreground text-pretty">
            Shopy is an AI-native store. Tell our assistant what you need in
            plain English — it asks the right questions, then recommends real
            products from the catalog.
          </p>
        </BlurFade>

        {/* Chat trigger — opens the shopping assistant */}
        <BlurFade delay={0.48} inView className="mt-9 w-full max-w-xl">
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="glass group flex w-full items-center gap-3 border-border px-4 py-3.5 text-left shadow-lg shadow-black/5 transition-colors hover:border-primary/60"
          >
            <span className="grid size-9 shrink-0 place-items-center bg-primary text-primary-foreground">
              <AudioWaveform className="size-4" />
            </span>
            <span className="flex-1 text-sm text-muted-foreground">
              Ask the shopping assistant SHOPY…
            </span>
            <span className="grid size-9 shrink-0 place-items-center bg-foreground text-background transition-transform group-hover:-translate-y-0.5">
              <ArrowUp className="size-4" />
            </span>
          </button>
        </BlurFade>
      </section>

      {/* Product cards peek into the hero, then reveal on scroll */}
      <div className="relative -mt-[30vh] sm:-mt-[32vh]">
        <ProductShowcase />
      </div>

      <ShoppingAssistant open={chatOpen} onClose={() => setChatOpen(false)} />
    </main>
  );
}
