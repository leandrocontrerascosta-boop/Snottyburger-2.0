import type { PromoBanner } from "@/lib/types/order";

type PromoStripProps = {
  promo: PromoBanner;
};

export function PromoStrip({ promo }: PromoStripProps) {
  return (
    <section className="rounded-[24px] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 shadow-[0_18px_40px_rgba(31,22,18,0.05)]">
      <div className="flex items-center justify-center gap-3 text-center sm:text-left">
        <div className="display-font inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--brand)] bg-white text-xl text-[var(--brand)]">
          {promo.iconText}
        </div>
        <p className="text-sm md:text-[15px]">
          <span className="font-medium text-[var(--foreground)]">{promo.leadingText} </span>
          <span className="font-semibold text-[var(--brand)]">{promo.accentText}</span>
        </p>
      </div>
    </section>
  );
}