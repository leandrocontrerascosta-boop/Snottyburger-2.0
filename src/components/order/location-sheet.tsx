"use client";

import { useEffect, useMemo, useState } from "react";
import type { Location } from "@/lib/types/order";

type LocationSheetProps = {
  open: boolean;
  locations: Location[];
  activeLocationId: string;
  onClose: () => void;
  onSelectLocation: (locationId: string) => void;
};

export function LocationSheet({
  open,
  locations,
  activeLocationId,
  onClose,
  onSelectLocation,
}: LocationSheetProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  const filteredLocations = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return locations;
    }

    return locations.filter((location) =>
      `${location.name} ${location.address} ${location.area}`.toLowerCase().includes(normalized),
    );
  }, [locations, query]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 bg-[rgba(18,21,26,0.45)] backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-locales"
    >
      <div
        className="h-full w-full max-w-[360px] overflow-y-auto border-r border-white/30 bg-[var(--surface)] px-5 py-6 shadow-[40px_0_100px_rgba(12,11,10,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 id="titulo-locales" className="text-2xl font-semibold tracking-[-0.04em]">Locales cercanos</h2>
            <button type="button" onClick={onClose} className="text-xl text-[var(--muted)] transition hover:text-[var(--foreground)]">
              ✕
            </button>
          </div>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Busca por direccion o zona"
            className="w-full rounded-[16px] border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
          />

          <div className="space-y-3">
            {filteredLocations.map((location) => {
              const isActive = location.id === activeLocationId;

              return (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => {
                    onSelectLocation(location.id);
                    onClose();
                  }}
                  className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                    isActive
                      ? "border-[var(--brand)] bg-[var(--surface-strong)] shadow-[0_12px_24px_rgba(191,36,63,0.08)]"
                      : "border-[var(--line)] bg-white hover:border-[var(--brand)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">{location.name}</h3>
                      <p className="mt-2 text-sm text-[var(--muted)]">{location.address}</p>
                      <p className="text-sm text-[var(--muted)]">{location.area}</p>
                      <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-[var(--brand)]">{location.hours}</p>
                      <p className="mt-2 text-sm text-[var(--muted)]">{location.phone}</p>
                    </div>
                    <span className="pt-1 text-lg text-[var(--muted)]">›</span>
                  </div>
                </button>
              );
            })}

            {filteredLocations.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-[var(--line)] bg-white px-4 py-8 text-center text-sm text-[var(--muted)]">
                No encontramos locales para esa busqueda.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}