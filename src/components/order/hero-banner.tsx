"use client";

import Image from "next/image";
import { useState } from "react";
import { SkeletonBlock } from "@/components/ui/skeleton-block";

type HeroBannerProps = {
  onPrimaryCta: () => void;
};

export function HeroBanner({ onPrimaryCta }: HeroBannerProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <section className="overflow-hidden rounded-[28px] border border-[var(--line)] bg-[#5b1119]">
      <div className="relative h-[170px] w-full sm:h-[220px] lg:h-[250px]">
        {!loaded ? <SkeletonBlock className="absolute inset-0 rounded-none" /> : null}
        <Image
          src="/images/order/banner-home.webp"
          alt="Banner de pedidos de Snottyburger"
          fill
          priority
          onLoad={() => setLoaded(true)}
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 1200px"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2a120f]/70 via-[#2a120f]/30 to-transparent" />
        <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">Ordena en minutos</p>
          <h2 className="mt-1 max-w-[420px] text-xl font-semibold tracking-[-0.03em] text-white sm:text-2xl lg:text-3xl">
            Mordida brutal. Cero espera.
          </h2>
          <button
            type="button"
            onClick={onPrimaryCta}
            className="tap-target mt-3 inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#281310] transition hover:bg-[#fff2e2] sm:mt-4 sm:px-5"
          >
            Pedir ahora
          </button>
        </div>
      </div>
    </section>
  );
}