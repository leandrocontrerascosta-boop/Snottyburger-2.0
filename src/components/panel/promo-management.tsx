"use client";

import { useState, type FormEvent } from "react";
import { ImageUploadField } from "@/components/panel/image-upload-field";
import { formatCurrency } from "@/lib/pricing/order-pricing";
import type { PromoAdmin, PromoCustomizationPolicy } from "@/lib/types/panel";

export type PromoDraft = {
  title: string;
  description: string;
  image: string;
  simplePrice: number;
  doublePrice: number;
  isCombo: boolean;
  durationDays: number;
  customizationPolicy: PromoCustomizationPolicy;
  badgeText?: string;
  linkedProductSlug?: string;
};

type PromoManagementProps = {
  promos: PromoAdmin[];
  onCreatePromo: (draft: PromoDraft) => void;
  onUpdatePromo: (promoId: string, draft: PromoDraft) => void;
  onTogglePromoStatus: (promoId: string) => void;
  onDeletePromo: (promoId: string) => void;
};

const emptyPromo: PromoDraft = {
  title: "",
  description: "",
  image: "",
  simplePrice: 0,
  doublePrice: 0,
  isCombo: false,
  durationDays: 7,
  customizationPolicy: "extras",
  badgeText: "",
  linkedProductSlug: "",
};

export function PromoManagement({
  promos,
  onCreatePromo,
  onUpdatePromo,
  onTogglePromoStatus,
  onDeletePromo,
}: PromoManagementProps) {
  const [draft, setDraft] = useState<PromoDraft>(emptyPromo);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoAdmin | null>(null);
  const [editDraft, setEditDraft] = useState<PromoDraft>(emptyPromo);

  function submitPromo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.title.trim() || !draft.description.trim() || !draft.image.trim()) {
      return;
    }

    onCreatePromo({
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      image: draft.image.trim(),
      badgeText: draft.badgeText?.trim() || undefined,
      linkedProductSlug: draft.linkedProductSlug?.trim() || undefined,
      customizationPolicy: draft.isCombo ? "observation-only" : draft.customizationPolicy,
    });

    setDraft(emptyPromo);
    setIsCreateOpen(false);
  }

  function openEditModal(promo: PromoAdmin) {
    setEditingPromo(promo);
    setEditDraft({
      title: promo.title,
      description: promo.description,
      image: promo.image,
      simplePrice: promo.simplePrice,
      doublePrice: promo.doublePrice,
      isCombo: promo.isCombo,
      durationDays: promo.durationDays,
      customizationPolicy: promo.customizationPolicy,
      badgeText: promo.badgeText ?? "",
      linkedProductSlug: promo.linkedProductSlug ?? "",
    });
  }

  function closeEditModal() {
    setEditingPromo(null);
    setEditDraft(emptyPromo);
  }

  function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingPromo || !editDraft.title.trim() || !editDraft.description.trim() || !editDraft.image.trim()) {
      return;
    }

    onUpdatePromo(editingPromo.id, {
      ...editDraft,
      title: editDraft.title.trim(),
      description: editDraft.description.trim(),
      image: editDraft.image.trim(),
      badgeText: editDraft.badgeText?.trim() || undefined,
      linkedProductSlug: editDraft.linkedProductSlug?.trim() || undefined,
      customizationPolicy: editDraft.isCombo ? "observation-only" : editDraft.customizationPolicy,
    });

    closeEditModal();
  }

  return (
    <section className="space-y-4 rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:space-y-5 sm:p-5 md:rounded-[26px] md:p-7">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Promos</p>
        <h2 className="mt-2 text-[1.9rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-2xl">Crear, activar, pausar o eliminar</h2>
      </header>

      <div className="rounded-2xl border border-[var(--line)] bg-white/60 p-3">
        <button
          type="button"
          onClick={() => setIsCreateOpen((prev) => !prev)}
          className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-left text-sm font-semibold transition hover:bg-[var(--surface-strong)]"
        >
          {isCreateOpen ? "Ocultar alta de promo" : "Agregar promo"}
        </button>

        {isCreateOpen ? (
          <form onSubmit={submitPromo} className="mt-3 grid gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 md:grid-cols-2">
            <label className="space-y-1 text-sm font-medium md:col-span-2">
              Nombre promo
              <input
                value={draft.title}
                onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
                placeholder="Ej: Combo del finde"
                required
              />
            </label>

            <label className="space-y-1 text-sm font-medium md:col-span-2">
              Descripcion
              <textarea
                value={draft.description}
                onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
                className="min-h-20 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
                placeholder="Detalle comercial de la promo"
                required
              />
            </label>

            <ImageUploadField
              label="Imagen promo"
              value={draft.image}
              onChange={(value) => setDraft((prev) => ({ ...prev, image: value }))}
              targetFolder="promos"
            />

            <label className="space-y-1 text-sm font-medium">
              Precio simple
              <input
                type="number"
                min={0}
                value={draft.simplePrice}
                onChange={(event) => setDraft((prev) => ({ ...prev, simplePrice: Number(event.target.value) || 0 }))}
                className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
              />
            </label>

            <label className="space-y-1 text-sm font-medium">
              Precio doble
              <input
                type="number"
                min={0}
                value={draft.doublePrice}
                onChange={(event) => setDraft((prev) => ({ ...prev, doublePrice: Number(event.target.value) || 0 }))}
                className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
              />
            </label>

            <label className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={draft.isCombo}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    isCombo: event.target.checked,
                    customizationPolicy: event.target.checked ? "observation-only" : prev.customizationPolicy,
                  }))
                }
              />
              Es combo
            </label>

            <label className="space-y-1 text-sm font-medium">
              Duracion (dias)
              <input
                type="number"
                min={1}
                max={90}
                value={draft.durationDays}
                onChange={(event) => setDraft((prev) => ({ ...prev, durationDays: Number(event.target.value) || 1 }))}
                className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
              />
            </label>

            <label className="space-y-1 text-sm font-medium md:col-span-2">
              Politica de personalizacion
              <select
                value={draft.isCombo ? "observation-only" : draft.customizationPolicy}
                disabled={draft.isCombo}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, customizationPolicy: event.target.value as PromoCustomizationPolicy }))
                }
                className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-zinc-100"
              >
                <option value="extras">Permitir extras</option>
                <option value="observation-only">Solo observacion para quitar algo</option>
              </select>
              {draft.isCombo ? (
                <p className="text-xs text-[var(--muted)]">
                  En combos se fuerza &quot;Solo observacion para quitar algo&quot; para evitar extras.
                </p>
              ) : null}
            </label>

            <label className="space-y-1 text-sm font-medium">
              Badge promo
              <input
                value={draft.badgeText ?? ""}
                onChange={(event) => setDraft((prev) => ({ ...prev, badgeText: event.target.value }))}
                className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
                placeholder="Ej: Combo o -20%"
              />
            </label>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
              >
                Guardar promo
              </button>
            </div>
          </form>
        ) : null}
      </div>

      <div className="space-y-3">
        {promos.map((promo) => (
          <article key={promo.id} className="rounded-2xl border border-[var(--line)] bg-white/70 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{promo.title}</h3>
                <p className="text-sm text-[var(--muted)]">{promo.description}</p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Imagen: {promo.image} · Precio simple: {formatCurrency(promo.simplePrice)} · Precio doble: {formatCurrency(promo.doublePrice)}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {promo.isCombo ? "Combo" : "Promo simple"} · Duracion: {promo.durationDays} dias · {" "}
                  {promo.customizationPolicy === "observation-only"
                    ? "Solo observacion para quitar algo"
                    : "Con extras"}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] ${
                  promo.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {promo.status === "active" ? "Activa" : "Pausada"}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openEditModal(promo)}
                className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold transition hover:bg-[var(--surface-strong)]"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onTogglePromoStatus(promo.id)}
                className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold transition hover:bg-[var(--surface-strong)]"
              >
                {promo.status === "active" ? "Pausar" : "Activar"}
              </button>
              <button
                type="button"
                onClick={() => onDeletePromo(promo.id)}
                className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50"
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>

      {editingPromo ? (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-black/45 p-3 sm:p-4" onClick={closeEditModal}>
          <div className="mx-auto my-6 w-full max-w-3xl rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:rounded-3xl sm:p-5 md:p-6" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">Editar promo</h3>
              <button type="button" onClick={closeEditModal} className="rounded-full border border-[var(--line)] px-3 py-1 text-sm font-semibold">Cerrar</button>
            </div>

            <form onSubmit={submitEdit} className="mt-3 grid max-h-[calc(100vh-180px)] gap-3 overflow-y-auto rounded-2xl border border-[var(--line)] bg-white p-4 pr-1 md:grid-cols-2">
              <label className="space-y-1 text-sm font-medium md:col-span-2">
                Nombre promo
                <input value={editDraft.title} onChange={(event) => setEditDraft((prev) => ({ ...prev, title: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2" required />
              </label>

              <label className="space-y-1 text-sm font-medium md:col-span-2">
                Descripcion
                <textarea value={editDraft.description} onChange={(event) => setEditDraft((prev) => ({ ...prev, description: event.target.value }))} className="min-h-20 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2" required />
              </label>

              <ImageUploadField label="Imagen promo" value={editDraft.image} onChange={(value) => setEditDraft((prev) => ({ ...prev, image: value }))} targetFolder="promos" />

              <label className="space-y-1 text-sm font-medium">
                Precio simple
                <input type="number" min={0} value={editDraft.simplePrice} onChange={(event) => setEditDraft((prev) => ({ ...prev, simplePrice: Number(event.target.value) || 0 }))} className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2" />
              </label>

              <label className="space-y-1 text-sm font-medium">
                Precio doble
                <input type="number" min={0} value={editDraft.doublePrice} onChange={(event) => setEditDraft((prev) => ({ ...prev, doublePrice: Number(event.target.value) || 0 }))} className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2" />
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium">
                <input type="checkbox" checked={editDraft.isCombo} onChange={(event) => setEditDraft((prev) => ({ ...prev, isCombo: event.target.checked, customizationPolicy: event.target.checked ? "observation-only" : prev.customizationPolicy }))} />
                Es combo
              </label>

              <label className="space-y-1 text-sm font-medium">
                Duracion (dias)
                <input type="number" min={1} max={90} value={editDraft.durationDays} onChange={(event) => setEditDraft((prev) => ({ ...prev, durationDays: Number(event.target.value) || 1 }))} className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2" />
              </label>

              <label className="space-y-1 text-sm font-medium md:col-span-2">
                Politica de personalizacion
                <select value={editDraft.isCombo ? "observation-only" : editDraft.customizationPolicy} disabled={editDraft.isCombo} onChange={(event) => setEditDraft((prev) => ({ ...prev, customizationPolicy: event.target.value as PromoCustomizationPolicy }))} className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-zinc-100">
                  <option value="extras">Permitir extras</option>
                  <option value="observation-only">Solo observacion para quitar algo</option>
                </select>
              </label>

              <label className="space-y-1 text-sm font-medium">
                Badge promo
                <input value={editDraft.badgeText ?? ""} onChange={(event) => setEditDraft((prev) => ({ ...prev, badgeText: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2" />
              </label>

              <div className="md:col-span-2 flex flex-wrap gap-2">
                <button type="submit" className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]">Guardar cambios</button>
                <button type="button" onClick={closeEditModal} className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface-strong)]">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
