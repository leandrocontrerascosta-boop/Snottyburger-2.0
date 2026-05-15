import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { code } = (await request.json()) as { code?: string };

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return Response.json({ error: "Código requerido" }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      return Response.json(
        { error: "Error en configuración del servidor" },
        { status: 500 }
      );
    }

    // Get promo code from database
    const { data, error } = await supabase
      .from("promo_codes")
      .select("id, code, discount_percent, apply_to, is_active, max_uses, current_uses")
      .eq("code", code.toUpperCase().trim())
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return Response.json({ error: "Código de promoción no válido" }, { status: 404 });
    }

    // Check if code has reached max uses
    if (data.max_uses && data.current_uses >= data.max_uses) {
      return Response.json({ error: "Código de promoción expirado" }, { status: 410 });
    }

    return Response.json({
      ok: true,
      code: data.code,
      discountPercent: data.discount_percent,
      applyTo: data.apply_to,
    });
  } catch (err) {
    console.error("Promo code validation error:", err);
    return Response.json(
      { error: "Error validando código de promoción" },
      { status: 500 }
    );
  }
}
