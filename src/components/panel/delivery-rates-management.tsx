"use client";

import type { Dispatch, SetStateAction } from "react";
import type { DeliveryRate } from "@/lib/types/delivery";
import { formatCurrency } from "@/lib/pricing/order-pricing";

type DeliveryRatesManagementProps = {
  rates: DeliveryRate[];
  onChangeRates: Dispatch<SetStateAction<DeliveryRate[]>>;
};

export function DeliveryRatesManagement({ rates, onChangeRates }: DeliveryRatesManagementProps) {
  const sortedRates = rates.slice().sort((left, right) => left.maxDistanceKm - right.maxDistanceKm);

  return (
    <section className="space-y-4 rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] md:p-5">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Costos de delivery</p>
        <h2 className="text-xl font-semibold tracking-[-0.03em]">Tarifas por tramo</h2>
        <p className="text-sm text-[var(--muted)]">Edita rapido cada rango y su precio de envio.</p>
      </header>

      <div className="overflow-hidden rounded-[16px] border border-[var(--line)] bg-white">
        <div className="hidden grid-cols-[84px_1fr_1fr_92px] gap-2 border-b border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)] md:grid">
          <span>Tramo</span>
          <span>Hasta (km)</span>
          <span>Precio</span>
          <span>Accion</span>
        </div>

        <div className="divide-y divide-[var(--line)]">
          {sortedRates.map((rate, index) => (
            <div key={rate.id} className="grid gap-2 px-3 py-3 md:grid-cols-[84px_1fr_1fr_92px] md:items-center">
              <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Tramo {index + 1}</div>

              <label className="space-y-1 text-xs font-medium text-[var(--muted)] md:space-y-0 md:text-sm md:text-[var(--foreground)]">
                <span className="md:hidden">Hasta (km)</span>
                <input
                  type="number"
                  min={1}
                  step="0.5"
                  value={rate.maxDistanceKm}
                  onChange={(event) => {
                    const nextValue = Number(event.target.value) || 0;
                    onChangeRates((previous) =>
                      previous.map((item) => (item.id === rate.id ? { ...item, maxDistanceKm: nextValue } : item)),
                    );
                  }}
                  className="w-full rounded-lg border border-[var(--line)] bg-white px-2.5 py-2 text-sm outline-none ring-[var(--brand)]/30 transition focus:ring-2"
                />
              </label>

              <label className="space-y-1 text-xs font-medium text-[var(--muted)] md:space-y-0 md:text-sm md:text-[var(--foreground)]">
                <span className="md:hidden">Precio</span>
                <input
                  type="number"
                  min={0}
                  step="100"
                  value={rate.price}
                  onChange={(event) => {
                    const nextValue = Number(event.target.value) || 0;
                    onChangeRates((previous) =>
                      previous.map((item) => (item.id === rate.id ? { ...item, price: nextValue } : item)),
                    );
                  }}
                  className="w-full rounded-lg border border-[var(--line)] bg-white px-2.5 py-2 text-sm outline-none ring-[var(--brand)]/30 transition focus:ring-2"
                />
                <p className="text-[11px] text-[var(--muted)] md:hidden">{formatCurrency(rate.price)}</p>
              </label>

              <button
                type="button"
                onClick={() => {
                  onChangeRates((previous) => previous.filter((item) => item.id !== rate.id));
                }}
                disabled={rates.length === 1}
                className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--muted)]">Se aplica el primer tramo que cubra la distancia del pedido.</p>
        <button
          type="button"
          onClick={() => {
            const nextMax = Math.max(...rates.map((rate) => rate.maxDistanceKm), 0) + 2;
            onChangeRates((previous) => [
              ...previous,
              {
                id: `delivery-${crypto.randomUUID()}`,
                maxDistanceKm: nextMax,
                price: 0,
              },
            ]);
          }}
          className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
        >
          Agregar tramo
        </button>
      </div>
    </section>
  );
}
