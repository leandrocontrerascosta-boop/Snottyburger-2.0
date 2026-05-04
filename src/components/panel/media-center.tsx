"use client";

import { useState, type FormEvent } from "react";
import type { HomeMediaAsset, HomeMediaType } from "@/lib/types/panel";

export type MediaAssetDraft = {
  title: string;
  type: HomeMediaType;
  placement: HomeMediaAsset["placement"];
  source: string;
};

type MediaCenterProps = {
  assets: HomeMediaAsset[];
  onCreateAsset: (draft: MediaAssetDraft) => void;
  onDeleteAsset: (assetId: string) => void;
  onToggleAssetStatus: (assetId: string) => void;
};

const defaultDraft: MediaAssetDraft = {
  title: "",
  type: "image",
  placement: "hero",
  source: "",
};

export function MediaCenter({ assets, onCreateAsset, onDeleteAsset, onToggleAssetStatus }: MediaCenterProps) {
  const [draft, setDraft] = useState<MediaAssetDraft>(defaultDraft);

  function submitDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.title.trim() || !draft.source.trim()) {
      return;
    }

    onCreateAsset({
      ...draft,
      title: draft.title.trim(),
      source: draft.source.trim(),
    });

    setDraft(defaultDraft);
  }

  return (
    <section className="space-y-5 rounded-[26px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] md:p-7">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Central de banners</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Imagenes y videos del Home</h2>
      </header>

      <form onSubmit={submitDraft} className="grid gap-3 rounded-2xl border border-[var(--line)] bg-white/60 p-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium md:col-span-2">
          Titulo interno
          <input
            value={draft.title}
            onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
            placeholder="Ej: Video hero 2026"
            required
          />
        </label>

        <label className="space-y-1 text-sm font-medium">
          Tipo
          <select
            value={draft.type}
            onChange={(event) => setDraft((prev) => ({ ...prev, type: event.target.value as HomeMediaType }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
          >
            <option value="image">Imagen</option>
            <option value="video">Video</option>
          </select>
        </label>

        <label className="space-y-1 text-sm font-medium">
          Ubicacion
          <select
            value={draft.placement}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, placement: event.target.value as HomeMediaAsset["placement"] }))
            }
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
          >
            <option value="hero">Hero</option>
            <option value="gallery">Galeria</option>
            <option value="story">Historia</option>
            <option value="footer">Footer</option>
          </select>
        </label>

        <label className="space-y-1 text-sm font-medium md:col-span-2">
          Fuente (ruta publica o URL)
          <input
            value={draft.source}
            onChange={(event) => setDraft((prev) => ({ ...prev, source: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
            placeholder="/images/home/home-reel.mp4"
            required
          />
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
          >
            Agregar asset
          </button>
        </div>
      </form>

      <ul className="space-y-3">
        {assets.map((asset) => (
          <li
            key={asset.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3"
          >
            <div>
              <p className="font-semibold">{asset.title}</p>
              <p className="text-xs text-[var(--muted)]">
                {asset.type.toUpperCase()} · {asset.placement} · {asset.source}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] ${
                  asset.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {asset.status === "active" ? "Activo" : "Pausado"}
              </span>
              <button
                type="button"
                onClick={() => onToggleAssetStatus(asset.id)}
                className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold transition hover:bg-[var(--surface-strong)]"
              >
                {asset.status === "active" ? "Pausar" : "Activar"}
              </button>
              <button
                type="button"
                onClick={() => onDeleteAsset(asset.id)}
                className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
