"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CheckoutModal, type CheckoutPayload } from "@/components/order/checkout-modal";
import { findProductById, formatCurrency, getChoiceMap, getCustomizationDelta } from "@/lib/pricing/order-pricing";
import { useCart } from "@/lib/store/cart-store";
import type { DeliveryRate } from "@/lib/types/delivery";
import type { CartItem, Location, Product } from "@/lib/types/order";
import { QuantityStepper } from "@/components/order/quantity-stepper";

type CartDrawerProps = {
  open: boolean;
  canOrder: boolean;
  closedMessage?: string;
  selectedLocation: Location;
  allProducts: Product[];
  deliveryRates: DeliveryRate[];
  recommendationProducts: Product[];
  onClose: () => void;
};

export function CartDrawer({
  open,
  canOrder,
  closedMessage,
  selectedLocation,
  allProducts,
  deliveryRates,
  recommendationProducts,
  onClose,
}: CartDrawerProps) {
  const { items, subtotal, increaseItem, decreaseItem, removeItem, addItem, clearCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const normalizedName = useMemo(() => customerName.trim(), [customerName]);
  const normalizedPhone = useMemo(() => contactPhone.replace(/\D/g, ""), [contactPhone]);
  const nameIsValid = normalizedName.length >= 2;
  const phoneIsValid = normalizedPhone.length >= 8;

  if (!open) {
    return null;
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-[rgba(18,21,26,0.45)] transition lg:hidden ${open ? "opacity-100 visible" : "pointer-events-none opacity-0 invisible"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-0 z-40 flex h-[100dvh] w-full flex-col border-l border-[var(--line)] bg-[var(--surface)] shadow-[0_40px_80px_rgba(24,18,15,0.24)] transition duration-300 lg:static lg:top-auto lg:z-10 lg:h-[calc(100vh-24px)] lg:max-w-none lg:translate-x-0 lg:rounded-[28px] lg:border lg:shadow-[0_28px_60px_rgba(24,18,15,0.1)] lg:!visible ${
          open ? "translate-x-0 pointer-events-auto visible" : "translate-x-full pointer-events-none invisible"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3.5 sm:px-5 sm:py-5">
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.04em] text-[var(--foreground)] sm:text-2xl">Tu pedido ({items.length})</h2>
            <p className="mt-0.5 text-xs text-[var(--muted)] sm:mt-1 sm:text-sm">Retiro base desde {selectedLocation.name}</p>
          </div>
          <button type="button" onClick={onClose} className="text-3xl text-[var(--muted)] transition hover:text-[var(--foreground)] lg:hidden">
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-4 px-3 py-3 sm:space-y-6 sm:px-5 sm:py-5">
            {!canOrder ? (
              <div className="rounded-[16px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                {closedMessage ?? "Local cerrado por el momento. La carta queda en modo solo lectura."}
              </div>
            ) : null}

            <section className="space-y-4">
              {items.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-[var(--line)] bg-white px-4 py-6 text-center text-sm leading-6 text-[var(--muted)]">
                  Agrega burgers, bebidas o promos para empezar el pedido.
                </div>
              ) : (
                items.map((item) => {
                  const product = findProductById(allProducts, item.productId);

                  if (!product) {
                    return null;
                  }

                  const choiceMap = getChoiceMap(product);
                  const lineTotal = (product.price + getCustomizationDelta(product, item.selectedChoiceIds)) * item.quantity;

                  return (
                    <article key={item.id} className="rounded-[18px] border border-[var(--line)] bg-white px-3 py-3 shadow-[0_16px_30px_rgba(24,18,15,0.06)] sm:rounded-[22px] sm:px-4 sm:py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-[var(--foreground)] sm:text-sm">{item.quantity}</span>
                            <h3 className="text-sm font-semibold text-[var(--foreground)] sm:text-base">{product.name}</h3>
                          </div>
                          {item.selectedChoiceIds.length > 0 ? (
                            <ul className="space-y-1 text-[11px] text-[var(--muted)] sm:text-xs">
                              {item.selectedChoiceIds.map((choiceId) => (
                                <li key={choiceId}>{choiceMap.get(choiceId)?.label}</li>
                              ))}
                            </ul>
                          ) : null}
                          {item.note ? <p className="text-xs italic text-[var(--muted)]">Obs: {item.note}</p> : null}
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-sm font-semibold text-[var(--foreground)] sm:text-base">{formatCurrency(lineTotal)}</span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            disabled={!canOrder}
                            className="text-sm text-[var(--muted)] transition hover:text-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            🗑
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <QuantityStepper
                          compact
                          value={item.quantity}
                          onIncrease={() => {
                            if (!canOrder) {
                              return;
                            }
                            increaseItem(item.id);
                          }}
                          onDecrease={() => {
                            if (!canOrder) {
                              return;
                            }
                            decreaseItem(item.id);
                          }}
                        />
                      </div>
                    </article>
                  );
                })
              )}
            </section>

            <section className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Tambien te puede gustar</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                {recommendationProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      if (!canOrder) {
                        return;
                      }
                      addItem({ productId: product.id, quantity: 1, selectedChoiceIds: [] });
                    }}
                    disabled={!canOrder}
                    className="overflow-hidden rounded-[14px] border border-[var(--line)] bg-white text-left transition hover:border-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-[18px]"
                  >
                    <div className="relative aspect-square bg-[#efe6da]">
                      <Image src={product.image} alt={product.name} fill className="object-cover" sizes="120px" />
                    </div>
                    <div className="space-y-1 px-2 py-2">
                      <p className="line-clamp-2 text-xs font-semibold leading-4 text-[var(--foreground)] sm:text-sm sm:leading-5">{product.name}</p>
                      <p className="text-xs text-[var(--muted)] sm:text-sm">{formatCurrency(product.price)}</p>
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--brand)] text-[var(--brand)] sm:h-6 sm:w-6">
                        +
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="space-y-3 border-t border-[var(--line)] bg-[var(--surface)] px-3 py-3 sm:space-y-4 sm:px-5 sm:py-5">
          <div className="space-y-2 text-xs text-[var(--muted)] sm:space-y-3 sm:text-sm">
            <div className="flex items-center justify-between">
              <span>Total de items</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-[var(--line)] pt-2 text-sm font-semibold text-[var(--foreground)] sm:pt-3 sm:text-base">
              <span>Total del pedido</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <p className="text-xs text-[var(--muted)] sm:text-sm">Ingresa tus datos para confirmar el pedido.</p>
            <input
              value={customerName}
              onChange={(event) => {
                setCustomerName(event.target.value);
              }}
              placeholder="Nombre del cliente"
              className="w-full rounded-[12px] border border-[var(--line)] bg-white px-3 py-2.5 text-xs outline-none transition focus:border-[var(--brand)] sm:rounded-[14px] sm:px-4 sm:py-3 sm:text-sm"
            />
            {!nameIsValid && customerName ? (
              <p className="text-xs font-medium text-[var(--brand)] sm:text-sm">Ingresa un nombre valido (minimo 2 caracteres).</p>
            ) : null}
            <input
              value={contactPhone}
              onChange={(event) => {
                setContactPhone(event.target.value);
              }}
              inputMode="tel"
              placeholder="3815555555"
              className="w-full rounded-[12px] border border-[var(--line)] bg-white px-3 py-2.5 text-xs outline-none transition focus:border-[var(--brand)] sm:rounded-[14px] sm:px-4 sm:py-3 sm:text-sm"
            />
            {!phoneIsValid && contactPhone ? (
              <p className="text-xs font-medium text-[var(--brand)] sm:text-sm">Ingresa un telefono valido de al menos 8 digitos.</p>
            ) : null}
            <p className="text-xs text-[var(--muted)] sm:text-sm">El local seleccionado es {selectedLocation.name}. Podras elegir retiro o envio en el siguiente paso.</p>
            <button
              type="button"
              onClick={() => {
                if (!canOrder || !nameIsValid || !phoneIsValid || items.length === 0) {
                  return;
                }
                setCheckoutOpen(true);
              }}
              disabled={!canOrder || items.length === 0 || !nameIsValid || !phoneIsValid}
              className="flex w-full items-center justify-between rounded-[14px] bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-[#e6dfe0] disabled:text-[#9f9697] sm:rounded-[18px] sm:px-5 sm:py-4 sm:text-base"
            >
              <span>{canOrder ? "Continuar" : "Local cerrado"}</span>
              <span>{formatCurrency(subtotal)}</span>
            </button>
          </div>
        </div>
      </aside>

      <CheckoutModal
        open={checkoutOpen && canOrder}
        customerName={normalizedName}
        contactPhone={contactPhone}
        subtotal={subtotal}
        selectedLocation={selectedLocation}
        deliveryRates={deliveryRates}
        onClose={() => setCheckoutOpen(false)}
        onConfirm={(payload) => {
          const salesItems = buildSalesItems(allProducts, items);

          void fetch("/api/admin/sales", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              customerName: payload.customerName,
              contactPhone: payload.contactPhone,
              locationName: selectedLocation.name,
              locationAddress: selectedLocation.address,
              fulfillmentMethod: payload.fulfillmentMethod,
              paymentMethod: payload.paymentMethod,
              subtotal,
              deliveryPrice: payload.deliveryPrice ?? 0,
              total: payload.total,
              deliveryAddressLabel: payload.deliveryAddress?.label,
              deliveryLat: payload.deliveryAddress?.coordinates.lat,
              deliveryLng: payload.deliveryAddress?.coordinates.lng,
              items: salesItems,
            }),
          }).catch((error) => {
            console.error("No se pudo registrar la venta en Supabase", error);
          });

          const whatsappLink = buildWhatsAppOrderLink({
            allProducts,
            items,
            subtotal,
            selectedLocation,
            payload,
          });

          window.open(whatsappLink, "_blank", "noopener,noreferrer");
          clearCart();
          setCheckoutOpen(false);
        }}
      />
    </>
  );
}

function translatePaymentMethod(method: "cash" | "transfer") {
  switch (method) {
    case "cash":
      return "efectivo";
    case "transfer":
      return "transferencia";
    default:
      return method;
  }
}

type BuildWhatsAppOrderLinkInput = {
  allProducts: Product[];
  items: CartItem[];
  subtotal: number;
  selectedLocation: Location;
  payload: CheckoutPayload;
};

function buildWhatsAppOrderLink({ allProducts, items, subtotal, selectedLocation, payload }: BuildWhatsAppOrderLinkInput): string {
  const destinationPhone = normalizeWhatsAppNumber("3834598189");
  const deliveryCost = payload.deliveryPrice ?? 0;
  const paymentLabel = translatePaymentMethod(payload.paymentMethod);
  const fulfillmentLabel = payload.fulfillmentMethod === "pickup" ? "retiro por local" : "envio";

  const itemsBlock = items
    .map((item, index) => {
      const product = findProductById(allProducts, item.productId);

      if (!product) {
        return null;
      }

      const choiceMap = getChoiceMap(product);
      const unitPrice = product.price + getCustomizationDelta(product, item.selectedChoiceIds);
      const lineTotal = unitPrice * item.quantity;

      const sizeLabel =
        product.categoryId === "burgers"
          ? item.selectedChoiceIds.some((choiceId) => choiceId.startsWith("make-double-"))
            ? "DOBLE"
            : "SIMPLE"
          : undefined;

      const friesOptions = collectGroupOptions(product, item.selectedChoiceIds, "fries-type", choiceMap);
      const extrasOptions = collectGroupOptions(product, item.selectedChoiceIds, "extras", choiceMap);
      const noteText = item.note?.trim() || "";

      const baseLine = `* ${item.quantity}x ${product.name}${sizeLabel ? ` (${sizeLabel})` : ""} - ${formatCurrency(lineTotal)}`;
      const friesLine =
        product.categoryId === "burgers" && friesOptions.length > 0 ? `\n   Papas: ${friesOptions.join(", ")}` : "";
      const extrasLine =
        product.categoryId === "burgers" && extrasOptions.length > 0 ? `\n   Extras: ${extrasOptions.join(", ")}` : "";
      const obsLine = noteText ? `\n   Obs: ${noteText}` : "";

      return `${baseLine}${friesLine}${extrasLine}${obsLine}`;
    })
    .filter((line): line is string => Boolean(line))
    .join("\n\n");

  const mapsLink = payload.fulfillmentMethod === "delivery" && payload.deliveryAddress
    ? `https://www.google.com/maps/search/?api=1&query=${payload.deliveryAddress.coordinates.lat},${payload.deliveryAddress.coordinates.lng}`
    : "N/A";

  const emoji = {
    alert: "📢",
    customer: "👤",
    phone: "📞",
    address: "📍",
    delivery: "🚚",
    payment: "💳",
    cash: "💵",
    change: "💸",
    store: "🏠",
    detail: "📋",
    total: "💰",
    products: "📦",
    shipping: "🚛",
    maps: "📌",
  } as const;

  const cashLines = payload.paymentMethod === "cash"
    ? payload.cashPaymentAmount && payload.changeAmount !== undefined
      ? [`${emoji.cash} Pago con: ${formatCurrency(payload.cashPaymentAmount)}`, `${emoji.change} Vuelto: ${formatCurrency(payload.changeAmount)}`]
      : [`${emoji.cash} Pago con: efectivo exacto`, `${emoji.change} Vuelto: no requiere`]
    : [];

  const addressLine =
    payload.fulfillmentMethod === "delivery" && payload.deliveryAddress
      ? payload.deliveryAddress.label
      : `${selectedLocation.address}, ${selectedLocation.area}`;

  const message = [
    `${emoji.alert} *Nuevo pedido*`,
    "",
    `${emoji.customer} Cliente: ${payload.customerName}`,
    `${emoji.phone} Tel: ${payload.contactPhone}`,
    `${emoji.address} Direccion: ${addressLine}`,
    `${emoji.delivery} Entrega: ${fulfillmentLabel}`,
    `${emoji.payment} Pago: ${paymentLabel.toLowerCase()}`,
    ...cashLines,
    `${emoji.store} Local: ${selectedLocation.name} (${selectedLocation.address})`,
    "",
    `${emoji.detail} *Detalle:*`,
    itemsBlock,
    "",
    `${emoji.total} *Total:* ${formatCurrency(payload.total)}`,
    `${emoji.products} Productos: ${formatCurrency(subtotal)}`,
    `${emoji.shipping} Envio: ${formatCurrency(deliveryCost)}`,
    payload.fulfillmentMethod === "delivery" ? `${emoji.maps} Maps: ${mapsLink}` : "",
  ]
    .filter((line) => line !== "")
    .join("\n");

  return `https://wa.me/${destinationPhone}?text=${encodeURIComponent(message)}`;
}

function normalizeWhatsAppNumber(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.startsWith("54")) {
    return digits;
  }

  return `54${digits}`;
}

function collectGroupOptions(
  product: Product,
  selectedChoiceIds: string[],
  groupId: string,
  choiceMap: Map<string, { label: string }>,
): string[] {
  const group = product.modifierGroups.find((item) => item.id === groupId);
  if (!group) {
    return [];
  }

  const groupChoiceIds = new Set(group.choices.map((choice) => choice.id));

  return selectedChoiceIds
    .filter((choiceId) => groupChoiceIds.has(choiceId))
    .map((choiceId) => choiceMap.get(choiceId)?.label)
    .filter((label): label is string => Boolean(label));
}

function buildSalesItems(products: Product[], items: CartItem[]) {
  return items
    .map((item) => {
      const product = findProductById(products, item.productId);

      if (!product) {
        return null;
      }

      const choiceMap = getChoiceMap(product);
      const unitPrice = product.price + getCustomizationDelta(product, item.selectedChoiceIds);

      return {
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
        sizeLabel:
          product.categoryId === "burgers"
            ? item.selectedChoiceIds.some((choiceId) => choiceId.startsWith("make-double-"))
              ? "DOBLE"
              : "SIMPLE"
            : undefined,
        fries: collectGroupOptions(product, item.selectedChoiceIds, "fries-type", choiceMap),
        extras: collectGroupOptions(product, item.selectedChoiceIds, "extras", choiceMap),
        observation: item.note?.trim() || undefined,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}