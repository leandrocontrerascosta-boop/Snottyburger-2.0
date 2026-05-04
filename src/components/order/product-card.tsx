import Image from "next/image";
import { formatCurrency } from "@/lib/pricing/order-pricing";
import type { Product } from "@/lib/types/order";

type ProductCardProps = {
  product: Product;
  onSelect: (product: Product) => void;
  priority?: boolean;
  badges?: string[];
};

export function ProductCard({ product, onSelect, priority = false, badges = [] }: ProductCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className="tap-target group overflow-hidden rounded-[20px] border border-[var(--line)] bg-[var(--surface)] text-left shadow-[0_20px_48px_rgba(31,22,18,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(31,22,18,0.1)] md:rounded-[24px]"
    >
      <div className="relative aspect-square overflow-hidden bg-[#f0e8de] sm:aspect-[1.08] xl:aspect-[1.16]">
        {badges.length > 0 ? (
          <div className="absolute left-2 top-2 z-10 flex flex-wrap gap-1.5 sm:left-3 sm:top-3">
            {badges.map((badge) => (
              <span
                key={badge}
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white sm:text-[11px] ${
                  badge === "Top"
                    ? "bg-[var(--brand)]"
                    : badge === "Picante"
                      ? "bg-[#d3541f]"
                      : "bg-[#1f6a5b]"
                }`}
              >
                {badge}
              </span>
            ))}
          </div>
        ) : null}
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 50vw, 380px"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
        />
      </div>
      <div className="space-y-2 px-3 py-3 sm:space-y-2.5 sm:px-3.5 sm:py-3.5 md:space-y-3 md:px-5 md:py-5">
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <h3 className="text-[15px] font-semibold leading-5 tracking-[-0.02em] text-[var(--foreground)] sm:text-base md:text-lg">{product.name}</h3>
          <div className="flex items-center gap-2">
            {product.originalPrice ? (
              <span className="text-[11px] font-medium text-[var(--muted)] line-through sm:text-xs">{formatCurrency(product.originalPrice)}</span>
            ) : null}
            <span
              className={`text-[13px] font-semibold sm:text-sm md:text-base ${
                product.originalPrice ? "text-[var(--brand)]" : "text-[var(--foreground)]"
              }`}
            >
              {formatCurrency(product.price)}
            </span>
          </div>
        </div>
        <p className="line-clamp-2 text-[11px] leading-4 text-[var(--muted)] sm:text-[12px] sm:leading-5 md:line-clamp-3 md:text-sm md:leading-6">{product.description}</p>
      </div>
    </button>
  );
}