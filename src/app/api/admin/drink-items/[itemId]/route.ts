import { NextResponse } from "next/server";
import { ensureWebOptimizedImage } from "@/lib/images/ensure-web-image";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import type { DrinkItemAdmin } from "@/lib/types/panel";

type UpdateDrinkItemBody = Partial<{
  name: string;
  description: string;
  image: string;
  price: number;
  status: "active" | "paused";
}>;

type DrinkItemRow = {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  status: "active" | "paused";
};

type RouteContext = {
  params: Promise<{ itemId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ error: "Faltan las credenciales de Supabase en el entorno" }, { status: 503 });
  }

  const { itemId } = await context.params;
  const body = (await request.json()) as UpdateDrinkItemBody;
  const payload: Record<string, string | number> = {};

  if (typeof body.name === "string") payload.name = body.name.trim();
  if (typeof body.description === "string") payload.description = body.description.trim();
  if (typeof body.image === "string") payload.image = await ensureWebOptimizedImage(body.image.trim());
  if (typeof body.price === "number") payload.price = body.price;
  if (body.status) payload.status = body.status;

  const { data, error } = await supabase
    .from("drink_items")
    .update(payload)
    .eq("id", itemId)
    .select("id,name,description,image,price,status")
    .single<DrinkItemRow>();

  if (error || !data) {
    return NextResponse.json({ error: "No se pudo actualizar la bebida" }, { status: 500 });
  }

  return NextResponse.json({ item: mapDrinkItemRow(data) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ error: "Faltan las credenciales de Supabase en el entorno" }, { status: 503 });
  }

  const { itemId } = await context.params;
  const { error } = await supabase.from("drink_items").delete().eq("id", itemId);

  if (error) {
    return NextResponse.json({ error: "No se pudo eliminar la bebida" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
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