"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { catamarcaMapCenter } from "@/lib/mocks/delivery-data";
import { fetchRouteSummary, getDeliveryPrice, type DeliveryRouteSummary } from "@/lib/pricing/delivery-pricing";
import { formatCurrency } from "@/lib/pricing/order-pricing";
import { SkeletonBlock } from "@/components/ui/skeleton-block";
import type { Coordinates, DeliveryAddress, DeliveryRate } from "@/lib/types/delivery";
import type { Location } from "@/lib/types/order";

const DeliveryMapCanvas = dynamic(
  () => import("@/components/order/delivery-map-canvas").then((module) => module.DeliveryMapCanvas),
  {
    ssr: false,
    loading: () => <SkeletonBlock className="min-h-[320px] rounded-[24px]" />,
  },
);

const TRANSFER_ALIAS = "Emicarrizo73";

type CheckoutModalProps = {
  open: boolean;
  customerName: string;
  contactPhone: string;
  subtotal: number;
  selectedLocation: Location;
  deliveryRates: DeliveryRate[];
  onClose: () => void;
  onConfirm: (payload: CheckoutPayload) => void;
};

type FulfillmentMethod = "pickup" | "delivery";
type CheckoutPaymentMethod = "cash" | "transfer";

type SearchResult = {
  display_name: string;
  lat: string;
  lon: string;
};

export type CheckoutPayload = {
  fulfillmentMethod: FulfillmentMethod;
  paymentMethod: CheckoutPaymentMethod;
  customerName: string;
  contactPhone: string;
  cashPaymentAmount?: number;
  changeAmount?: number;
  deliveryAddress?: DeliveryAddress;
  deliveryDistanceKm?: number;
  deliveryPrice?: number;
  total: number;
};

export function CheckoutModal({
  open,
  customerName,
  contactPhone,
  subtotal,
  selectedLocation,
  deliveryRates,
  onClose,
  onConfirm,
}: CheckoutModalProps) {
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [transferFeedback, setTransferFeedback] = useState<string | null>(null);
  const [routeSummary, setRouteSummary] = useState<DeliveryRouteSummary | null>(null);
  const [cashPaymentAmount, setCashPaymentAmount] = useState<string>("");
  const searchAbortRef = useRef<AbortController | null>(null);

  const distanceKm = useMemo(() => routeSummary?.distanceKm ?? null, [routeSummary]);

  const deliveryPrice = useMemo(() => {
    if (fulfillmentMethod !== "delivery" || distanceKm === null) {
      return 0;
    }

    return getDeliveryPrice(distanceKm, deliveryRates);
  }, [deliveryRates, distanceKm, fulfillmentMethod]);

  const total = subtotal + (fulfillmentMethod === "delivery" ? deliveryPrice ?? 0 : 0);

  const parsedCashPaymentAmount = Number(cashPaymentAmount);
  const hasCashAmount = cashPaymentAmount.trim().length > 0;
  const cashAmountIsValid = !hasCashAmount || (Number.isFinite(parsedCashPaymentAmount) && parsedCashPaymentAmount >= total);
  const changeAmount = hasCashAmount && cashAmountIsValid ? parsedCashPaymentAmount - total : 0;

  const canConfirm = Boolean(
    fulfillmentMethod &&
      paymentMethod &&
      (fulfillmentMethod === "pickup" || (selectedAddress && routeSummary && !isCalculatingRoute && deliveryPrice !== null)) &&
      (paymentMethod !== "cash" || cashAmountIsValid),
  );
  const deliveryStepComplete = fulfillmentMethod === "pickup" || Boolean(selectedAddress && routeSummary && !isCalculatingRoute);
  const paymentStepComplete = Boolean(paymentMethod);

  const searchAddress = useCallback(async (query: string) => {
    if (!query.trim()) {
      return;
    }

    const normalizedQuery = query.trim().toLowerCase();
    if (selectedAddress && normalizedQuery === selectedAddress.label.trim().toLowerCase()) {
      setAddressError(null);
      setSearchResults([]);
      return;
    }

    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;
    setIsSearching(true);
    setAddressError(null);

    try {
      const params = new URLSearchParams({
        q: `${query.trim()}, Catamarca, Argentina`,
        format: "jsonv2",
        limit: "5",
        countrycodes: "ar",
        addressdetails: "1",
        viewbox: "-66.8,-27.8,-65.1,-29.2",
        bounded: "0",
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error("No se pudo buscar la direccion");
      }

      if (controller.signal.aborted) {
        return;
      }

      const results = (await response.json()) as SearchResult[];
      if (controller.signal.aborted) {
        return;
      }

      setSearchResults(results);
      if (results.length === 0 && query.trim().length >= 3) {
        setAddressError("No encontramos resultados en Catamarca. Proba con calle y numero.");
      } else {
        setAddressError(null);
      }
    } catch {
      if (!controller.signal.aborted) {
        setAddressError("No se pudo buscar la direccion en este momento.");
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsSearching(false);
      }
    }
  }, [selectedAddress]);

  async function reverseGeocode(coordinates: Coordinates) {
    setIsResolving(true);
    setIsCalculatingRoute(true);
    setAddressError(null);
    setRouteSummary(null);

    try {
      const params = new URLSearchParams({
        lat: String(coordinates.lat),
        lon: String(coordinates.lng),
        format: "jsonv2",
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`);
      if (!response.ok) {
        throw new Error("No se pudo resolver la direccion");
      }

      const payload = (await response.json()) as { display_name?: string };
      const label = payload.display_name ?? `${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}`;
      setSelectedAddress({ label, coordinates });
      setSearchQuery(label);
      setSearchResults([]);
    } catch {
      const label = `${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}`;
      setSelectedAddress({ label, coordinates });
      setSearchQuery(label);
      setSearchResults([]);
      setAddressError("No pudimos leer la direccion exacta, pero el pin quedo guardado.");
    } finally {
      setIsResolving(false);
    }
  }

  async function copyTransferAlias() {
    try {
      await navigator.clipboard.writeText(TRANSFER_ALIAS);
      setCopySuccess(true);
      setTransferFeedback("Alias copiado al portapapeles.");
      window.setTimeout(() => setCopySuccess(false), 1800);
      window.setTimeout(() => setTransferFeedback(null), 2200);
    } catch {
      setCopySuccess(false);
      setTransferFeedback("No se pudo copiar el alias automaticamente.");
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setAddressError("Este dispositivo no permite geolocalizacion.");
      return;
    }

    setIsGettingCurrentLocation(true);
    setAddressError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsGettingCurrentLocation(false);
        void reverseGeocode({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setIsGettingCurrentLocation(false);
        setAddressError("No pudimos obtener tu ubicacion actual. Revisa permisos de ubicacion.");
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 20000,
      },
    );
  }

  function handleSelectSearchResult(result: SearchResult) {
    const coordinates = { lat: Number(result.lat), lng: Number(result.lon) };
    setIsCalculatingRoute(true);
    setSelectedAddress({
      label: result.display_name,
      coordinates,
    });
    setRouteSummary(null);
    setSearchResults([]);
    setSearchQuery(result.display_name);
    setAddressError(null);
  }

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

  useEffect(() => {
    if (!open || fulfillmentMethod !== "delivery") {
      return;
    }

    if (selectedAddress && searchQuery.trim().toLowerCase() === selectedAddress.label.trim().toLowerCase()) {
      return;
    }

    const trimmed = searchQuery.trim();
    if (trimmed.length < 3) {
      searchAbortRef.current?.abort();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void searchAddress(trimmed);
    }, 280);

    return () => {
      window.clearTimeout(timeoutId);
      searchAbortRef.current?.abort();
    };
  }, [fulfillmentMethod, open, searchAddress, searchQuery, selectedAddress]);

  useEffect(() => {
    if (!open || !selectedAddress) {
      return;
    }

    let cancelled = false;

    void fetchRouteSummary(selectedLocation.coordinates, selectedAddress.coordinates)
      .then((summary) => {
        if (!cancelled) {
          setRouteSummary(summary);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRouteSummary(null);
          setAddressError("No se pudo calcular la ruta real del delivery para esa direccion.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsCalculatingRoute(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, selectedAddress, selectedLocation.coordinates]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-[rgba(18,21,26,0.62)] p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-titulo"
    >
      <div
        className="mx-auto max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/20 bg-[var(--surface)] shadow-[0_50px_100px_rgba(20,14,12,0.34)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4 md:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Finalizacion</p>
            <h2 id="checkout-titulo" className="mt-1 text-2xl font-semibold tracking-[-0.03em]">Completa tu pedido</h2>
          </div>
          <button type="button" onClick={onClose} className="text-3xl leading-none text-[var(--muted)] transition hover:text-[var(--foreground)]">
            ×
          </button>
        </div>

        <div className="grid max-h-[calc(92vh-82px)] gap-0 overflow-y-auto lg:grid-cols-[minmax(0,1.1fr)_360px]">
          <div className="space-y-5 p-5 md:p-7">
            <section className="space-y-2 rounded-[18px] border border-[var(--line)] bg-white/80 p-3 lg:hidden">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                <span>Progreso del checkout</span>
                <span>
                  {paymentStepComplete ? "Paso 3/3" : deliveryStepComplete ? "Paso 2/3" : fulfillmentMethod ? "Paso 1/3" : "Paso 1/3"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <StepBadge label="Entrega" done={Boolean(fulfillmentMethod)} />
                <StepBadge label="Direccion" done={deliveryStepComplete} />
                <StepBadge label="Pago" done={paymentStepComplete} />
              </div>
            </section>

            <section className="space-y-3">
              <p className="text-sm font-semibold text-[var(--foreground)]">1. Como quieres recibir el pedido</p>
              <div className="grid gap-3 md:grid-cols-2">
                <ChoiceCard
                  title="Retiro por local"
                  description={`Retiras en ${selectedLocation.name}.`}
                  active={fulfillmentMethod === "pickup"}
                  onClick={() => {
                    setFulfillmentMethod("pickup");
                    setPaymentMethod(null);
                  }}
                />
                <ChoiceCard
                  title="Envio a domicilio"
                  description="Busca la direccion o marca el punto en el mapa."
                  active={fulfillmentMethod === "delivery"}
                  onClick={() => {
                    setFulfillmentMethod("delivery");
                    setPaymentMethod(null);
                  }}
                />
              </div>
            </section>

            {fulfillmentMethod === "delivery" ? (
              <section className="space-y-4 rounded-[26px] border border-[var(--line)] bg-white/70 p-4 md:p-5">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[var(--foreground)]">2. Direccion de entrega</p>
                  <p className="text-sm text-[var(--muted)]">
                    Busqueda predictiva priorizada en Catamarca, Argentina. Tambien puedes tocar el mapa para dejar el pin.
                  </p>
                </div>

                <div className="grid gap-3">
                  <input
                    value={searchQuery}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setSearchQuery(nextValue);
                      if (selectedAddress && nextValue.trim() !== selectedAddress.label) {
                        setSelectedAddress(null);
                        setIsCalculatingRoute(false);
                        setRouteSummary(null);
                      }
                      if (!nextValue.trim()) {
                        setSearchResults([]);
                        setAddressError(null);
                      }
                    }}
                    placeholder="Buscar direccion en Catamarca"
                    className="w-full rounded-[16px] border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
                  />
                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    disabled={isGettingCurrentLocation}
                    className="inline-flex w-fit items-center rounded-[12px] border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isGettingCurrentLocation ? "Obteniendo ubicacion..." : "Direccion actual"}
                  </button>
                </div>

                {isSearching ? <p className="text-sm text-[var(--muted)]">Buscando sugerencias...</p> : null}

                {searchResults.length > 0 ? (
                  <div className="space-y-2 rounded-[18px] border border-[var(--line)] bg-[var(--surface-strong)] p-3">
                    {searchResults.map((result) => (
                      <button
                        key={`${result.lat}-${result.lon}`}
                        type="button"
                        onClick={() => handleSelectSearchResult(result)}
                        className="block w-full rounded-[14px] bg-white px-3 py-3 text-left text-sm transition hover:border-[var(--brand)] hover:bg-[#fff7ef]"
                      >
                        {result.display_name}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="overflow-hidden rounded-[24px] border border-[var(--line)]">
                  <DeliveryMapCanvas
                    center={selectedAddress?.coordinates ?? catamarcaMapCenter}
                    origin={selectedLocation.coordinates}
                    destination={selectedAddress?.coordinates ?? null}
                    routeGeometry={routeSummary?.geometry ?? []}
                    onSelectCoordinates={(coordinates) => {
                      void reverseGeocode(coordinates);
                    }}
                  />
                </div>

                {selectedAddress ? (
                  <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-sm">
                    <p className="font-semibold text-[var(--foreground)]">Direccion seleccionada</p>
                    <p className="mt-1 text-[var(--muted)]">{selectedAddress.label}</p>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {isCalculatingRoute ? (
                        <>
                          <SkeletonBlock className="h-[72px] rounded-[16px]" />
                          <SkeletonBlock className="h-[72px] rounded-[16px]" />
                        </>
                      ) : (
                        <>
                          <div className="rounded-[16px] bg-white px-3 py-3">
                            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Distancia por ruta</p>
                            <p className="mt-1 font-semibold text-[var(--foreground)]">
                              {distanceKm !== null ? `${distanceKm.toFixed(2)} km` : "-"}
                            </p>
                          </div>
                          <div className="rounded-[16px] bg-white px-3 py-3">
                            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Costo delivery</p>
                            <p className="mt-1 font-semibold text-[var(--foreground)]">
                              {deliveryPrice !== null ? formatCurrency(deliveryPrice) : "Fuera de cobertura"}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : null}

                {isResolving ? <p className="text-sm text-[var(--muted)]">Resolviendo direccion del pin...</p> : null}
                {isCalculatingRoute ? <p className="text-sm text-[var(--muted)]">Calculando distancia real por ruta...</p> : null}
                {addressError ? <p className="text-sm font-medium text-[var(--brand)]">{addressError}</p> : null}
              </section>
            ) : null}

            {fulfillmentMethod ? (
              <section className="space-y-3 rounded-[26px] border border-[var(--line)] bg-white/70 p-4 md:p-5">
                <p className="text-sm font-semibold text-[var(--foreground)]">{fulfillmentMethod === "pickup" ? "2" : "3"}. Medio de pago</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <ChoiceCard
                    title="Efectivo"
                    description="Pago al recibir o retirar"
                    active={paymentMethod === "cash"}
                    onClick={() => setPaymentMethod("cash")}
                  />
                  <ChoiceCard
                    title="Transferencia"
                    description="CBU o alias al confirmar"
                    active={paymentMethod === "transfer"}
                    onClick={() => setPaymentMethod("transfer")}
                  />
                </div>

                {paymentMethod === "cash" ? (
                  <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                    <label className="space-y-1 text-sm font-medium">
                      Paga con (opcional)
                      <input
                        type="number"
                        min={0}
                        step="100"
                        value={cashPaymentAmount}
                        onChange={(event) => setCashPaymentAmount(event.target.value)}
                        placeholder="Ej: 20000"
                        className="mt-1 w-full rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
                      />
                    </label>

                    {!cashAmountIsValid ? (
                      <p className="mt-2 text-sm font-medium text-[var(--brand)]">El monto en efectivo debe ser igual o mayor al total.</p>
                    ) : null}

                    {hasCashAmount && cashAmountIsValid ? (
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        Vuelto estimado: <span className="font-semibold text-[var(--foreground)]">{formatCurrency(changeAmount)}</span>
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {paymentMethod === "transfer" ? (
                  <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                    <p className="text-sm text-[var(--muted)]">Alias para transferencia</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <code className="rounded-[10px] border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--foreground)]">
                        {TRANSFER_ALIAS}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          void copyTransferAlias();
                        }}
                        className="rounded-[10px] border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                      >
                        {copySuccess ? "Copiado" : "Copiar"}
                      </button>
                    </div>
                    {transferFeedback ? <p className="mt-2 text-xs text-[var(--muted)]">{transferFeedback}</p> : null}
                  </div>
                ) : null}
              </section>
            ) : null}
          </div>

          <aside className="border-t border-[var(--line)] bg-[var(--surface-strong)]/60 p-5 lg:border-l lg:border-t-0 md:p-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Resumen</p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Pedido listo para confirmar</h3>
              </div>

              <div className="space-y-3 rounded-[22px] border border-[var(--line)] bg-white px-4 py-4 text-sm text-[var(--muted)]">
                <div className="flex items-center justify-between">
                  <span>Cliente</span>
                  <span className="font-semibold text-[var(--foreground)]">{customerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Telefono</span>
                  <span className="font-semibold text-[var(--foreground)]">{contactPhone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Entrega</span>
                  <span className="font-semibold text-[var(--foreground)]">
                    {fulfillmentMethod === "pickup"
                      ? "Retiro por local"
                      : fulfillmentMethod === "delivery"
                        ? "Envio a domicilio"
                        : "Pendiente"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Local</span>
                  <span className="font-semibold text-[var(--foreground)]">{selectedLocation.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery</span>
                  <span>
                    {fulfillmentMethod === "delivery"
                      ? isCalculatingRoute
                        ? "Calculando..."
                        : deliveryPrice !== null
                          ? formatCurrency(deliveryPrice)
                          : "-"
                      : formatCurrency(0)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-[var(--line)] pt-3 text-base font-semibold text-[var(--foreground)]">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={!canConfirm}
                onClick={() => {
                  if (!fulfillmentMethod || !paymentMethod) {
                    return;
                  }

                  onConfirm({
                    fulfillmentMethod,
                    paymentMethod,
                    customerName,
                    contactPhone,
                    cashPaymentAmount: paymentMethod === "cash" && hasCashAmount && cashAmountIsValid ? parsedCashPaymentAmount : undefined,
                    changeAmount: paymentMethod === "cash" && hasCashAmount && cashAmountIsValid ? changeAmount : undefined,
                    deliveryAddress: selectedAddress ?? undefined,
                    deliveryDistanceKm: distanceKm ?? undefined,
                    deliveryPrice: fulfillmentMethod === "delivery" ? deliveryPrice ?? undefined : undefined,
                    total,
                  });
                }}
                className="flex w-full items-center justify-between rounded-[18px] bg-[var(--brand)] px-5 py-4 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-[#e6dfe0] disabled:text-[#9f9697]"
              >
                <span>Confirmar pedido</span>
                <span>{formatCurrency(total)}</span>
              </button>

              <p className="text-xs leading-5 text-[var(--muted)]">
                Al confirmar, te dirigiremos a WhatsApp para finalizar la toma del pedido. Si elegiste transferencia,
                deberas enviar el comprobante por esa via.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

type ChoiceCardProps = {
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
};

function ChoiceCard({ title, description, active, onClick }: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[22px] border px-4 py-4 text-left transition ${
        active
          ? "border-[var(--brand)] bg-[var(--surface-strong)] shadow-[0_12px_24px_rgba(191,36,63,0.08)]"
          : "border-[var(--line)] bg-white hover:border-[var(--brand)]"
      }`}
    >
      <p className="font-semibold text-[var(--foreground)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
    </button>
  );
}

type StepBadgeProps = {
  label: string;
  done: boolean;
};

function StepBadge({ label, done }: StepBadgeProps) {
  return (
    <div
      className={`rounded-full px-3 py-2 text-center font-semibold transition ${
        done
          ? "bg-[var(--brand)] text-white"
          : "border border-[var(--line)] bg-white text-[var(--muted)]"
      }`}
    >
      {label}
    </div>
  );
}
