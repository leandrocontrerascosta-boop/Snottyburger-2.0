"use client";

import { useState } from "react";

type PromoCodeInputProps = {
  onApplyCode: (code: string) => Promise<void>;
  appliedCode: string | null;
  discountInfo?: {
    code: string;
    discountPercent: number;
    applyTo: "burgers" | "total";
  } | null;
};

export function PromoCodeInput({ onApplyCode, appliedCode, discountInfo }: PromoCodeInputProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await onApplyCode(input.toUpperCase().trim());
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al aplicar código");
    } finally {
      setIsLoading(false);
    }
  }

  if (appliedCode && discountInfo) {
    return (
      <div className="rounded-[12px] border border-green-200 bg-green-50 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-green-700">
              Código aplicado
            </p>
            <p className="mt-1 font-mono text-sm font-semibold text-green-900">{appliedCode}</p>
            <p className="mt-1 text-xs text-green-700">
              -{discountInfo.discountPercent}% {discountInfo.applyTo === "burgers" ? "en hamburguesas" : "en total"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setInput("");
              setError(null);
            }}
            className="text-lg text-green-700 transition hover:text-green-900"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
        Código de promoción
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(event) => {
            setInput(event.target.value.toUpperCase());
            setError(null);
          }}
          placeholder="Ingresa tu código"
          className="flex-1 rounded-[10px] border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={isLoading || !input.trim()}
          className="rounded-[10px] bg-[var(--brand)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "..." : "Aplicar"}
        </button>
      </div>
      {error && <p className="text-xs font-medium text-[var(--brand)]">{error}</p>}
    </div>
  );
}
