import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export async function PATCH(request: Request, { params }: { params: { codeId: string } }) {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Faltan las credenciales de Supabase en el entorno" }, { status: 503 });
  }

  const { codeId } = params;
  const body = (await request.json()) as { isActive?: boolean };

  if (typeof body.isActive === "undefined") {
    return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("promo_codes")
    .update({ is_active: Boolean(body.isActive) })
    .eq("id", codeId)
    .select("id,code,description,discount_percent,apply_to,is_active,max_uses,current_uses,created_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "No se pudo actualizar el codigo" }, { status: 500 });
  }

  const mapped = {
    id: data.id,
    code: data.code,
    description: data.description,
    discountPercent: data.discount_percent,
    applyTo: data.apply_to,
    isActive: data.is_active,
    maxUses: data.max_uses,
    currentUses: data.current_uses,
    createdAt: data.created_at,
  };

  return NextResponse.json({ code: mapped });
}

export async function DELETE(request: Request, { params }: { params: { codeId: string } }) {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Faltan las credenciales de Supabase en el entorno" }, { status: 503 });
  }

  const { codeId } = params;

  const { error } = await supabase.from("promo_codes").delete().eq("id", codeId);
  if (error) {
    return NextResponse.json({ error: "No se pudo eliminar el codigo" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
