"use client";

import { useState } from "react";

type TransferAliasManagementProps = {
  alias: string;
  updatedAt: string;
  onSaveAlias: (nextAlias: string) => void;
};

export function TransferAliasManagement({ alias, updatedAt, onSaveAlias }: TransferAliasManagementProps) {
  const [value, setValue] = useState(alias);

  return (
    <section className="space-y-5 rounded-[26px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] md:p-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Alias de transferencia</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Configurar alias bancario</h2>
        </div>
        <p className="text-xs text-[var(--muted)]">
          Ultima actualizacion: {new Date(updatedAt).toLocaleString("es-AR")}
        </p>
      </header>

      <div className="grid gap-3 rounded-2xl border border-[var(--line)] bg-white/60 p-4">
        <label className="space-y-1 text-sm font-medium">
          Alias
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Ej: Emicarrizo73"
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
          />
          <p className="text-xs text-[var(--muted)]">
            Este alias se mostrara a los clientes cuando elijan transferencia como medio de pago.
          </p>
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSaveAlias(value.trim() || alias)}
            className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
          >
            Guardar alias
          </button>
          <button
            type="button"
            onClick={() => setValue(alias)}
            className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface-strong)]"
          >
            Restaurar
          </button>
        </div>
      </div>
    </section>
  );
}
