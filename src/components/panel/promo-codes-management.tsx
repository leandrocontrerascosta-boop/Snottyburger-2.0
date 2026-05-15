"use client";

import { useMemo, useState, type FormEvent } from "react";

type PromoCodDraft = {
  code: string;
  description: string;
  discountPercent: number;
  applyTo: "burgers" | "total";
  maxUses: number | null;
};

type PromoCod = PromoCodDraft & {
  id: string;
  isActive: boolean;
  currentUses: number;
  createdAt: string;
};

type PromoCodesManagementProps = {
  codes: PromoCod[];
  onSaveCode: (draft: PromoCodDraft) => Promise<void>;
  onToggleCode: (codeId: string, isActive: boolean) => Promise<void>;
  onDeleteCode: (codeId: string) => Promise<void>;
};

export function PromoCodesManagement({
  codes,
  onSaveCode,
  onToggleCode,
  onDeleteCode,
}: PromoCodesManagementProps) {
  const [draft, setDraft] = useState<PromoCodDraft>({
    code: "",
    description: "",
    discountPercent: 10,
    applyTo: "burgers",
    maxUses: null,
  });
  const [isSaving, setIsSaving] = useState(false);

  const activeCodes = useMemo(() => codes.filter((c) => c.isActive), [codes]);

  function resetForm() {
    setDraft({
      code: "",
      description: "",
      discountPercent: 10,
      applyTo: "burgers",
      maxUses: null,
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.code.trim() || !draft.discountPercent || draft.discountPercent <= 0) {
      return;
    }

    setIsSaving(true);
    try {
      await onSaveCode({
        ...draft,
        code: draft.code.toUpperCase().trim(),
        discountPercent: Math.max(1, Math.min(100, Math.round(draft.discountPercent))),
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
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Promociones</p>
          <h2 className="mt-2 text-[1.9rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-2xl">
            Códigos de descuento
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Crea y gestiona códigos para aplicar descuentos en checkout.
          </p>
        </div>
        <p className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1.5 text-[13px] font-semibold sm:px-4 sm:py-2 sm:text-sm">
          {activeCodes.length} activos
        </p>
      </header>

      <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-[var(--line)] bg-white/70 p-3 md:grid-cols-4 md:p-4">
        <label className="space-y-1 text-sm font-medium">
          Código
          <input
            type="text"
            value={draft.code}
            onChange={(event) => setDraft((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))}
            placeholder="EJ: PROMO2024"
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
            required
          />
        </label>

        <label className="space-y-1 text-sm font-medium md:col-span-2">
          Descripción
          <input
            type="text"
            value={draft.description}
            onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Ej: Descuento de verano"
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
          />
        </label>

        <label className="space-y-1 text-sm font-medium">
          % Descuento
          <input
            type="number"
            min={1}
            max={100}
            value={draft.discountPercent}
            onChange={(event) => setDraft((prev) => ({ ...prev, discountPercent: Number(event.target.value) || 0 }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
            required
          />
        </label>

        <label className="space-y-1 text-sm font-medium">
          Aplicar a
          <select
            value={draft.applyTo}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, applyTo: event.target.value as "burgers" | "total" }))
            }
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
          >
            <option value="burgers">Solo hamburguesas</option>
            <option value="total">Total de compra</option>
          </select>
        </label>

        <label className="space-y-1 text-sm font-medium md:col-span-2">
          Usos máximos
          <input
            type="number"
            min={1}
            value={draft.maxUses ?? ""}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                maxUses: event.target.value ? Number(event.target.value) : null,
              }))
            }
            placeholder="Ilimitados si está vacío"
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
          />
        </label>

        <div className="md:col-span-4 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:bg-[#c9c1c2]"
          >
            {isSaving ? "Guardando..." : "Crear código"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface-strong)]"
          >
            Limpiar
          </button>
        </div>
      </form>

      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--line)] bg-white/70 md:block">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] bg-[var(--surface-strong)]/70 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            <tr>
              <th className="px-3 py-3">Código</th>
              <th className="px-3 py-3">Descripción</th>
              <th className="px-3 py-3">Descuento</th>
              <th className="px-3 py-3">Aplica a</th>
              <th className="px-3 py-3">Usos</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((code) => (
              <tr key={code.id} className="border-b border-[var(--line)] last:border-b-0">
                <td className="px-3 py-3 font-semibold font-mono">{code.code}</td>
                <td className="px-3 py-3 text-xs">{code.description || "-"}</td>
                <td className="px-3 py-3">{code.discountPercent}%</td>
                <td className="px-3 py-3 text-xs">{code.applyTo === "burgers" ? "Hamburguesas" : "Total"}</td>
                <td className="px-3 py-3 text-xs">
                  {code.currentUses} {code.maxUses ? `/ ${code.maxUses}` : "/ ∞"}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                      code.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {code.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleCode(code.id, !code.isActive)}
                      className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold transition hover:bg-[var(--surface-strong)]"
                    >
                      {code.isActive ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCode(code.id)}
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

      <div className="space-y-3 md:hidden">
        {codes.map((code) => (
          <article key={code.id} className="rounded-2xl border border-[var(--line)] bg-white/70 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-mono text-base font-semibold">{code.code}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{code.description || "-"}</p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  code.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                }`}
              >
                {code.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">
              {code.discountPercent}% • {code.applyTo === "burgers" ? "Hamburguesas" : "Total"} • {code.currentUses}{" "}
              {code.maxUses ? `/ ${code.maxUses}` : "/ ∞"} usos
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onToggleCode(code.id, !code.isActive)}
                className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold transition hover:bg-[var(--surface-strong)]"
              >
                {code.isActive ? "Desactivar" : "Activar"}
              </button>
              <button
                type="button"
                onClick={() => onDeleteCode(code.id)}
                className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
