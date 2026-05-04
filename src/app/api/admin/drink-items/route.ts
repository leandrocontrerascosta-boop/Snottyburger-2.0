import { NextResponse } from "next/server";
import { ensureWebOptimizedImage } from "@/lib/images/ensure-web-image";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import type { DrinkItemAdmin } from "@/lib/types/panel";

type CreateDrinkItemBody = {
  name: string;
  description: string;
  image: string;
  price: number;
};

type DrinkItemRow = {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  status: "active" | "paused";
};

export async function POST(request: Request) {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ error: "Faltan las credenciales de Supabase en el entorno" }, { status: 503 });
  }

  const body = (await request.json()) as CreateDrinkItemBody;
  const optimizedImage = await ensureWebOptimizedImage(body.image.trim());
  const { data, error } = await supabase
    .from("drink_items")
    .insert({
      name: body.name.trim(),
      description: body.description.trim(),
      image: optimizedImage,
      price: body.price,
      status: "active",
    })
    .select("id,name,description,image,price,status")
    .single<DrinkItemRow>();

  if (error || !data) {
    return NextResponse.json({ error: "No se pudo crear la bebida" }, { status: 500 });
  }

  return NextResponse.json({ item: mapDrinkItemRow(data) });
}

function mapDrinkItemRow(row: DrinkItemRow): DrinkItemAdmin {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.image,
    price: row.price,
    status: row.status,
  };
}