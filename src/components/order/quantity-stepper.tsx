type QuantityStepperProps = {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  compact?: boolean;
};

export function QuantityStepper({ value, onIncrease, onDecrease, compact = false }: QuantityStepperProps) {
  const baseButtonClass = compact
    ? "h-7 w-7 text-base"
    : "h-10 w-10 text-xl";

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={onDecrease}
        className={`${baseButtonClass} rounded-full border border-[var(--line)] bg-white font-medium text-[var(--foreground)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]`}
        aria-label="Disminuir cantidad"
      >
        -
      </button>
      <span className={`min-w-8 text-center font-semibold ${compact ? "text-sm" : "text-base"}`}>{value}</span>
      <button
        type="button"
        onClick={onIncrease}
        className={`${baseButtonClass} rounded-full border border-[var(--line)] bg-white font-medium text-[var(--foreground)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]`}
        aria-label="Aumentar cantidad"
      >
        +
      </button>
    </div>
  );
}