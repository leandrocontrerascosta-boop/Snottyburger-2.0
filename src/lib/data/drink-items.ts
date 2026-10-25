import "server-only";
import { products as fallbackProducts } from "@/lib/mocks/order-data";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
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
  // Service client (server-only): el panel admin debe ver TODAS las bebidas,
  // incluso las pausadas. Con el cliente anonimo, RLS ocultaba las pausadas,
  // la lista quedaba vacia y el panel mostraba mocks con ids falsos
  // ("pepsi-can") que rompian editar/pausar/eliminar (500 uuid).
  const supabase = createSupabaseServiceClient();

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
    console.error("No se pudieron cargar las bebidas, usando fallback", error);
    return fallback;
  }

  // Si la query salio bien pero no hay filas (ej: todas pausadas),
  // devolver vacio es correcto: NO usar mocks, porque tienen ids
  // falsos que no existen en la DB y rompen el panel.
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.image,
    price: row.price,
    status: row.status,
  }));
}