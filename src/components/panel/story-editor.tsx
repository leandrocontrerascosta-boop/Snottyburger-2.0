"use client";

import { useState } from "react";
import type { StoryContent } from "@/lib/types/panel";

type StoryEditorProps = {
  story: StoryContent;
  onSaveStory: (nextStory: StoryContent) => void;
};

export function StoryEditor({ story, onSaveStory }: StoryEditorProps) {
  const [title, setTitle] = useState(story.title);
  const [body, setBody] = useState(story.body);

  return (
    <section className="space-y-5 rounded-[26px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] md:p-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Nuestra historia</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Editor de texto institucional</h2>
        </div>
        <p className="text-xs text-[var(--muted)]">Ultima actualizacion: {new Date(story.updatedAt).toLocaleString("es-AR")}</p>
      </header>

      <div className="grid gap-3 rounded-2xl border border-[var(--line)] bg-white/60 p-4">
        <label className="space-y-1 text-sm font-medium">
          Titulo
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
          />
        </label>

        <label className="space-y-1 text-sm font-medium">
          Contenido
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="min-h-40 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              onSaveStory({
                ...story,
                title: title.trim() || story.title,
                body: body.trim() || story.body,
                updatedAt: new Date().toISOString(),
              })
            }
            className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
          >
            Guardar borrador
          </button>
          <button
            type="button"
            onClick={() => {
              setTitle(story.title);
              setBody(story.body);
            }}
            className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface-strong)]"
          >
            Restaurar
          </button>
        </div>
      </div>
    </section>
  );
}
