import type { Coordinates, DeliveryRate } from "@/lib/types/delivery";

export type DeliveryRouteSummary = {
  distanceKm: number;
  durationMinutes: number;
  geometry: Coordinates[];
};

export function getDistanceKm(origin: Coordinates, destination: Coordinates): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(destination.lat - origin.lat);
  const dLng = toRadians(destination.lng - origin.lng);
  const originLat = toRadians(origin.lat);
  const destinationLat = toRadians(destination.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(originLat) * Math.cos(destinationLat);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export function getDeliveryPrice(distanceKm: number, rates: DeliveryRate[]): number | null {
  const sorted = rates.slice().sort((left, right) => left.maxDistanceKm - right.maxDistanceKm);
  const matched = sorted.find((rate) => distanceKm <= rate.maxDistanceKm);
  return matched?.price ?? null;
}

export async function fetchRouteSummary(origin: Coordinates, destination: Coordinates): Promise<DeliveryRouteSummary> {
  const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const params = new URLSearchParams({
    overview: "full",
    geometries: "geojson",
    steps: "false",
  });
  const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?${params.toString()}`);

  if (!response.ok) {
    throw new Error("No se pudo calcular la ruta del delivery");
  }

  const payload = (await response.json()) as {
    routes?: Array<{
      distance: number;
      duration: number;
      geometry?: {
        coordinates?: number[][];
      };
    }>;
  };

  const route = payload.routes?.[0];

  if (!route) {
    throw new Error("No hay una ruta disponible para esa direccion");
  }

  return {
    distanceKm: route.distance / 1000,
    durationMinutes: route.duration / 60,
    geometry: (route.geometry?.coordinates ?? []).map(([lng, lat]) => ({ lat, lng })),
  };
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}
