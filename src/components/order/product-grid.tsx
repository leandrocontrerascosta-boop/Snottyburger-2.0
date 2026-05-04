import type { Category, Product } from "@/lib/types/order";
import { ProductCard } from "@/components/order/product-card";

type ProductGridProps = {
  sections: Array<{
    category: Category;
    products: Product[];
  }>;
  topProductIds: Set<string>;
  onSelectProduct: (product: Product) => void;
};

export function ProductGrid({ sections, topProductIds, onSelectProduct }: ProductGridProps) {
  return (
    <div className="space-y-8 sm:space-y-10" role="region" aria-label="Secciones de productos">
      <nav className="sticky top-2 z-20 -mx-1 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/95 px-2 py-2 shadow-[0_18px_30px_rgba(31,22,18,0.08)] backdrop-blur md:hidden">
        <ul className="grid grid-cols-2 gap-2">
          {sections.map((section) => (
            <li key={section.category.id}>
              <a
                href={`#category-${section.category.id}`}
                className="tap-target flex items-center justify-center rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
              >
                {section.category.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {sections.map((section, sectionIndex) => (
        <section key={section.category.id} id={`category-${section.category.id}`} className="space-y-4 scroll-mt-6 sm:space-y-5">
          <div className="px-1">
            <h2 className="text-[2rem] font-semibold tracking-[-0.05em] text-[var(--foreground)] sm:text-4xl md:text-5xl">
              {section.category.label}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
            {section.products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                priority={sectionIndex === 0 && index === 0}
                badges={getProductBadges(product, topProductIds)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function getProductBadges(product: Product, topProductIds: Set<string>): string[] {
  const badges: string[] = [];

  if (product.badgeText) {
    badges.push(product.badgeText);
  }

  if (topProductIds.has(product.id)) {
    badges.push("Top");
  }

  if (product.discountPercent && product.discountPercent > 0) {
    badges.push("Descuento");
  }

  return Array.from(new Set(badges)).slice(0, 2);
}