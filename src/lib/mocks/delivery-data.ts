import type { Coordinates, DeliveryRate } from "@/lib/types/delivery";

export const catamarcaMapCenter: Coordinates = {
  lat: -28.4543661,
  lng: -65.7517903,
};

export const initialDeliveryRates: DeliveryRate[] = [
  {
    id: "delivery-1",
    maxDistanceKm: 2,
    price: 1800,
  },
  {
    id: "delivery-2",
    maxDistanceKm: 4,
    price: 2600,
  },
  {
    id: "delivery-3",
    maxDistanceKm: 6,
    price: 3400,
  },
  {
    id: "delivery-4",
    maxDistanceKm: 10,
    price: 4800,
  },
];
