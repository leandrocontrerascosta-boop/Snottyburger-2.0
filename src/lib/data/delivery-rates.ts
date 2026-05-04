import "server-only";
import { initialDeliveryRates } from "@/lib/mocks/delivery-data";
import { createSupabasePublicClient } from "@/lib/supabase/public-client";
import type { DeliveryRate } from "@/lib/types/delivery";

type DeliveryRateRow = {
  id: string;
  max_distance_km: number;
  price: number;
  status?: "active" | "paused";
};

export async function fetchDeliveryRates(options?: { activeOnly?: boolean }): Promise<DeliveryRate[]> {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return initialDeliveryRates;
  }

  let query = supabase
    .from("delivery_rates")
    .select("id,max_distance_km,price,status")
    .order("max_distance_km", { ascending: true });

  if (options?.activeOnly) {
    query = query.eq("status", "active");
  }

  const { data, error } = await query;

  if (error || !data) {
    return initialDeliveryRates;
  }

  const mapped = data.map((row) => ({
    id: row.id,
    maxDistanceKm: Number(row.max_distance_km),
    price: row.price,
  }));

  return mapped.length > 0 ? mapped : initialDeliveryRates;
}