import { categories, locations, products as fallbackProducts, promoBanner, recommendations } from "@/lib/mocks/order-data";
import type { DrinkItemAdmin, MenuItemAdmin, PromoAdmin } from "@/lib/types/panel";
import type { ModifierGroup, Product, PromoDeal } from "@/lib/types/order";

const fallbackBurgerModifierGroups: ModifierGroup[] = [
  {
    id: "extras",
    title: "Extras",
    type: "multi",
    choices: [
      { id: "extra-cheddar", label: "Queso cheddar", priceDelta: 1000, kind: "extra" },
      { id: "extra-mayo-pot", label: "Pote de mayo", priceDelta: 600, kind: "extra" },
      { id: "extra-egg", label: "Huevo", priceDelta: 500, kind: "extra" },
      { id: "extra-bacon", label: "Bacon", priceDelta: 800, kind: "extra" },
      {
        id: "extra-patty-double-cheese",
        label: "Medallon extra (con doble queso)",
        priceDelta: 3500,
        kind: "addon",
      },
    ],
  },
];

function createBurgerModifiers(doublePrice: number, basePrice: number, sharedModifierGroups: ModifierGroup[]) {
  const modifiers = sharedModifierGroups
    .filter((group) => group.id !== "fries-type")
    .map((group) => ({ ...group, choices: [...group.choices] }));

  if (doublePrice > basePrice) {
    modifiers.unshift({
      id: "burger-size",
      title: "Version",
      type: "multi" as const,
      choices: [
        {
          id: `make-double-${basePrice}`,
          label: "Doble",
          priceDelta: doublePrice - basePrice,
          kind: "addon" as const,
        },
      ],
    });
  }

  return modifiers;
}

function slugifyMenuItem(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function buildBurgerProducts(menuItems: MenuItemAdmin[]): Product[] {
  return buildBurgerProductsWithModifiers(menuItems, fallbackBurgerModifierGroups);
}

export function buildBurgerProductsWithModifiers(menuItems: MenuItemAdmin[], sharedModifierGroups: ModifierGroup[]): Product[] {
  return menuItems
    .filter((item) => item.status === "active")
    .map((item) => {
      const discountPercent = normalizeDiscountPercent(item.discountPercent);
      const discountTarget = item.discountTarget;
      const hasSimpleDiscount = discountPercent > 0 && (discountTarget === "simple" || discountTarget === "both");
      const hasDoubleDiscount = discountPercent > 0 && (discountTarget === "double" || discountTarget === "both");

      const simplePrice = hasSimpleDiscount ? applyPercentDiscount(item.simplePrice, discountPercent) : item.simplePrice;
      const doublePrice = hasDoubleDiscount ? applyPercentDiscount(item.doublePrice, discountPercent) : item.doublePrice;

      return {
        id: slugifyMenuItem(item.name),
        sourceId: item.id,
        categoryId: "burgers" as const,
        name: item.name,
        description: item.description,
        price: simplePrice,
        originalPrice: hasSimpleDiscount ? item.simplePrice : undefined,
        discountPercent: hasSimpleDiscount ? discountPercent : undefined,
        createdAt: item.createdAt,
        image: item.image,
        featured: true,
        badgeText: item.badgeText,
        modifierGroups: createBurgerModifiers(doublePrice, simplePrice, sharedModifierGroups),
      };
    });
}

export function buildDrinkProducts(drinkItems: DrinkItemAdmin[]): Product[] {
  return drinkItems
    .filter((item) => item.status === "active")
    .map((item) => ({
      id: slugifyMenuItem(item.name),
      sourceId: item.id,
      categoryId: "drinks" as const,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      modifierGroups: [],
    }));
}

export function buildOrderProducts(
  menuItems: MenuItemAdmin[],
  drinkItems: DrinkItemAdmin[],
  sharedModifierGroups: ModifierGroup[],
): Product[] {
  const burgers = buildBurgerProductsWithModifiers(menuItems, sharedModifierGroups);
  const drinks = buildDrinkProducts(drinkItems);

  if (burgers.length === 0 && drinks.length === 0) {
    return fallbackProducts;
  }

  return [...burgers, ...drinks];
}

export function buildStandalonePromoProducts(promos: PromoAdmin[]): Product[] {
  return promos
    .filter((promo) => promo.status === "active")
    .map((promo) => ({
      id: getPromoProductId(promo.id),
      sourceId: promo.id,
      categoryId: "promos" as const,
      name: promo.title,
      description: promo.description,
      price: promo.simplePrice,
      originalPrice: promo.doublePrice > promo.simplePrice ? promo.doublePrice : undefined,
      image: promo.image,
      modifierGroups: [],
    }));
}

export function getPromoProductId(promoId: string) {
  return `promo-${promoId}`;
}

export function buildPromoDeals(promos: PromoAdmin[], products: Product[]): PromoDeal[] {
  const promoDealsFromAdmin: PromoDeal[] = promos
    .filter((promo) => promo.status === "active")
    .map((promo) => ({
      id: promo.id,
      promoProductId: getPromoProductId(promo.id),
      title: promo.title,
      description: promo.description,
      image: promo.image,
      badge: promo.badgeText ?? (promo.isCombo ? "Combo" : "Promo"),
      ctaLabel: "Ver promo",
      promoLabel: formatPromoPrice(promo.simplePrice),
      originalPrice: promo.doublePrice > promo.simplePrice ? promo.doublePrice : undefined,
    }));

  const taggedDeals: PromoDeal[] = products
    .filter((product) => product.categoryId === "burgers" && product.badgeText)
    .map((product) => ({
      id: `tagged-${product.id}`,
      productId: product.id,
      title: product.name,
      description: `Marcada como ${product.badgeText} desde Menu.`,
      image: product.image,
      badge: product.badgeText ?? "Destacado",
      ctaLabel: "Ver detalle",
      promoLabel: formatPromoPrice(product.price),
      originalPrice: product.originalPrice,
    }));

  const autoDiscountDeals: PromoDeal[] = products
    .filter((product) => product.categoryId === "burgers" && product.discountPercent)
    .map((product) => ({
      id: `auto-discount-${product.id}`,
      productId: product.id,
      title: product.name,
      description: `Descuento automatico del ${product.discountPercent}% aplicado desde Menu.`,
      image: product.image,
      badge: `${product.discountPercent}% OFF`,
      ctaLabel: "Ver detalle",
      promoLabel: formatPromoPrice(product.price),
      originalPrice: product.originalPrice,
    }));

  const merged: PromoDeal[] = [...taggedDeals, ...autoDiscountDeals, ...promoDealsFromAdmin];
  const deduped = new Map<string, PromoDeal>();
  for (const deal of merged) {
    const key = deal.productId ?? deal.promoProductId ?? deal.id;
    if (!deduped.has(key)) {
      deduped.set(key, deal);
    }
  }

  return Array.from(deduped.values());
}

export function buildRecommendationProducts(products: Product[]) {
  const recommendationSet = new Set(recommendations);
  const mappedFromLegacyIds = products.filter((product) => recommendationSet.has(product.id));

  if (mappedFromLegacyIds.length > 0) {
    return mappedFromLegacyIds;
  }

  return products.filter((product) => product.categoryId === "drinks").slice(0, 3);
}

export { categories, locations, promoBanner, recommendations };

function formatPromoPrice(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function normalizeDiscountPercent(value?: number) {
  if (!value || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(90, Math.round(value)));
}

function applyPercentDiscount(price: number, discountPercent: number) {
  return Math.max(0, Math.round(price * (1 - discountPercent / 100)));
}
