import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger rutas admin con autenticación
  if (pathname.startsWith("/api/admin")) {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    // Si no hay token, rechazar
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: missing token" },
        { status: 401 }
      );
    }

    // Verificar token con Supabase (si está configurado)
    // Por ahora, retornar siguiente para no bloquear development
    // TODO: Habilitar cuando se configure Supabase Auth para admin
  }

  // Panel admin requiere session (manejado en el componente)
  if (pathname.startsWith("/panel") && pathname !== "/panel/login") {
    // El middleware de Supabase maneja esto
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*", "/api/admin/:path*"],
};
