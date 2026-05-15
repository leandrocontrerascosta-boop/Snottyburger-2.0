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

    // Increment the use count for the promo code
    const { error } = await supabase.rpc("increment_promo_code_uses", {
      promo_code: code.toUpperCase().trim(),
    });

    if (error) {
      console.error("Error incrementing promo code uses:", error);
      return Response.json(
        { error: "Error procesando código de promoción" },
        { status: 500 }
      );
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Promo code increment error:", err);
    return Response.json(
      { error: "Error procesando código de promoción" },
      { status: 500 }
    );
  }
}
