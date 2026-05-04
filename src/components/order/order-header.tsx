import Image from "next/image";
import Link from "next/link";
import type { Location } from "@/lib/types/order";

type OrderHeaderProps = {
  location: Location;
  itemCount: number;
  canOrder: boolean;
  onOpenLocation: () => void;
  onOpenCart: () => void;
};

export function OrderHeader({ location, itemCount, canOrder, onOpenLocation, onOpenCart }: OrderHeaderProps) {
  return (
    <header className="rounded-b-[24px] border border-t-0 border-[var(--line)] bg-[var(--surface)]/95 px-4 py-3 shadow-[0_24px_50px_rgba(31,22,18,0.06)] backdrop-blur sm:px-5 sm:py-4 md:rounded-b-[28px] md:px-7">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenLocation}
          className="tap-target inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--brand)] hover:text-[var(--brand)] sm:px-4 sm:text-sm"
          aria-label={`Cambiar local. Actual: ${location.name}`}
        >
          <span>Local</span>
          <span className="max-w-[84px] truncate text-[var(--muted)] sm:max-w-[120px]">{location.name}</span>
        </button>

        <div className="flex items-center justify-center">
          <Link href="/" aria-label="Ir al inicio">
            <Image src="/images/home/logosnotty.png" alt="Snottyburgers" width={144} height={52} priority className="h-9 w-auto sm:h-10" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!canOrder) {
              return;
            }
            onOpenCart();
          }}
          disabled={!canOrder}
          className="tap-target inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:bg-[#c9c1c2] sm:px-4 sm:text-sm"
          aria-label={`Abrir carrito con ${itemCount} items`}
        >
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-[11px] text-[var(--brand)] sm:h-7 sm:min-w-7 sm:px-2">
            {itemCount}
          </span>
        </button>
      </div>
    </header>
  );
}