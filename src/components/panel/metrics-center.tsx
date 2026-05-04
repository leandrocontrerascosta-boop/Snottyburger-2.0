import { useMemo } from "react";
import { formatCurrency } from "@/lib/pricing/order-pricing";
import type { SaleRecord } from "@/lib/types/panel";

type MetricsCenterProps = {
  records: SaleRecord[];
};

type PaymentRow = { method: string; count: number; total: number; avg: number };
type ProductRow = { key: string; name: string; quantity: number; revenue: number; orders: number };
type FulfillmentRow = { method: string; count: number; total: number; share: number };
type LocationRow = { location: string; count: number; total: number; avg: number };
type TrafficStatus = "green" | "yellow" | "red";
type KpiSignal = { id: string; label: string; value: string; status: TrafficStatus; note: string };

export function MetricsCenter({ records }: MetricsCenterProps) {
  const metrics = useMemo(() => computeMetrics(records), [records]);

  return (
    <section className="space-y-5 rounded-[26px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)] md:p-7">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Metricas</p>
        <h2 className="text-2xl font-semibold tracking-[-0.03em]">Centro analitico de ventas</h2>
        <p className="text-sm text-[var(--muted)]">
          KPIs comerciales y operativos para tomar decisiones de crecimiento en menu, pricing y canales.
        </p>
      </header>

      {records.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/50 p-6 text-center text-sm text-[var(--muted)]">
          Todavia no hay ventas registradas. Las metricas apareceran cuando se confirmen pedidos desde /orden.
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Facturacion total" value={formatCurrency(metrics.totalRevenue)} sub={`${metrics.totalOrders} pedidos pagados`} />
            <MetricCard title="Ticket promedio" value={formatCurrency(metrics.avgTicket)} sub="ingreso medio por pedido" />
            <MetricCard title="Items por pedido" value={metrics.avgItemsPerOrder.toFixed(2)} sub="profundidad del carrito" />
            <MetricCard title="Pedidos hoy" value={String(metrics.ordersToday)} sub={`${formatCurrency(metrics.revenueToday)} facturado hoy`} />
            <MetricCard title="Ventas ultimos 7 dias" value={formatCurrency(metrics.revenueLast7Days)} sub={formatGrowth(metrics.revenueGrowth7dPct)} />
            <MetricCard title="Pedidos ultimos 7 dias" value={String(metrics.ordersLast7Days)} sub={formatGrowth(metrics.ordersGrowth7dPct)} />
            <MetricCard title="Tasa de cancelacion" value={`${metrics.cancellationRate.toFixed(1)}%`} sub={`${metrics.cancelledOrders} cancelados sobre ${metrics.totalTrackedOrders}`} />
            <MetricCard title="Clientes recurrentes" value={`${metrics.repeatCustomerRate.toFixed(1)}%`} sub={`${metrics.repeatCustomers} de ${metrics.uniqueCustomers} clientes`} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <MetricCard title="Canal dominante" value={metrics.topFulfillmentMethod} sub={`${metrics.topFulfillmentShare.toFixed(1)}% de los pedidos pagados`} compact />
            <MetricCard title="Franja horaria pico" value={metrics.peakHourLabel} sub={`${metrics.peakHourOrders} pedidos en esa hora`} compact />
            <MetricCard title="Dependencia top producto" value={`${metrics.topProductRevenueShare.toFixed(1)}%`} sub="porcentaje del ingreso en 1 producto" compact />
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">Semaforo KPI</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.kpiSignals.map((signal) => (
                <article key={signal.id} className="rounded-xl border border-[var(--line)] bg-white px-3 py-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        signal.status === "green" ? "bg-emerald-500" : signal.status === "yellow" ? "bg-amber-500" : "bg-rose-500"
                      }`}
                    />
                    {signal.label}
                  </p>
                  <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">{signal.value}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{signal.note}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white/70">
            <table className="min-w-[560px] w-full text-left text-sm">
              <thead className="border-b border-[var(--line)] bg-[var(--surface-strong)]/70 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Metodo de pago</th>
                  <th className="px-4 py-3">Pedidos</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {metrics.byPaymentMethod.map((row) => (
                  <tr key={row.method} className="border-b border-[var(--line)] last:border-0">
                    <td className="px-4 py-3 font-medium capitalize">{row.method}</td>
                    <td className="px-4 py-3">{row.count}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(row.total)}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{formatCurrency(row.avg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white/70">
            <table className="min-w-[560px] w-full text-left text-sm">
              <thead className="border-b border-[var(--line)] bg-[var(--surface-strong)]/70 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Canal</th>
                  <th className="px-4 py-3">Pedidos</th>
                  <th className="px-4 py-3">Participacion</th>
                  <th className="px-4 py-3">Facturacion</th>
                </tr>
              </thead>
              <tbody>
                {metrics.byFulfillment.map((row) => (
                  <tr key={row.method} className="border-b border-[var(--line)] last:border-0">
                    <td className="px-4 py-3 font-medium">{row.method}</td>
                    <td className="px-4 py-3">{row.count}</td>
                    <td className="px-4 py-3">{row.share.toFixed(1)}%</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white/70">
            <table className="min-w-[640px] w-full text-left text-sm">
              <thead className="border-b border-[var(--line)] bg-[var(--surface-strong)]/70 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Unidades</th>
                  <th className="px-4 py-3">Pedidos con el producto</th>
                  <th className="px-4 py-3">Facturacion</th>
                </tr>
              </thead>
              <tbody>
                {metrics.topProducts.map((row) => (
                  <tr key={row.key} className="border-b border-[var(--line)] last:border-0">
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3">{row.quantity}</td>
                    <td className="px-4 py-3">{row.orders}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(row.revenue)}</td>
                  </tr>
                ))}
                {metrics.topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-[var(--muted)]">
                      Aun no hay detalle de items para mostrar productos vendidos.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white/70">
            <table className="min-w-[560px] w-full text-left text-sm">
              <thead className="border-b border-[var(--line)] bg-[var(--surface-strong)]/70 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Local</th>
                  <th className="px-4 py-3">Pedidos</th>
                  <th className="px-4 py-3">Facturacion</th>
                  <th className="px-4 py-3">Ticket promedio</th>
                </tr>
              </thead>
              <tbody>
                {metrics.byLocation.map((row) => (
                  <tr key={row.location} className="border-b border-[var(--line)] last:border-0">
                    <td className="px-4 py-3 font-medium">{row.location}</td>
                    <td className="px-4 py-3">{row.count}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(row.total)}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{formatCurrency(row.avg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

type MetricCardProps = { title: string; value: string; sub: string; compact?: boolean };

function MetricCard({ title, value, sub, compact = false }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-white/70 p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">{title}</p>
      <p className={`mt-2 font-semibold tracking-[-0.03em] ${compact ? "text-2xl" : "text-3xl"}`}>{value}</p>
      <p className="mt-1 text-xs font-medium text-[var(--muted)]">{sub}</p>
    </article>
  );
}

function computeMetrics(records: SaleRecord[]) {
  const paidRecords = records.filter((r) => r.status === "paid");
  const now = new Date();

  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);

  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const start7 = new Date(startToday);
  start7.setDate(start7.getDate() - 6);

  const startPrev7 = new Date(start7);
  startPrev7.setDate(startPrev7.getDate() - 7);

  const totalRevenue = paidRecords.reduce((acc, r) => acc + r.total, 0);
  const totalOrders = paidRecords.length;
  const avgTicket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const ordersToday = paidRecords.filter((r) => new Date(r.createdAt) >= startToday).length;
  const revenueToday = paidRecords
    .filter((r) => new Date(r.createdAt) >= startToday)
    .reduce((acc, r) => acc + r.total, 0);

  const ordersThisMonth = paidRecords.filter((r) => new Date(r.createdAt) >= startMonth).length;
  const revenueThisMonth = paidRecords
    .filter((r) => new Date(r.createdAt) >= startMonth)
    .reduce((acc, r) => acc + r.total, 0);

  const recordsLast7Days = paidRecords.filter((r) => new Date(r.createdAt) >= start7);
  const recordsPrev7Days = paidRecords.filter((r) => {
    const date = new Date(r.createdAt);
    return date >= startPrev7 && date < start7;
  });

  const ordersLast7Days = recordsLast7Days.length;
  const ordersPrev7Days = recordsPrev7Days.length;
  const revenueLast7Days = recordsLast7Days.reduce((acc, r) => acc + r.total, 0);
  const revenuePrev7Days = recordsPrev7Days.reduce((acc, r) => acc + r.total, 0);

  const ordersGrowth7dPct = computeGrowthPct(ordersLast7Days, ordersPrev7Days);
  const revenueGrowth7dPct = computeGrowthPct(revenueLast7Days, revenuePrev7Days);

  const cancelledOrders = records.filter((r) => r.status === "cancelled").length;
  const totalTrackedOrders = records.length;
  const cancellationRate = totalTrackedOrders > 0 ? (cancelledOrders / totalTrackedOrders) * 100 : 0;

  const totalPaidItems = paidRecords.reduce((acc, r) => acc + r.itemCount, 0);
  const avgItemsPerOrder = totalOrders > 0 ? totalPaidItems / totalOrders : 0;

  const customerMap = new Map<string, number>();
  for (const r of paidRecords) {
    const customerKey = r.customerName.trim().toLowerCase();
    customerMap.set(customerKey, (customerMap.get(customerKey) ?? 0) + 1);
  }
  const uniqueCustomers = customerMap.size;
  const repeatCustomers = Array.from(customerMap.values()).filter((count) => count > 1).length;
  const repeatCustomerRate = uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0;

  const hourMap = new Map<number, number>();
  for (const r of paidRecords) {
    const hour = new Date(r.createdAt).getHours();
    hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1);
  }
  const peakHourEntry = Array.from(hourMap.entries()).sort((a, b) => b[1] - a[1])[0];
  const peakHour = peakHourEntry?.[0] ?? null;
  const peakHourOrders = peakHourEntry?.[1] ?? 0;
  const peakHourLabel = peakHour === null ? "-" : `${String(peakHour).padStart(2, "0")}:00 - ${String((peakHour + 1) % 24).padStart(2, "0")}:00`;

  const paymentMap = new Map<string, { count: number; total: number }>();
  for (const r of paidRecords) {
    const entry = paymentMap.get(r.paymentMethod) ?? { count: 0, total: 0 };
    paymentMap.set(r.paymentMethod, { count: entry.count + 1, total: entry.total + r.total });
  }
  const byPaymentMethod: PaymentRow[] = Array.from(paymentMap.entries())
    .map(([method, data]) => ({ method, count: data.count, total: data.total, avg: Math.round(data.total / data.count) }))
    .sort((a, b) => b.total - a.total);

  const fulfillmentMap = new Map<string, { count: number; total: number }>();
  for (const r of paidRecords) {
    const key = r.fulfillmentMethod === "delivery" ? "Delivery" : "Retiro en local";
    const entry = fulfillmentMap.get(key) ?? { count: 0, total: 0 };
    fulfillmentMap.set(key, { count: entry.count + 1, total: entry.total + r.total });
  }
  const byFulfillment: FulfillmentRow[] = Array.from(fulfillmentMap.entries())
    .map(([method, data]) => ({
      method,
      count: data.count,
      total: data.total,
      share: totalOrders > 0 ? (data.count / totalOrders) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const topFulfillment = byFulfillment[0];
  const topFulfillmentMethod = topFulfillment?.method ?? "-";
  const topFulfillmentShare = topFulfillment?.share ?? 0;

  const productMap = new Map<string, ProductRow>();
  for (const r of paidRecords) {
    for (const item of r.items) {
      const key = item.productId || item.productName;
      const entry = productMap.get(key) ?? {
        key,
        name: item.productName,
        quantity: 0,
        revenue: 0,
        orders: 0,
      };
      entry.quantity += item.quantity;
      entry.revenue += item.lineTotal;
      entry.orders += 1;
      productMap.set(key, entry);
    }
  }

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => {
      if (b.quantity !== a.quantity) {
        return b.quantity - a.quantity;
      }
      return b.revenue - a.revenue;
    })
    .slice(0, 8);

  const topProductRevenueShare = totalRevenue > 0 && topProducts.length > 0 ? (topProducts[0].revenue / totalRevenue) * 100 : 0;

  const locationMap = new Map<string, { count: number; total: number }>();
  for (const r of paidRecords) {
    const entry = locationMap.get(r.location) ?? { count: 0, total: 0 };
    locationMap.set(r.location, { count: entry.count + 1, total: entry.total + r.total });
  }
  const byLocation: LocationRow[] = Array.from(locationMap.entries())
    .map(([location, data]) => ({
      location,
      count: data.count,
      total: data.total,
      avg: Math.round(data.total / data.count),
    }))
    .sort((a, b) => b.total - a.total);

  const kpiSignals: KpiSignal[] = [
    {
      id: "kpi-cancel",
      label: "Cancelacion",
      value: `${cancellationRate.toFixed(1)}%`,
      status: cancellationRate <= 5 ? "green" : cancellationRate <= 10 ? "yellow" : "red",
      note: "objetivo <= 5%",
    },
    {
      id: "kpi-repeat",
      label: "Recompra",
      value: `${repeatCustomerRate.toFixed(1)}%`,
      status: repeatCustomerRate >= 35 ? "green" : repeatCustomerRate >= 20 ? "yellow" : "red",
      note: "objetivo >= 35%",
    },
    {
      id: "kpi-items",
      label: "Items por ticket",
      value: avgItemsPerOrder.toFixed(2),
      status: avgItemsPerOrder >= 2.2 ? "green" : avgItemsPerOrder >= 1.7 ? "yellow" : "red",
      note: "objetivo >= 2.2",
    },
    {
      id: "kpi-growth",
      label: "Crecimiento 7d",
      value: revenueGrowth7dPct === null ? "N/A" : `${revenueGrowth7dPct >= 0 ? "+" : ""}${revenueGrowth7dPct.toFixed(1)}%`,
      status:
        revenueGrowth7dPct === null
          ? "yellow"
          : revenueGrowth7dPct >= 8
            ? "green"
            : revenueGrowth7dPct >= 0
              ? "yellow"
              : "red",
      note: "objetivo >= +8%",
    },
  ];

  return {
    totalRevenue,
    totalOrders,
    avgTicket,
    avgItemsPerOrder,
    ordersToday,
    revenueToday,
    ordersThisMonth,
    revenueThisMonth,
    ordersLast7Days,
    revenueLast7Days,
    ordersGrowth7dPct,
    revenueGrowth7dPct,
    cancelledOrders,
    totalTrackedOrders,
    cancellationRate,
    uniqueCustomers,
    repeatCustomers,
    repeatCustomerRate,
    peakHourLabel,
    peakHourOrders,
    byPaymentMethod,
    byFulfillment,
    topFulfillmentMethod,
    topFulfillmentShare,
    topProducts,
    topProductRevenueShare,
    byLocation,
    kpiSignals,
  };
}

function computeGrowthPct(current: number, previous: number): number | null {
  if (previous === 0) {
    return current > 0 ? 100 : null;
  }

  return ((current - previous) / previous) * 100;
}

function formatGrowth(value: number | null): string {
  if (value === null) {
    return "sin base previa para comparar";
  }

  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}% vs 7 dias anteriores`;
}