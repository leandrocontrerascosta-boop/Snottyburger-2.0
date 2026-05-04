import "server-only";
import { products as fallbackProducts } from "@/lib/mocks/order-data";
import { createSupabasePublicClient } from "@/lib/supabase/public-client";
import type { DrinkItemAdmin } from "@/lib/types/panel";

type DrinkItemRow = {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  status: "active" | "paused";
};

function getFallbackDrinkItems(): DrinkItemAdmin[] {
  return fallbackProducts
    .filter((product) => product.categoryId === "drinks")
    .map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      image: product.image,
      price: product.price,
      status: "active" as const,
    }));
}

export async function fetchDrinkItems(options?: { activeOnly?: boolean }): Promise<DrinkItemAdmin[]> {
  const fallback = options?.activeOnly ? getFallbackDrinkItems().filter((item) => item.status === "active") : getFallbackDrinkItems();
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return fallback;
  }

  let query = supabase
    .from("drink_items")
    .select("id,name,description,image,price,status")
    .order("name", { ascending: true });

  if (options?.activeOnly) {
    query = query.eq("status", "active");
  }

  const { data, error } = await query;

  if (error || !data) {
    return fallback;
  }

  const mapped = data.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.image,
    price: row.price,
    status: row.status,
  }));

  return mapped.length > 0 ? mapped : fallback;
}