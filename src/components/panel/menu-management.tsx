"use client";

import { useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { ImageUploadField } from "@/components/panel/image-upload-field";
import { formatCurrency } from "@/lib/pricing/order-pricing";
import type { MenuDiscountTarget, MenuItemAdmin } from "@/lib/types/panel";

export type MenuItemDraft = {
  name: string;
  description: string;
  image: string;
  simplePrice: number;
  doublePrice: number;
  badgeText?: string;
  discountTarget?: MenuDiscountTarget;
  discountPercent?: number;
};

type MenuManagementProps = {
  items: MenuItemAdmin[];
  onCreateItem: (draft: MenuItemDraft) => void;
  onUpdateItem: (itemId: string, draft: MenuItemDraft) => void;
  onDeleteItem: (itemId: string) => void;
  onToggleItemStatus: (itemId: string) => void;
};

const emptyDraft: MenuItemDraft = {
  name: "",
  description: "",
  image: "",
  simplePrice: 0,
  doublePrice: 0,
};

export function MenuManagement({ items, onCreateItem, onUpdateItem, onDeleteItem, onToggleItemStatus }: MenuManagementProps) {
  const [draft, setDraft] = useState<MenuItemDraft>(emptyDraft);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemAdmin | null>(null);
  const [editDraft, setEditDraft] = useState<MenuItemDraft>(emptyDraft);

  const activeCount = useMemo(() => items.filter((item) => item.status === "active").length, [items]);

  function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.name.trim() || !draft.description.trim() || !draft.image.trim()) {
      return;
    }

    const normalizedDraft: MenuItemDraft = {
      ...draft,
      name: draft.name.trim(),
      description: draft.description.trim(),
      image: draft.image.trim(),
      badgeText: draft.badgeText?.trim() || undefined,
      discountPercent: draft.discountPercent && draft.discountPercent > 0 ? draft.discountPercent : undefined,
      discountTarget: draft.discountPercent && draft.discountPercent > 0 ? draft.discountTarget : undefined,
    };

    onCreateItem(normalizedDraft);
    setDraft(emptyDraft);
    setIsCreateOpen(false);
  }

  function openEditModal(item: MenuItemAdmin) {
    setEditingItem(item);
    setEditDraft({
      name: item.name,
      description: item.description,
      image: item.image,
      simplePrice: item.simplePrice,
      doublePrice: item.doublePrice,
      badgeText: item.badgeText,
      discountTarget: item.discountTarget,
      discountPercent: item.discountPercent,
    });
  }

  function closeEditModal() {
    setEditingItem(null);
    setEditDraft(emptyDraft);
  }

  function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingItem) {
      return;
    }

    if (!editDraft.name.trim() || !editDraft.description.trim() || !editDraft.image.trim()) {
      return;
    }

    onUpdateItem(editingItem.id, {
      ...editDraft,
      name: editDraft.name.trim(),
      description: editDraft.description.trim(),
      image: editDraft.image.trim(),
      badgeText: editDraft.badgeText?.trim() || undefined,
      discountPercent: editDraft.discountPercent && editDraft.discountPercent > 0 ? editDraft.discountPercent : undefined,
      discountTarget: editDraft.discountPercent && editDraft.discountPercent > 0 ? editDraft.discountTarget : undefined,
    });

    closeEditModal();
  }

  return (
    <section className="space-y-4 rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:space-y-5 sm:p-5 md:rounded-[26px] md:p-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Gestion de menu</p>
          <h2 className="mt-2 text-[1.9rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-2xl">Productos, precios y estado</h2>
        </div>
        <p className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1.5 text-[13px] font-semibold sm:px-4 sm:py-2 sm:text-sm">
          {activeCount}/{items.length} activos
        </p>
      </header>

      <div className="rounded-2xl border border-[var(--line)] bg-white/60 p-2.5 sm:p-3">
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-left text-[13px] font-semibold transition hover:bg-[var(--surface-strong)] sm:text-sm"
        >
          Agregar producto
        </button>
      </div>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-black/45 p-3 sm:p-4" onClick={() => { setIsCreateOpen(false); setDraft(emptyDraft); }}>
          <div className="mx-auto my-6 w-full max-w-3xl rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:rounded-3xl sm:p-5 md:p-6" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">Agregar producto</h3>
              <button type="button" onClick={() => { setIsCreateOpen(false); setDraft(emptyDraft); }} className="rounded-full border border-[var(--line)] px-3 py-1 text-sm font-semibold">Cerrar</button>
            </div>
            <form className="mt-4 grid max-h-[calc(100vh-180px)] gap-3 overflow-y-auto pr-1 md:grid-cols-2" onSubmit={submitCreate}>
              <MenuFormFields draft={draft} onChange={setDraft} />
              <ImageUploadField
                label="Imagen"
                value={draft.image}
                onChange={(value) => setDraft((prev) => ({ ...prev, image: value }))}
                targetFolder="order"
              />
              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Previsualizacion</p>
                <div className="mt-2">
                  <ItemImagePreview src={draft.image} alt={`Preview ${draft.name || "menu"}`} />
                </div>
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-2">
                <button type="submit" className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]">Guardar producto</button>
                <button type="button" onClick={() => { setIsCreateOpen(false); setDraft(emptyDraft); }} className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface-strong)]">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-[var(--line)] bg-white/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <h3 className="text-base font-semibold">{item.name}</h3>
                <p className="text-sm leading-6 text-[var(--muted)]">{item.description}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                  item.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {item.status === "active" ? "Activo" : "Pausado"}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-[var(--surface-strong)] px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">Simple</p>
                <p className="mt-1 font-semibold text-[var(--foreground)]">{formatCurrency(item.simplePrice)}</p>
              </div>
              <div className="rounded-xl bg-[var(--surface-strong)] px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">Doble</p>
                <p className="mt-1 font-semibold text-[var(--foreground)]">{formatCurrency(item.doublePrice)}</p>
              </div>
            </div>

            <div className="mt-3 space-y-2 text-xs text-[var(--muted)]">
              <ItemImagePreview src={item.image} alt={item.name} />
              <p className="break-all">Imagen: {item.image}</p>
              <p>Etiqueta: {item.badgeText ?? "Sin etiqueta"}</p>
              <p>
                Descuento: {item.discountPercent && item.discountTarget ? `${item.discountPercent}% en ${item.discountTarget}` : "Sin descuento"}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openEditModal(item)}
                className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold transition hover:bg-[var(--surface-strong)]"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onToggleItemStatus(item.id)}
                className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold transition hover:bg-[var(--surface-strong)]"
              >
                {item.status === "active" ? "Pausar" : "Activar"}
              </button>
              <button
                type="button"
                onClick={() => onDeleteItem(item.id)}
                className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--line)] bg-white/70 md:block">
        <table className="min-w-[860px] w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] bg-[var(--surface-strong)]/70 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            <tr>
              <th className="px-3 py-3">Menu</th>
              <th className="px-3 py-3">Descripcion</th>
              <th className="px-3 py-3">Imagen</th>
              <th className="px-3 py-3">Simple</th>
              <th className="px-3 py-3">Doble</th>
              <th className="px-3 py-3">Etiqueta</th>
              <th className="px-3 py-3">Descuento</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-[var(--line)] last:border-b-0">
                <td className="px-3 py-3 font-semibold">{item.name}</td>
                <td className="px-3 py-3 text-[var(--muted)]">{item.description}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <ItemImagePreview src={item.image} alt={item.name} compact />
                    <span className="line-clamp-1 text-xs text-[var(--muted)]">{item.image}</span>
                  </div>
                </td>
                <td className="px-3 py-3">{formatCurrency(item.simplePrice)}</td>
                <td className="px-3 py-3">{formatCurrency(item.doublePrice)}</td>
                <td className="px-3 py-3 text-xs">{item.badgeText ?? "Sin etiqueta"}</td>
                <td className="px-3 py-3 text-xs">
                  {item.discountPercent && item.discountTarget ? `${item.discountPercent}% en ${item.discountTarget}` : "Sin descuento"}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                      item.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.status === "active" ? "Activo" : "Pausado"}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold transition hover:bg-[var(--surface-strong)]"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleItemStatus(item.id)}
                      className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold transition hover:bg-[var(--surface-strong)]"
                    >
                      {item.status === "active" ? "Pausar" : "Activar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingItem ? (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-black/45 p-3 sm:p-4" onClick={closeEditModal}>
          <div className="mx-auto my-6 w-full max-w-3xl rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:rounded-3xl sm:p-5 md:p-6" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">Editar producto</h3>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-full border border-[var(--line)] px-3 py-1 text-sm font-semibold"
              >
                Cerrar
              </button>
            </div>

            <form className="mt-4 grid max-h-[calc(100vh-180px)] gap-3 overflow-y-auto pr-1 md:grid-cols-2" onSubmit={submitEdit}>
              <MenuFormFields draft={editDraft} onChange={setEditDraft} />
              <ImageUploadField
                label="Imagen"
                value={editDraft.image}
                onChange={(value) => setEditDraft((prev) => ({ ...prev, image: value }))}
                targetFolder="order"
              />
              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Previsualizacion</p>
                <div className="mt-2">
                  <ItemImagePreview src={editDraft.image} alt={`Preview ${editDraft.name || "menu"}`} />
                </div>
              </div>

              <div className="md:col-span-2 flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
                >
                  Guardar cambios
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface-strong)]"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

type MenuFormFieldsProps = {
  draft: MenuItemDraft;
  onChange: Dispatch<SetStateAction<MenuItemDraft>>;
};

function MenuFormFields({ draft, onChange }: MenuFormFieldsProps) {
  return (
    <>
      <label className="space-y-1 text-sm font-medium md:col-span-2">
        Nombre
        <input
          value={draft.name}
          onChange={(event) => onChange((prev) => ({ ...prev, name: event.target.value }))}
          className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
          placeholder="Ej: Snotty"
          required
        />
      </label>

      <label className="space-y-1 text-sm font-medium md:col-span-2">
        Descripcion
        <textarea
          value={draft.description}
          onChange={(event) => onChange((prev) => ({ ...prev, description: event.target.value }))}
          className="min-h-20 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
          placeholder="Ingredientes y propuesta"
          required
        />
      </label>

      <PriceField
        label="Precio simple"
        value={draft.simplePrice}
        onChange={(value) => onChange((prev) => ({ ...prev, simplePrice: value }))}
      />
      <PriceField
        label="Precio doble"
        value={draft.doublePrice}
        onChange={(value) => onChange((prev) => ({ ...prev, doublePrice: value }))}
      />

      <label className="space-y-1 text-sm font-medium">
        Etiqueta
        <input
          value={draft.badgeText ?? ""}
          onChange={(event) => onChange((prev) => ({ ...prev, badgeText: event.target.value }))}
          className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
          placeholder="Ej: TOP, NUEVA, PICANTE"
        />
      </label>

      <label className="space-y-1 text-sm font-medium">
        Descuento en precio
        <select
          value={draft.discountTarget ?? "none"}
          onChange={(event) =>
            onChange((prev) => ({
              ...prev,
              discountTarget: event.target.value === "none" ? undefined : (event.target.value as MenuDiscountTarget),
            }))
          }
          className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
        >
          <option value="none">Sin descuento</option>
          <option value="simple">Simple</option>
          <option value="double">Doble</option>
        </select>
      </label>

      <label className="space-y-1 text-sm font-medium">
        Porcentaje descuento
        <input
          type="number"
          min={0}
          max={90}
          value={draft.discountPercent ?? ""}
          onChange={(event) => {
            const nextValue = Number(event.target.value);
            onChange((prev) => ({ ...prev, discountPercent: Number.isNaN(nextValue) ? undefined : nextValue }));
          }}
          className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
          placeholder="10"
        />
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
    <img
      src={src}
      alt={alt}
      className={`rounded-lg border border-[var(--line)] bg-white object-cover ${compact ? "h-10 w-10" : "h-24 w-full"}`}
    />
  );
}

type PriceFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

function PriceField({ label, value, onChange }: PriceFieldProps) {
  return (
    <label className="space-y-1 text-sm font-medium">
      {label}
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
      />
    </label>
  );
}
