import Image from "next/image";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/pricing/order-pricing";
import type { Product } from "@/lib/types/order";
import { QuantityStepper } from "@/components/order/quantity-stepper";

type PromoDetailModalProps = {
  promoProduct: Product | null;
  canOrder: boolean;
  closedMessage?: string;
  onClose: () => void;
  onAddToCart: (payload: { productId: string; quantity: number; selectedChoiceIds: string[]; note?: string }) => void;
};

export function PromoDetailModal({ promoProduct, canOrder, closedMessage, onClose, onAddToCart }: PromoDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  const total = useMemo(() => {
    if (!promoProduct) {
      return 0;
    }

    return promoProduct.price * quantity;
  }, [promoProduct, quantity]);

  if (!promoProduct) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(18,21,26,0.6)] p-2 backdrop-blur-sm sm:p-3 md:p-6" onClick={onClose}>
      <div
        className="mx-auto flex h-[calc(100dvh-1rem)] max-w-[1200px] flex-col overflow-hidden rounded-[24px] border border-white/20 bg-[var(--surface)] shadow-[0_50px_100px_rgba(20,14,12,0.34)] sm:h-[calc(100dvh-1.5rem)] sm:rounded-[30px] lg:h-[88vh] lg:grid lg:grid-cols-[360px_minmax(0,1fr)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative order-1 min-h-[180px] bg-[#f0e7db] lg:order-1 lg:min-h-full">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/94 text-xl text-[var(--foreground)] shadow-[0_14px_30px_rgba(21,17,15,0.14)] transition hover:text-[var(--brand)]"
          >
            ×
          </button>
          <Image
            src={promoProduct.image}
            alt={promoProduct.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 420px"
          />
        </div>

        <div className="order-2 flex min-h-0 flex-col border-t border-[var(--line)] lg:order-2 lg:border-l lg:border-t-0">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Promo especial</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">{promoProduct.name}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{promoProduct.description}</p>

            <div className="mt-6 flex items-end gap-3">
              {promoProduct.originalPrice ? (
                <span className="text-sm text-[var(--muted)] line-through">{formatCurrency(promoProduct.originalPrice)}</span>
              ) : null}
              <span className="text-2xl font-semibold text-[var(--brand)]">{formatCurrency(promoProduct.price)}</span>
            </div>

            <div className="mt-6">
              <QuantityStepper
                value={quantity}
                onIncrease={() => setQuantity((current) => current + 1)}
                onDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
              />
            </div>

            <section className="mt-6 space-y-2 border-t border-[var(--line)] pt-5">
              <header>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Observaciones</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Puedes aclarar detalles para cocina en este pedido de promo.</p>
              </header>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                maxLength={180}
                placeholder="Ej: sin cebolla, bien cocida, sin salsa..."
                className="w-full resize-none rounded-[14px] border border-[var(--line)] bg-white px-3 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--brand)]"
              />
            </section>
          </div>

          <div className="border-t border-[var(--line)] bg-[var(--surface)] p-4">
            {!canOrder ? <p className="mb-2 text-xs text-[var(--muted)]">{closedMessage ?? "Local cerrado. Solo lectura."}</p> : null}
            <button
              type="button"
              onClick={() => {
                if (!canOrder) {
                  return;
                }

                onAddToCart({
                  productId: promoProduct.id,
                  quantity,
                  selectedChoiceIds: [],
                  note,
                });
                onClose();
              }}
              disabled={!canOrder}
              className="flex w-full items-center justify-between rounded-[16px] bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:bg-[#d8d0d1] disabled:text-[#837a7b]"
            >
              <span>{canOrder ? "Agregar promo al carrito" : "Local cerrado"}</span>
              <span>{formatCurrency(total)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
