"use client";

import Image from "next/image";
import { useMemo, useState, type FormEvent } from "react";
import { ImageUploadField } from "@/components/panel/image-upload-field";
import { formatCurrency } from "@/lib/pricing/order-pricing";
import type { DrinkItemAdmin } from "@/lib/types/panel";

export type DrinkDraft = {
  name: string;
  description: string;
  image: string;
  price: number;
};

type DrinkManagementProps = {
  drinks: DrinkItemAdmin[];
  onCreateDrink: (draft: DrinkDraft) => void;
  onUpdateDrink: (drinkId: string, draft: DrinkDraft) => void;
  onDeleteDrink: (drinkId: string) => void;
  onToggleDrinkStatus: (drinkId: string) => void;
};

const emptyDraft: DrinkDraft = {
  name: "",
  description: "",
  image: "",
  price: 0,
};

export function DrinkManagement({ drinks, onCreateDrink, onUpdateDrink, onDeleteDrink, onToggleDrinkStatus }: DrinkManagementProps) {
  const [draft, setDraft] = useState<DrinkDraft>(emptyDraft);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDrink, setEditingDrink] = useState<DrinkItemAdmin | null>(null);
  const [editDraft, setEditDraft] = useState<DrinkDraft>(emptyDraft);

  const activeCount = useMemo(() => drinks.filter((item) => item.status === "active").length, [drinks]);

  function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.name.trim() || !draft.description.trim() || !draft.image.trim()) {
      return;
    }

    onCreateDrink({
      ...draft,
      name: draft.name.trim(),
      description: draft.description.trim(),
      image: draft.image.trim(),
    });
    setDraft(emptyDraft);
    setIsCreateOpen(false);
  }

  function openEditModal(drink: DrinkItemAdmin) {
    setEditingDrink(drink);
    setEditDraft({
      name: drink.name,
      description: drink.description,
      image: drink.image,
      price: drink.price,
    });
  }

  function closeEditModal() {
    setEditingDrink(null);
    setEditDraft(emptyDraft);
  }

  function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingDrink || !editDraft.name.trim() || !editDraft.description.trim() || !editDraft.image.trim()) {
      return;
    }

    onUpdateDrink(editingDrink.id, {
      ...editDraft,
      name: editDraft.name.trim(),
      description: editDraft.description.trim(),
      image: editDraft.image.trim(),
    });

    closeEditModal();
  }

  return (
    <section className="space-y-4 rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:space-y-5 sm:p-5 md:rounded-[26px] md:p-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Bebidas</p>
          <h2 className="mt-2 text-[1.9rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-2xl">Altas, precios y estado</h2>
        </div>
        <p className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1.5 text-[13px] font-semibold sm:px-4 sm:py-2 sm:text-sm">
          {activeCount}/{drinks.length} activas
        </p>
      </header>

      <div className="rounded-2xl border border-[var(--line)] bg-white/60 p-2.5 sm:p-3">
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-left text-[13px] font-semibold transition hover:bg-[var(--surface-strong)] sm:text-sm"
        >
          Agregar bebida
        </button>
      </div>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-black/45 p-3 sm:p-4" onClick={() => { setIsCreateOpen(false); setDraft(emptyDraft); }}>
          <div className="mx-auto my-6 w-full max-w-3xl rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:rounded-3xl sm:p-5 md:p-6" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">Agregar bebida</h3>
              <button type="button" onClick={() => { setIsCreateOpen(false); setDraft(emptyDraft); }} className="rounded-full border border-[var(--line)] px-3 py-1 text-sm font-semibold">Cerrar</button>
            </div>
            <form className="mt-4 grid max-h-[calc(100vh-180px)] gap-3 overflow-y-auto pr-1 md:grid-cols-2" onSubmit={submitCreate}>
              <DrinkFormFields draft={draft} onChange={setDraft} />
              <ImageUploadField
                label="Imagen"
                value={draft.image}
                onChange={(value) => setDraft((prev) => ({ ...prev, image: value }))}
                targetFolder="order"
              />
              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Previsualizacion</p>
                <div className="mt-2">
                  <ItemImagePreview src={draft.image} alt={`Preview ${draft.name || "bebida"}`} />
                </div>
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-2">
                <button type="submit" className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]">Guardar bebida</button>
                <button type="button" onClick={() => { setIsCreateOpen(false); setDraft(emptyDraft); }} className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface-strong)]">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="space-y-3 md:hidden">
        {drinks.map((drink) => (
          <article key={drink.id} className="rounded-2xl border border-[var(--line)] bg-white/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <h3 className="text-base font-semibold">{drink.name}</h3>
                <p className="text-sm leading-6 text-[var(--muted)]">{drink.description}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${drink.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {drink.status === "active" ? "Activa" : "Pausada"}
              </span>
            </div>

            <div className="mt-3 rounded-xl bg-[var(--surface-strong)] px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">Precio</p>
              <p className="mt-1 font-semibold text-[var(--foreground)]">{formatCurrency(drink.price)}</p>
            </div>

            <div className="mt-3 space-y-2 text-xs text-[var(--muted)]">
              <ItemImagePreview src={drink.image} alt={drink.name} />
              <p className="break-all">Imagen: {drink.image}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => openEditModal(drink)} className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold transition hover:bg-[var(--surface-strong)]">Editar</button>
              <button type="button" onClick={() => onToggleDrinkStatus(drink.id)} className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold transition hover:bg-[var(--surface-strong)]">{drink.status === "active" ? "Pausar" : "Activar"}</button>
              <button type="button" onClick={() => onDeleteDrink(drink.id)} className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50">Eliminar</button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--line)] bg-white/70 md:block">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] bg-[var(--surface-strong)]/70 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            <tr>
              <th className="px-3 py-3">Bebida</th>
              <th className="px-3 py-3">Descripcion</th>
              <th className="px-3 py-3">Imagen</th>
              <th className="px-3 py-3">Precio</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {drinks.map((drink) => (
              <tr key={drink.id} className="border-b border-[var(--line)] last:border-b-0">
                <td className="px-3 py-3 font-semibold">{drink.name}</td>
                <td className="px-3 py-3 text-[var(--muted)]">{drink.description}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <ItemImagePreview src={drink.image} alt={drink.name} compact />
                    <span className="line-clamp-1 text-xs text-[var(--muted)]">{drink.image}</span>
                  </div>
                </td>
                <td className="px-3 py-3">{formatCurrency(drink.price)}</td>
                <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${drink.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{drink.status === "active" ? "Activa" : "Pausada"}</span></td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => openEditModal(drink)} className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold transition hover:bg-[var(--surface-strong)]">Editar</button>
                    <button type="button" onClick={() => onToggleDrinkStatus(drink.id)} className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold transition hover:bg-[var(--surface-strong)]">{drink.status === "active" ? "Pausar" : "Activar"}</button>
                    <button type="button" onClick={() => onDeleteDrink(drink.id)} className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingDrink ? (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-black/45 p-3 sm:p-4" onClick={closeEditModal}>
          <div className="mx-auto my-6 w-full max-w-3xl rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:rounded-3xl sm:p-5 md:p-6" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">Editar bebida</h3>
              <button type="button" onClick={closeEditModal} className="rounded-full border border-[var(--line)] px-3 py-1 text-sm font-semibold">Cerrar</button>
            </div>

            <form className="mt-4 grid max-h-[calc(100vh-180px)] gap-3 overflow-y-auto pr-1 md:grid-cols-2" onSubmit={submitEdit}>
              <DrinkFormFields draft={editDraft} onChange={setEditDraft} />
              <ImageUploadField
                label="Imagen"
                value={editDraft.image}
                onChange={(value) => setEditDraft((prev) => ({ ...prev, image: value }))}
                targetFolder="order"
              />
              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Previsualizacion</p>
                <div className="mt-2">
                  <ItemImagePreview src={editDraft.image} alt={`Preview ${editDraft.name || "bebida"}`} />
                </div>
              </div>

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

type DrinkFormFieldsProps = {
  draft: DrinkDraft;
  onChange: React.Dispatch<React.SetStateAction<DrinkDraft>>;
};

function DrinkFormFields({ draft, onChange }: DrinkFormFieldsProps) {
  return (
    <>
      <label className="space-y-1 text-sm font-medium md:col-span-2">
        Nombre
        <input value={draft.name} onChange={(event) => onChange((prev) => ({ ...prev, name: event.target.value }))} className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2" placeholder="Ej: Pepsi lata" required />
      </label>

      <label className="space-y-1 text-sm font-medium md:col-span-2">
        Descripcion
        <textarea value={draft.description} onChange={(event) => onChange((prev) => ({ ...prev, description: event.target.value }))} className="min-h-20 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2" placeholder="Detalle comercial" required />
      </label>

      <label className="space-y-1 text-sm font-medium">
        Precio
        <input type="number" min={0} value={draft.price} onChange={(event) => onChange((prev) => ({ ...prev, price: Number(event.target.value) || 0 }))} className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2" />
      </label>
    </>
  );
}

function ItemImagePreview({ src, alt, compact = false }: { src: string; alt: string; compact?: boolean }) {
  if (!src.trim()) {
    return (
      <div className={`grid place-items-center rounded-lg border border-dashed border-[var(--line)] bg-white text-xs text-[var(--muted)] ${compact ? "h-10 w-10" : "h-24 w-full"}`}>
        Sin imagen
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg border border-[var(--line)] bg-white ${compact ? "h-10 w-10" : "h-24 w-full"}`}>
      <Image src={src} alt={alt} fill sizes={compact ? "40px" : "320px"} className="object-cover" />
    </div>
  );
}