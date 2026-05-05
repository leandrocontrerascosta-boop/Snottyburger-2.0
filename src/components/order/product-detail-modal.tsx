import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { formatCurrency, getCustomizationDelta } from "@/lib/pricing/order-pricing";
import type { Product } from "@/lib/types/order";
import { QuantityStepper } from "@/components/order/quantity-stepper";

type ProductDetailModalProps = {
  product: Product | null;
  canOrder: boolean;
  closedMessage?: string;
  onClose: () => void;
  onAddToCart: (payload: { productId: string; quantity: number; selectedChoiceIds: string[]; note?: string }) => void;
};

function getDefaultChoiceIds(product: Product | null): string[] {
  if (!product) {
    return [];
  }

  return product.modifierGroups
    .filter((group) => group.type === "single" && group.choices.length > 0)
    .map((group) => group.choices[0]?.id)
    .filter((choiceId): choiceId is string => Boolean(choiceId));
}

export function ProductDetailModal({ product, canOrder, closedMessage, onClose, onAddToCart }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedChoiceIds, setSelectedChoiceIds] = useState<string[]>(() => getDefaultChoiceIds(product));
  const [note, setNote] = useState("");
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const isBurger = product?.categoryId === "burgers";

  const total = useMemo(() => {
    if (!product) {
      return 0;
    }

    return (product.price + getCustomizationDelta(product, selectedChoiceIds)) * quantity;
  }, [product, quantity, selectedChoiceIds]);

  useEffect(() => {
    if (!product) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, product]);

  if (!product) {
    return null;
  }

  const handleChoiceToggle = (choiceId: string, groupChoiceIds: string[], single: boolean) => {
    setSelectedChoiceIds((current) => {
      if (single) {
        const withoutGroup = current.filter((id) => !groupChoiceIds.includes(id));
        return current.includes(choiceId) ? withoutGroup : [...withoutGroup, choiceId];
      }

      return current.includes(choiceId) ? current.filter((id) => id !== choiceId) : [...current, choiceId];
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[rgba(18,21,26,0.6)] p-2 backdrop-blur-sm sm:p-3 md:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="detalle-producto-titulo"
    >
      <div
        className="mx-auto flex h-[calc(100dvh-1rem)] max-w-[1310px] flex-col overflow-hidden rounded-[24px] border border-white/20 bg-[var(--surface)] shadow-[0_50px_100px_rgba(20,14,12,0.34)] sm:h-[calc(100dvh-1.5rem)] sm:rounded-[30px] lg:h-[92vh] lg:grid lg:grid-cols-[340px_minmax(0,1fr)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="order-2 flex min-h-0 flex-col border-t border-[var(--line)] lg:order-1 lg:border-r lg:border-t-0">
          <div className="flex min-h-0 flex-1 flex-col px-3 py-3 sm:px-5 sm:py-5 md:px-6">
            <div className="mb-2 flex items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] sm:mb-4 sm:text-sm sm:tracking-[0.24em]">
              <button type="button" onClick={onClose} className="text-lg leading-none text-[var(--muted)] transition hover:text-[var(--foreground)] sm:text-xl">
                ←
              </button>
              <span>{product.categoryId}</span>
            </div>

            <div className="space-y-1.5">
              <h2 id="detalle-producto-titulo" className="text-[1.3rem] font-semibold tracking-[-0.05em] text-[var(--foreground)] sm:text-3xl">{product.name}</h2>
              <p className="line-clamp-2 text-[12px] leading-5 text-[var(--muted)] sm:line-clamp-none sm:text-[15px] sm:leading-7">{product.description}</p>
            </div>

            <div className="mt-3 sm:mt-6">
              <QuantityStepper
                value={quantity}
                onIncrease={() => setQuantity((current) => current + 1)}
                onDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
              />
            </div>

            <div className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 sm:mt-6 sm:space-y-5">
              {product.modifierGroups.map((group) => (
                <section key={group.id} className="space-y-2 border-t border-[var(--line)] pt-3 sm:space-y-3 sm:pt-5">
                  <header>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)] sm:text-xs sm:tracking-[0.18em]">{group.title}</p>
                    {group.description ? <p className="mt-0.5 text-xs text-[var(--muted)] sm:mt-1 sm:text-sm">{group.description}</p> : null}
                  </header>
                  <div className="space-y-2">
                    {group.choices.map((choice) => {
                      const checked = selectedChoiceIds.includes(choice.id);
                      return (
                        <label
                          key={choice.id}
                          className="flex cursor-pointer items-center justify-between gap-2 rounded-[14px] border border-[var(--line)] bg-white px-2.5 py-2 text-[12px] transition hover:border-[var(--brand)] sm:gap-3 sm:rounded-[16px] sm:px-3 sm:py-3 sm:text-sm"
                        >
                          <span className="flex items-center gap-2 sm:gap-3">
                            <input
                              type={group.type === "single" ? "radio" : "checkbox"}
                              name={group.id}
                              checked={checked}
                              onChange={() =>
                                handleChoiceToggle(
                                  choice.id,
                                  group.choices.map((groupChoice) => groupChoice.id),
                                  group.type === "single",
                                )
                              }
                              className="h-4 w-4 accent-[var(--brand)]"
                            />
                            <span className="leading-4">{choice.label}</span>
                          </span>
                          <span className="text-[11px] font-medium text-[var(--muted)] sm:text-sm">
                            {choice.priceDelta > 0 ? formatCurrency(choice.priceDelta) : "Incluido"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>
              ))}

              <section className="space-y-2 border-t border-[var(--line)] pt-3 sm:space-y-3 sm:pt-5">
                <header>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)] sm:text-xs sm:tracking-[0.18em]">Observacion</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)] sm:mt-1 sm:text-sm">Aclara algo para cocina. Ejemplo: sin cebolla.</p>
                </header>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={2}
                  maxLength={180}
                  placeholder="Sin cebolla, sin ketchup, bien cocida..."
                  className="w-full resize-none rounded-[14px] border border-[var(--line)] bg-white px-3 py-2 text-xs text-[var(--foreground)] outline-none transition focus:border-[var(--brand)] sm:rounded-[16px] sm:px-4 sm:py-3 sm:text-sm"
                />
              </section>

              {isBurger ? (
                <p className="text-[11px] text-[var(--muted)] sm:hidden">Tip: los extras ya incluyen la diferencia de precio de simple/doble.</p>
              ) : null}
            </div>
          </div>

          <div className="border-t border-[var(--line)] bg-[var(--surface)] p-2.5 sm:p-4">
            {!canOrder ? <p className="mb-2 text-xs text-[var(--muted)]">{closedMessage ?? "Local cerrado. Solo lectura."}</p> : null}
            <button
              type="button"
              onClick={() => {
                if (!canOrder) {
                  return;
                }
                onAddToCart({ productId: product.id, quantity, selectedChoiceIds, note });
                onClose();
              }}
              disabled={!canOrder}
              className="flex w-full items-center justify-between rounded-[16px] bg-[var(--brand)] px-3 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:bg-[#d8d0d1] disabled:text-[#837a7b] sm:rounded-[18px] sm:px-5 sm:py-4 sm:text-base"
            >
              <span>{canOrder ? "Agregar al carrito" : "Local cerrado"}</span>
              <span>{formatCurrency(total)}</span>
            </button>
          </div>
        </div>

        <div className="relative order-1 min-h-[120px] bg-[#f0e7db] sm:min-h-[280px] lg:order-2 lg:min-h-full">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/94 text-xl text-[var(--foreground)] shadow-[0_14px_30px_rgba(21,17,15,0.14)] transition hover:text-[var(--brand)] sm:right-4 sm:top-4 sm:h-12 sm:w-12 sm:text-2xl"
          >
            ×
          </button>
          <button
            type="button"
            onClick={() => setIsImageFullscreen(true)}
            className="absolute inset-0 h-full w-full cursor-zoom-in"
            aria-label="Ver imagen completa"
          />
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 65vw, 900px"
          />
        </div>

        {isImageFullscreen ? (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setIsImageFullscreen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Imagen completa"
          >
            <button
              type="button"
              onClick={() => setIsImageFullscreen(false)}
              className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl text-white transition hover:bg-white/30"
              aria-label="Cerrar imagen"
            >
              ×
            </button>
            <div
              className="relative max-h-[90dvh] w-full max-w-3xl cursor-zoom-out overflow-hidden rounded-[20px] shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={product.image}
                alt={product.name}
                width={1200}
                height={900}
                className="h-auto w-full object-contain"
                priority
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}