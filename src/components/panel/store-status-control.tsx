import type { ManualStoreOverride, StoreAvailabilityState } from "@/lib/store/store-availability";

type StoreStatusControlProps = {
  state: StoreAvailabilityState;
  onSetOverride: (override: ManualStoreOverride) => void;
};

export function StoreStatusControl({ state, onSetOverride }: StoreStatusControlProps) {
  const statusLabel = state.isOpen ? "Abierto" : "Cerrado";
  const statusClass = state.isOpen
    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
    : "border-rose-300 bg-rose-50 text-rose-700";

  const modeLabel =
    state.manualOverride === "force-open"
      ? "Manual: abierto"
      : state.manualOverride === "force-closed"
        ? "Manual: cerrado"
        : "Automatico por horario";

  return (
    <section className="rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Estado del local</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Horario base: lunes a lunes de 20:00 a 01:00.</p>
        </div>
        <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${statusClass}`}>
          {statusLabel}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSetOverride("force-open")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            state.manualOverride === "force-open"
              ? "bg-emerald-600 text-white"
              : "border border-[var(--line)] bg-white text-[var(--foreground)] hover:border-emerald-400"
          }`}
        >
          Abrir manualmente
        </button>
        <button
          type="button"
          onClick={() => onSetOverride("force-closed")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            state.manualOverride === "force-closed"
              ? "bg-rose-600 text-white"
              : "border border-[var(--line)] bg-white text-[var(--foreground)] hover:border-rose-400"
          }`}
        >
          Cerrar manualmente
        </button>
        <button
          type="button"
          onClick={() => onSetOverride("none")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            state.manualOverride === "none"
              ? "bg-[var(--brand)] text-white"
              : "border border-[var(--line)] bg-white text-[var(--foreground)] hover:border-[var(--brand)]"
          }`}
        >
          Volver a automatico
        </button>
      </div>

      <p className="mt-3 text-xs text-[var(--muted)]">
        Modo actual: {modeLabel}. El override manual se reinicia automaticamente despues de las 06:00 para evitar que quede abierto por error.
      </p>
    </section>
  );
}