"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { formatCurrency } from "@/lib/pricing/order-pricing";
import type { Product, PromoDeal } from "@/lib/types/order";

type DiscountPromoRowProps = {
  deals: PromoDeal[];
  productsById: Map<string, Product>;
  onSelectProduct: (product: Product) => void;
  onSelectPromo: (promoProduct: Product) => void;
};

export function DiscountPromoRow({ deals, productsById, onSelectProduct, onSelectPromo }: DiscountPromoRowProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [linkWarning, setLinkWarning] = useState<string | null>(null);

  if (deals.length === 0) {
    return null;
  }

  const scrollByCards = (direction: "left" | "right") => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    const cardStep = 280;
    const distance = direction === "left" ? -cardStep : cardStep;
    scroller.scrollBy({ left: distance, behavior: "smooth" });
  };

  return (
    <section className="space-y-4 sm:space-y-5" role="region" aria-label="Promociones y descuentos de hamburguesas">
      <div className="px-1 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Top de la semana</p>
        <h2 className="text-[2rem] font-semibold tracking-[-0.05em] text-[var(--foreground)] sm:text-4xl md:text-5xl">Destacados</h2>
        <p className="mx-auto max-w-xl text-[13px] leading-6 text-[var(--muted)] sm:text-sm">Combos y descuentos activos para convertir miradas en pedidos.</p>
      </div>

      {linkWarning ? (
        <div className="rounded-[14px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 sm:text-sm">
          {linkWarning}
        </div>
      ) : null}

      <div className="flex items-center gap-3" aria-label="Fila horizontal de promociones">
        <button
          type="button"
          onClick={() => scrollByCards("left")}
          className="hidden shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-lg text-[var(--foreground)] shadow-[0_6px_16px_rgba(31,22,18,0.1)] transition hover:border-[var(--brand)] hover:text-[var(--brand)] md:inline-flex md:h-10 md:w-10"
          aria-label="Desplazar destacados hacia la izquierda"
        >
          &larr;
        </button>

        <div className="relative min-w-0 flex-1">
          <div
            ref={scrollerRef}
            className="grid grid-cols-2 gap-3 pb-2 md:no-scrollbar md:flex md:snap-x md:snap-mandatory md:gap-4 md:overflow-x-auto md:scroll-smooth"
          >
            {deals.map((deal, index) => {
              const linkedProduct = deal.productId ? productsById.get(deal.productId) : undefined;
              const linkedPromoProduct = deal.promoProductId ? productsById.get(deal.promoProductId) : undefined;
              const targetType = linkedProduct ? "product" : linkedPromoProduct ? "promo" : null;
              const cardContent = (
                <>
                  <div className="relative h-24 overflow-hidden bg-[#f0e8de] sm:h-32 md:h-36 xl:h-40">
                    <Image
                      src={deal.image}
                      alt={deal.title}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-[1.04]"
                      sizes="(max-width: 768px) 50vw, 320px"
                      loading={index === 0 ? "eager" : "lazy"}
                      priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
                    <span className="absolute left-2 top-2 inline-flex items-center rounded-full bg-[var(--brand)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] text-white shadow-[0_8px_14px_rgba(191,36,63,0.32)] sm:left-3 sm:top-3 sm:px-3 sm:text-xs">
                      {deal.badge}
                    </span>
                  </div>

                  <div className="space-y-2 px-3 pb-3 pt-3 sm:space-y-2.5 sm:px-3.5 sm:pb-3.5 sm:pt-3.5 md:space-y-3 md:px-4 md:pb-4 md:pt-4">
                    <div>
                      <h3 className="text-[15px] font-semibold leading-5 tracking-[-0.03em] text-[var(--foreground)] sm:text-lg md:text-xl">{deal.title}</h3>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[var(--muted)] sm:text-[13px] sm:leading-5 md:text-sm md:leading-6">{deal.description}</p>
                    </div>

                    <div className="flex items-end justify-between gap-3">
                      <div className="space-y-1">
                        {typeof deal.originalPrice === "number" ? (
                          <p className="text-[10px] text-[var(--muted)] line-through sm:text-xs">{formatCurrency(deal.originalPrice)}</p>
                        ) : null}
                        <p className="text-sm font-semibold text-[var(--brand)] sm:text-base md:text-lg">{deal.promoLabel}</p>
                      </div>
                    </div>
                  </div>
                </>
              );

              return (
                <button
                  key={deal.id}
                  type="button"
                  onClick={() => {
                    if (targetType === "product" && linkedProduct) {
                      setLinkWarning(null);
                      onSelectProduct(linkedProduct);
                      return;
                    }

                    if (targetType === "promo" && linkedPromoProduct) {
                      setLinkWarning(null);
                      onSelectPromo(linkedPromoProduct);
                      return;
                    }

                    setLinkWarning(
                      `La promo "${deal.title}" no esta disponible para compra en este momento. Revisala en Panel > Promos.`,
                    );
                  }}
                  className={`tap-target group relative w-full min-w-0 overflow-hidden rounded-[20px] border bg-[var(--surface)] text-left shadow-[0_16px_34px_rgba(31,22,18,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_44px_rgba(31,22,18,0.14)] md:min-w-[240px] md:max-w-[240px] md:shrink-0 md:snap-start xl:min-w-[260px] xl:max-w-[260px] ${
                    targetType
                      ? "border-[var(--line)]"
                      : "border-amber-300 bg-amber-50/30"
                  }`}
                  aria-label={`Ver detalle de ${deal.title}`}
                >
                  {cardContent}
                </button>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          onClick={() => scrollByCards("right")}
          className="hidden shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-lg text-[var(--foreground)] shadow-[0_6px_16px_rgba(31,22,18,0.1)] transition hover:border-[var(--brand)] hover:text-[var(--brand)] md:inline-flex md:h-10 md:w-10"
          aria-label="Desplazar destacados hacia la derecha"
        >
          &rarr;
        </button>      </div>
    </section>
  );
}

