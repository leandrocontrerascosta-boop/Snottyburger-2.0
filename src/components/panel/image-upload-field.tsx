"use client";

import { useRef, useState } from "react";

type UploadTarget = "order" | "promos" | "home";

type ImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  targetFolder: UploadTarget;
};

export function ImageUploadField({ label, value, onChange, targetFolder }: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleUpload(file: File) {
    setErrorMessage(null);
    setIsUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("targetFolder", targetFolder);

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        body,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "No se pudo subir la imagen");
      }

      const payload = (await response.json()) as { url: string };
      onChange(payload.url);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo subir la imagen");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2 md:col-span-2">
      <p className="text-sm font-medium">{label}</p>
      <div
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files?.[0];
          if (file) {
            void handleUpload(file);
          }
        }}
        className="rounded-2xl border border-dashed border-[var(--line)] bg-white p-4"
      >
        <p className="text-sm text-[var(--muted)]">
          Arrastra una imagen aqui o usa el boton para cargarla. Se ajusta automaticamente al formato de tarjeta y se optimiza en WebP.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface-strong)]"
            disabled={isUploading}
          >
            {isUploading ? "Subiendo..." : "Seleccionar imagen"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleUpload(file);
              }
              event.currentTarget.value = "";
            }}
          />
          {value ? (
            <span className="inline-flex items-center rounded-full bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
              {value}
            </span>
          ) : null}
        </div>
        {errorMessage ? <p className="mt-2 text-xs font-medium text-red-700">{errorMessage}</p> : null}
      </div>
    </div>
  );
}
