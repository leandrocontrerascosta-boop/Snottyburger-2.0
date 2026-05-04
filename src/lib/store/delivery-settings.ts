import type { DeliveryRate } from "@/lib/types/delivery";

const DELIVERY_SETTINGS_KEY = "snottyburger-delivery-rates";

export function loadDeliveryRates(fallback: DeliveryRate[]): DeliveryRate[] {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(DELIVERY_SETTINGS_KEY);
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as DeliveryRate[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return fallback;
    }

    return parsed.filter(isDeliveryRate);
  } catch {
    return fallback;
  }
}

export function saveDeliveryRates(rates: DeliveryRate[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DELIVERY_SETTINGS_KEY, JSON.stringify(rates));
}

function isDeliveryRate(value: unknown): value is DeliveryRate {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<DeliveryRate>;
  return typeof candidate.id === "string" && typeof candidate.maxDistanceKm === "number" && typeof candidate.price === "number";
}
