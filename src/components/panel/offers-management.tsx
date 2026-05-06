"use client";

import { useMemo, useState, type FormEvent } from "react";
import { formatCurrency } from "@/lib/pricing/order-pricing";
import type { MenuDiscountTarget, MenuItemAdmin } from "@/lib/types/panel";

type OfferDraft = {
  itemId: string;
  discountPercent: number;
  discountTarget: MenuDiscountTarget;
};

type OffersManagementProps = {
  items: MenuItemAdmin[];
  onSaveOffer: (draft: OfferDraft) => Promise<void>;
  onRemoveOffer: (itemId: string) => Promise<void>;
};

export function OffersManagement({ items, onSaveOffer, onRemoveOffer }: OffersManagementProps) {
  const burgers = useMemo(() => items.filter((item) => item.status === "active"), [items]);
  const offers = useMemo(
    () => burgers.filter((item) => item.discountPercent && item.discountPercent > 0 && item.discountTarget),
    [burgers],
  );

  const [draft, setDraft] = useState<OfferDraft>({
    itemId: burgers[0]?.id ?? "",
    discountPercent: 10,
    discountTarget: "simple",
  });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedItem = burgers.find((item) => item.id === draft.itemId);

  function startEdit(item: MenuItemAdmin) {
    setEditingItemId(item.id);
    setDraft({
      itemId: item.id,
      discountPercent: item.discountPercent ?? 10,
      discountTarget: item.discountTarget ?? "simple",
    });
  }

  function resetForm() {
    setEditingItemId(null);
    setDraft({
      itemId: burgers[0]?.id ?? "",
      discountPercent: 10,
      discountTarget: "simple",
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.itemId || !draft.discountPercent || draft.discountPercent <= 0) {
      return;
    }

    setIsSaving(true);
    try {
      await onSaveOffer({
        ...draft,
        discountPercent: Math.max(1, Math.min(90, Math.round(draft.discountPercent))),
      });
      resetForm();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="space-y-4 rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:space-y-5 sm:p-5 md:rounded-[26px] md:p-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Ofertas</p>
          <h2 className="mt-2 text-[1.9rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-2xl">Gestion de descuentos</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Agrega, modifica o elimina ofertas sin tocar el modal de Menu.</p>
        </div>
        <p className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1.5 text-[13px] font-semibold sm:px-4 sm:py-2 sm:text-sm">
          {offers.length} activas
        </p>
      </header>

      <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-[var(--line)] bg-white/70 p-3 md:grid-cols-4 md:p-4">
        <label className="space-y-1 text-sm font-medium md:col-span-2">
          Burger
          <select
            value={draft.itemId}
            onChange={(event) => setDraft((prev) => ({ ...prev, itemId: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
            required
          >
            {burgers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm font-medium">
          % descuento
          <input
            type="number"
            min={1}
            max={90}
            value={draft.discountPercent}
            onChange={(event) => setDraft((prev) => ({ ...prev, discountPercent: Number(event.target.value) || 0 }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
            required
          />
        </label>

        <label className="space-y-1 text-sm font-medium">
          Aplicar en
          <select
            value={draft.discountTarget}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, discountTarget: event.target.value as MenuDiscountTarget }))
            }
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
          >
            <option value="simple">Simple</option>
            <option value="double">Doble</option>
            <option value="both">Ambas</option>
          </select>
        </label>

        {selectedItem ? (
          <div className="md:col-span-4 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-xs text-[var(--muted)]">
            Preview: {selectedItem.name} · {buildPreviewLabel(selectedItem, draft.discountPercent, draft.discountTarget)}
          </div>
        ) : null}

        <div className="md:col-span-4 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isSaving || burgers.length === 0}
            className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:bg-[#c9c1c2]"
          >
            {isSaving ? "Guardando..." : editingItemId ? "Guardar cambios" : "Agregar oferta"}
          </button>
          {editingItemId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface-strong)]"
            >
              Cancelar edicion
            </button>
          ) : null}
        </div>
      </form>

      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--line)] bg-white/70 md:block">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] bg-[var(--surface-strong)]/70 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            <tr>
              <th className="px-3 py-3">Burger</th>
              <th className="px-3 py-3">Descuento</th>
              <th className="px-3 py-3">Aplicado en</th>
              <th className="px-3 py-3">Preview</th>
              <th className="px-3 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((item) => (
              <tr key={item.id} className="border-b border-[var(--line)] last:border-b-0">
                <td className="px-3 py-3 font-semibold">{item.name}</td>
                <td className="px-3 py-3">{item.discountPercent}%</td>
                <td className="px-3 py-3">{targetLabel(item.discountTarget)}</td>
                <td className="px-3 py-3 text-xs text-[var(--muted)]">
                  {buildPreviewLabel(item, item.discountPercent ?? 0, item.discountTarget ?? "simple")}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold transition hover:bg-[var(--surface-strong)]"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await onRemoveOffer(item.id);
                        if (editingItemId === item.id) {
                          resetForm();
                        }
                      }}
                      className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      Quitar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {offers.map((item) => (
          <article key={item.id} className="rounded-2xl border border-[var(--line)] bg-white/70 p-4">
            <h3 className="text-base font-semibold">{item.name}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">{item.discountPercent}% en {targetLabel(item.discountTarget)}</p>
            <p className="mt-2 text-xs text-[var(--muted)]">{buildPreviewLabel(item, item.discountPercent ?? 0, item.discountTarget ?? "simple")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => startEdit(item)}
                className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold transition hover:bg-[var(--surface-strong)]"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onRemoveOffer(item.id);
                  if (editingItemId === item.id) {
                    resetForm();
                  }
                }}
                className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
              >
                Quitar
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function targetLabel(target?: MenuDiscountTarget) {
  if (target === "double") {
    return "Doble";
  }

  if (target === "both") {
    return "Ambas";
  }

  return "Simple";
}

function applyPercent(price: number, percent: number) {
  return Math.max(0, Math.round(price * (1 - percent / 100)));
}

function buildPreviewLabel(item: MenuItemAdmin, discountPercent: number, discountTarget: MenuDiscountTarget) {
  const normalized = Math.max(1, Math.min(90, Math.round(discountPercent)));

  if (discountTarget === "both") {
    return `Simple ${formatCurrency(applyPercent(item.simplePrice, normalized))} · Doble ${formatCurrency(applyPercent(item.doublePrice, normalized))}`;
  }

  if (discountTarget === "double") {
    return `Simple ${formatCurrency(item.simplePrice)} · Doble ${formatCurrency(applyPercent(item.doublePrice, normalized))}`;
  }

  return `Simple ${formatCurrency(applyPercent(item.simplePrice, normalized))} · Doble ${formatCurrency(item.doublePrice)}`;
}
