import { NextResponse } from "next/server";
import { ensureWebOptimizedImage } from "@/lib/images/ensure-web-image";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import type { MenuItemAdmin } from "@/lib/types/panel";

type UpdateMenuItemBody = Partial<{
  name: string;
  description: string;
  image: string;
  simplePrice: number;
  doublePrice: number;
  discountTarget?: "simple" | "double";
  discountPercent?: number;
  status: "active" | "paused";
}>;

type MenuItemRow = {
  id: string;
  name: string;
  description: string;
  image: string;
  simple_price: number;
  double_price: number;
  discount_target: "simple" | "double" | null;
  discount_percent: number | null;
  status: "active" | "paused";
};

type RouteContext = {
  params: Promise<{
    itemId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ error: "Faltan las credenciales de Supabase en el entorno" }, { status: 503 });
  }

  const { itemId } = await context.params;
  const body = (await request.json()) as UpdateMenuItemBody;
  const payload: Record<string, string | number | null> = {};

  if (typeof body.name === "string") {
    payload.name = body.name.trim();
  }
  if (typeof body.description === "string") {
    payload.description = body.description.trim();
  }
  if (typeof body.image === "string") {
    payload.image = await ensureWebOptimizedImage(body.image.trim());
  }
  if (typeof body.simplePrice === "number") {
    payload.simple_price = body.simplePrice;
  }
  if (typeof body.doublePrice === "number") {
    payload.double_price = body.doublePrice;
  }
  if (body.status) {
    payload.status = body.status;
  }

  if (typeof body.discountPercent === "number") {
    payload.discount_percent = body.discountPercent > 0 ? body.discountPercent : null;
    payload.discount_target = body.discountPercent > 0 ? body.discountTarget ?? null : null;
  } else if (body.discountTarget !== undefined) {
    payload.discount_target = body.discountTarget ?? null;
  }

  const { data, error } = await supabase
    .from("menu_items")
    .update(payload)
    .eq("id", itemId)
    .select("id,name,description,image,simple_price,double_price,discount_target,discount_percent,status")
    .single<MenuItemRow>();

  if (error || !data) {
    return NextResponse.json({ error: "No se pudo actualizar el producto" }, { status: 500 });
  }

  return NextResponse.json({ item: mapMenuItemRow(data) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ error: "Faltan las credenciales de Supabase en el entorno" }, { status: 503 });
  }

  const { itemId } = await context.params;
  const { error } = await supabase.from("menu_items").delete().eq("id", itemId);

  if (error) {
    return NextResponse.json({ error: "No se pudo eliminar el producto" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function mapMenuItemRow(row: MenuItemRow): MenuItemAdmin {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.image,
    simplePrice: row.simple_price,
    doublePrice: row.double_price,
    discountTarget: row.discount_target ?? undefined,
    discountPercent: row.discount_percent ?? undefined,
    status: row.status,
  };
}