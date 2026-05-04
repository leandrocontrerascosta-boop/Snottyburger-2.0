import type { CartItem, ModifierChoice, Product } from "@/lib/types/order";

export function findProductById(products: Product[], productId: string): Product | null {
  return products.find((item) => item.id === productId) ?? null;
}

export function getProductById(products: Product[], productId: string): Product {
  const product = findProductById(products, productId);

  if (!product) {
    throw new Error(`Unknown product: ${productId}`);
  }

  return product;
}

export function getChoiceMap(product: Product): Map<string, ModifierChoice> {
  return new Map(product.modifierGroups.flatMap((group) => group.choices.map((choice) => [choice.id, choice])));
}

export function getCustomizationDelta(product: Product, choiceIds: string[]): number {
  const choiceMap = getChoiceMap(product);

  return choiceIds.reduce((total, choiceId) => total + (choiceMap.get(choiceId)?.priceDelta ?? 0), 0);
}

export function getCartLineTotal(item: CartItem, products: Product[]): number {
  const product = findProductById(products, item.productId);

  if (!product) {
    return 0;
  }

  const delta = getCustomizationDelta(product, item.selectedChoiceIds);
  return (product.price + delta) * item.quantity;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function createCartItemId(productId: string, choiceIds: string[], note?: string): string {
  const normalizedNote = note?.trim().toLowerCase().replace(/\s+/g, "-") || "no-note";
  return `${productId}__${choiceIds.slice().sort().join(".") || "base"}__${normalizedNote}`;
}