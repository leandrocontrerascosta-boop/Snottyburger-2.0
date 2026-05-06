"use client";

import { useEffect, useState } from "react";
import type { ManualStoreOverride, StoreAvailabilityState } from "@/lib/store/store-availability";
import type { StoreAvailabilitySettings } from "@/lib/store/store-availability";
import { formatStoreScheduleLabel } from "@/lib/store/store-availability";

type StoreStatusControlProps = {
  settings: StoreAvailabilitySettings;
  state: StoreAvailabilityState;
  onSetOverride: (override: ManualStoreOverride) => void;
  onSaveSchedule: (schedule: Pick<StoreAvailabilitySettings, "openTime" | "closeTime">) => Promise<void>;
};

export function StoreStatusControl({ settings, state, onSetOverride, onSaveSchedule }: StoreStatusControlProps) {
  const [openTime, setOpenTime] = useState(settings.openTime);
  const [closeTime, setCloseTime] = useState(settings.closeTime);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setOpenTime(settings.openTime);
    setCloseTime(settings.closeTime);
  }, [settings.closeTime, settings.openTime]);

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

  const isDirty = openTime !== settings.openTime || closeTime !== settings.closeTime;

  return (
    <section className="rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Estado del local</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Horario base: {formatStoreScheduleLabel(settings)}.</p>
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

      <div className="mt-4 rounded-2xl border border-[var(--line)] bg-white/70 p-3 sm:p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-[140px] flex-1 space-y-1 text-sm font-medium">
            Abre
            <input
              type="time"
              step={1800}
              value={openTime}
              onChange={(event) => setOpenTime(event.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
            />
          </label>
          <label className="min-w-[140px] flex-1 space-y-1 text-sm font-medium">
            Cierra
            <input
              type="time"
              step={1800}
              value={closeTime}
              onChange={(event) => setCloseTime(event.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
            />
          </label>
          <button
            type="button"
            disabled={!isDirty || isSaving}
            onClick={async () => {
              setIsSaving(true);
              setSaveMessage(null);

              try {
                await onSaveSchedule({ openTime, closeTime });
                setSaveMessage("Horario guardado.");
              } catch {
                setSaveMessage("No se pudo guardar el horario.");
              } finally {
                setIsSaving(false);
              }
            }}
            className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:bg-[#c9c1c2]"
          >
            {isSaving ? "Guardando..." : "Guardar horario"}
          </button>
        </div>

        <p className="mt-3 text-xs text-[var(--muted)]">El horario guardado impacta en `/orden` y en el estado automatico del local.</p>
        {saveMessage ? <p className="mt-2 text-xs font-medium text-[var(--brand)]">{saveMessage}</p> : null}
      </div>

      <p className="mt-3 text-xs text-[var(--muted)]">
        Modo actual: {modeLabel}. El override manual se reinicia automaticamente despues de las 06:00 para evitar que quede abierto por error.
      </p>
    </section>
  );
}