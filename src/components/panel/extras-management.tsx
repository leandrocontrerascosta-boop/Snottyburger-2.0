"use client";

import { useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { formatCurrency } from "@/lib/pricing/order-pricing";
import type { ExtraItemAdmin, MenuModifierKind } from "@/lib/types/panel";

export type ExtraDraft = {
  label: string;
  priceDelta: number;
  kind: MenuModifierKind;
};

type ExtrasManagementProps = {
  extras: ExtraItemAdmin[];
  onCreateExtra: (draft: ExtraDraft) => void;
  onUpdateExtra: (extraId: string, draft: ExtraDraft) => void;
  onDeleteExtra: (extraId: string) => void;
  onToggleExtraStatus: (extraId: string) => void;
};

const emptyDraft: ExtraDraft = {
  label: "",
  priceDelta: 0,
  kind: "extra",
};

export function ExtrasManagement({
  extras,
  onCreateExtra,
  onUpdateExtra,
  onDeleteExtra,
  onToggleExtraStatus,
}: ExtrasManagementProps) {
  const [draft, setDraft] = useState<ExtraDraft>(emptyDraft);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingExtra, setEditingExtra] = useState<ExtraItemAdmin | null>(null);
  const [editDraft, setEditDraft] = useState<ExtraDraft>(emptyDraft);

  const activeCount = useMemo(() => extras.filter((item) => item.status === "active").length, [extras]);

  function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.label.trim()) {
      return;
    }

    onCreateExtra({
      ...draft,
      label: draft.label.trim(),
    });

    setDraft(emptyDraft);
    setIsCreateOpen(false);
  }

  function openEditModal(extra: ExtraItemAdmin) {
    setEditingExtra(extra);
    setEditDraft({
      label: extra.label,
      priceDelta: extra.priceDelta,
      kind: extra.kind,
    });
  }

  function closeEditModal() {
    setEditingExtra(null);
    setEditDraft(emptyDraft);
  }

  function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingExtra || !editDraft.label.trim()) {
      return;
    }

    onUpdateExtra(editingExtra.id, {
      ...editDraft,
      label: editDraft.label.trim(),
    });

    closeEditModal();
  }

  return (
    <section className="space-y-4 rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:space-y-5 sm:p-5 md:rounded-[26px] md:p-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Extras</p>
          <h2 className="mt-2 text-[1.9rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-2xl">Configura agregados y precios</h2>
        </div>
        <p className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1.5 text-[13px] font-semibold sm:px-4 sm:py-2 sm:text-sm">
          {activeCount}/{extras.length} activos
        </p>
      </header>

      <div className="rounded-2xl border border-[var(--line)] bg-white/60 p-2.5 sm:p-3">
        <button
          type="button"
          onClick={() => setIsCreateOpen((prev) => !prev)}
          className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-left text-[13px] font-semibold transition hover:bg-[var(--surface-strong)] sm:text-sm"
        >
          {isCreateOpen ? "Ocultar alta de extra" : "Agregar extra"}
        </button>

        {isCreateOpen ? (
          <form className="mt-3 grid gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 md:grid-cols-3" onSubmit={submitCreate}>
            <ExtraFormFields draft={draft} onChange={setDraft} />
            <div className="md:col-span-3">
              <button type="submit" className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]">
                Guardar extra
              </button>
            </div>
          </form>
        ) : null}
      </div>

      <div className="space-y-3 md:hidden">
        {extras.map((extra) => (
          <article key={extra.id} className="rounded-2xl border border-[var(--line)] bg-white/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <h3 className="text-base font-semibold">{extra.label}</h3>
                <p className="text-xs text-[var(--muted)]">Slug: {extra.slug}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${extra.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {extra.status === "active" ? "Activo" : "Pausado"}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-[var(--surface-strong)] px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">Precio</p>
                <p className="mt-1 font-semibold">{extra.priceDelta > 0 ? formatCurrency(extra.priceDelta) : "Incluido"}</p>
              </div>
              <div className="rounded-xl bg-[var(--surface-strong)] px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">Tipo</p>
                <p className="mt-1 font-semibold capitalize">{extra.kind}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => openEditModal(extra)} className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold transition hover:bg-[var(--surface-strong)]">Editar</button>
              <button type="button" onClick={() => onToggleExtraStatus(extra.id)} className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold transition hover:bg-[var(--surface-strong)]">{extra.status === "active" ? "Pausar" : "Activar"}</button>
              <button type="button" onClick={() => onDeleteExtra(extra.id)} className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50">Eliminar</button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--line)] bg-white/70 md:block">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] bg-[var(--surface-strong)]/70 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            <tr>
              <th className="px-3 py-3">Extra</th>
              <th className="px-3 py-3">Slug</th>
              <th className="px-3 py-3">Precio</th>
              <th className="px-3 py-3">Tipo</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {extras.map((extra) => (
              <tr key={extra.id} className="border-b border-[var(--line)] last:border-b-0">
                <td className="px-3 py-3 font-semibold">{extra.label}</td>
                <td className="px-3 py-3 text-xs text-[var(--muted)]">{extra.slug}</td>
                <td className="px-3 py-3">{extra.priceDelta > 0 ? formatCurrency(extra.priceDelta) : "Incluido"}</td>
                <td className="px-3 py-3 capitalize">{extra.kind}</td>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${extra.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {extra.status === "active" ? "Activo" : "Pausado"}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => openEditModal(extra)} className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold transition hover:bg-[var(--surface-strong)]">Editar</button>
                    <button type="button" onClick={() => onToggleExtraStatus(extra.id)} className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold transition hover:bg-[var(--surface-strong)]">{extra.status === "active" ? "Pausar" : "Activar"}</button>
                    <button type="button" onClick={() => onDeleteExtra(extra.id)} className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingExtra ? (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-black/45 p-3 sm:p-4" onClick={closeEditModal}>
          <div className="mx-auto my-6 w-full max-w-2xl rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:rounded-3xl sm:p-5 md:p-6" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">Editar extra</h3>
              <button type="button" onClick={closeEditModal} className="rounded-full border border-[var(--line)] px-3 py-1 text-sm font-semibold">Cerrar</button>
            </div>

            <form className="mt-4 grid max-h-[calc(100vh-180px)] gap-3 overflow-y-auto pr-1 md:grid-cols-3" onSubmit={submitEdit}>
              <ExtraFormFields draft={editDraft} onChange={setEditDraft} />
              <div className="md:col-span-3 flex flex-wrap gap-2">
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

type ExtraFormFieldsProps = {
  draft: ExtraDraft;
  onChange: Dispatch<SetStateAction<ExtraDraft>>;
};

function ExtraFormFields({ draft, onChange }: ExtraFormFieldsProps) {
  return (
    <>
      <label className="space-y-1 text-sm font-medium md:col-span-2">
        Nombre del extra
        <input
          value={draft.label}
          onChange={(event) => onChange((prev) => ({ ...prev, label: event.target.value }))}
          className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
          placeholder="Ej: Queso cheddar"
          required
        />
      </label>

      <label className="space-y-1 text-sm font-medium">
        Precio
        <input
          type="number"
          min={0}
          step={100}
          value={draft.priceDelta}
          onChange={(event) => onChange((prev) => ({ ...prev, priceDelta: Number(event.target.value) || 0 }))}
          className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
        />
      </label>

      <label className="space-y-1 text-sm font-medium md:col-span-3">
        Tipo
        <select
          value={draft.kind}
          onChange={(event) => onChange((prev) => ({ ...prev, kind: event.target.value as MenuModifierKind }))}
          className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
        >
          <option value="extra">extra</option>
          <option value="addon">addon</option>
          <option value="remove">remove</option>
        </select>
      </label>
    </>
  );
}
