"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/pricing/order-pricing";
import type { SaleRecord, SalesFilters } from "@/lib/types/panel";

type SalesCenterProps = {
  records: SaleRecord[];
  filters: SalesFilters;
  onFiltersChange: (nextFilters: SalesFilters) => void;
};

export function SalesCenter({ records, filters, onFiltersChange }: SalesCenterProps) {
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const query = filters.query.trim().toLowerCase();
      const createdAtMs = new Date(record.createdAt).getTime();
      const fromMs = filters.from ? new Date(filters.from).getTime() : Number.NEGATIVE_INFINITY;
      const toMs = filters.to ? new Date(filters.to).getTime() : Number.POSITIVE_INFINITY;

      const matchesQuery =
        !query ||
        record.id.toLowerCase().includes(query) ||
        record.customerName.toLowerCase().includes(query);
      const matchesLocation = filters.location === "all" || record.location === filters.location;
      const matchesPayment = filters.paymentMethod === "all" || record.paymentMethod === filters.paymentMethod;
      const matchesStatus = filters.status === "all" || record.status === filters.status;
      const matchesDate = createdAtMs >= fromMs && createdAtMs <= toMs;

      return matchesQuery && matchesLocation && matchesPayment && matchesStatus && matchesDate;
    });
  }, [records, filters]);

  const uniqueLocations = useMemo(() => Array.from(new Set(records.map((record) => record.location))), [records]);

  return (
    <section className="space-y-4 rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:space-y-5 sm:p-5 md:rounded-[26px] md:p-7">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Ventas</p>
        <h2 className="text-[1.9rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-2xl">Panel listo para tus datos de ventas</h2>
        <p className="text-[13px] leading-6 text-[var(--muted)] sm:text-sm">
          Esta vista ya permite filtrar. Podes conectar tus datos reales despues sin cambiar la UI.
        </p>
      </header>

      <div className="grid gap-3 rounded-2xl border border-[var(--line)] bg-white/60 p-4 md:grid-cols-2 xl:grid-cols-3">
        <FilterInput
          label="Buscar por ID o cliente"
          value={filters.query}
          onChange={(value) => onFiltersChange({ ...filters, query: value })}
          placeholder="sale-10021"
        />

        <label className="space-y-1 text-sm font-medium">
          Local
          <select
            value={filters.location}
            onChange={(event) => onFiltersChange({ ...filters, location: event.target.value })}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
          >
            <option value="all">Todos</option>
            {uniqueLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm font-medium">
          Estado
          <select
            value={filters.status}
            onChange={(event) => onFiltersChange({ ...filters, status: event.target.value as SalesFilters["status"] })}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
          >
            <option value="all">Todos</option>
            <option value="paid">Pagado</option>
            <option value="pending">Pendiente</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </label>

        <label className="space-y-1 text-sm font-medium">
          Pago
          <select
            value={filters.paymentMethod}
            onChange={(event) =>
              onFiltersChange({ ...filters, paymentMethod: event.target.value as SalesFilters["paymentMethod"] })
            }
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
          >
            <option value="all">Todos</option>
            <option value="cash">Efectivo</option>
            <option value="transfer">Transferencia</option>
          </select>
        </label>

        <FilterInput
          label="Desde"
          type="date"
          value={filters.from}
          onChange={(value) => onFiltersChange({ ...filters, from: value })}
        />

        <FilterInput
          label="Hasta"
          type="date"
          value={filters.to}
          onChange={(value) => onFiltersChange({ ...filters, to: value })}
        />
      </div>

      <div className="space-y-3 md:hidden">
        {filteredRecords.map((record) => (
          <article key={record.id} className="rounded-2xl border border-[var(--line)] bg-white/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[var(--foreground)]">{record.id}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{record.customerName}</p>
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{formatCurrency(record.total)}</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-[var(--muted)]">
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em]">Fecha</p>
                <p className="mt-1">{new Date(record.createdAt).toLocaleString("es-AR")}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em]">Local</p>
                <p className="mt-1">{record.location}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em]">Pago</p>
                <p className="mt-1 capitalize">{record.paymentMethod}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em]">Estado</p>
                <p className="mt-1 capitalize">{record.status}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-[var(--muted)]">Items: {record.itemCount}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Detalle: {formatRecordItems(record)}</p>
          </article>
        ))}
        {filteredRecords.length === 0 ? (
          <article className="rounded-2xl border border-dashed border-[var(--line)] bg-white/50 p-4 text-sm text-[var(--muted)]">
            Todavia no hay ventas registradas en Supabase para los filtros actuales.
          </article>
        ) : null}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--line)] bg-white/70 md:block">
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] bg-[var(--surface-strong)]/70 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            <tr>
              <th className="px-3 py-3">ID</th>
              <th className="px-3 py-3">Fecha</th>
              <th className="px-3 py-3">Cliente</th>
              <th className="px-3 py-3">Local</th>
              <th className="px-3 py-3">Items</th>
              <th className="px-3 py-3">Detalle</th>
              <th className="px-3 py-3">Pago</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr key={record.id} className="border-b border-[var(--line)] last:border-b-0">
                <td className="px-3 py-3 font-semibold">{record.id}</td>
                <td className="px-3 py-3 text-[var(--muted)]">{new Date(record.createdAt).toLocaleString("es-AR")}</td>
                <td className="px-3 py-3">{record.customerName}</td>
                <td className="px-3 py-3">{record.location}</td>
                <td className="px-3 py-3">{record.itemCount}</td>
                <td className="px-3 py-3 text-[var(--muted)]">{formatRecordItems(record)}</td>
                <td className="px-3 py-3 capitalize">{record.paymentMethod}</td>
                <td className="px-3 py-3 capitalize">{record.status}</td>
                <td className="px-3 py-3 font-semibold">{formatCurrency(record.total)}</td>
              </tr>
            ))}
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-sm text-[var(--muted)]">
                  Todavia no hay ventas registradas en Supabase para los filtros actuales.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface-strong)]/60 p-4 text-sm text-[var(--muted)]">
        Campos listos para integrar luego: canal de venta, repartidor, costo operativo, margen, cupon aplicado, tiempos de entrega.
      </div>
    </section>
  );
}

function formatRecordItems(record: SaleRecord): string {
  if (record.items.length === 0) {
    return "Sin detalle";
  }

  const labels = record.items.map((item) => `${item.quantity}x ${item.productName}`);
  if (labels.length <= 2) {
    return labels.join(" • ");
  }

  return `${labels.slice(0, 2).join(" • ")} +${labels.length - 2} mas`;
}

type FilterInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "date";
};

function FilterInput({ label, value, onChange, placeholder, type = "text" }: FilterInputProps) {
  return (
    <label className="space-y-1 text-sm font-medium">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
      />
    </label>
  );
}
