import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger rutas admin con autenticación
  if (pathname.startsWith("/api/admin")) {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    // Si se recibe un token, puede verificarse en el futuro.
    // Por ahora, no bloquear las rutas admin cuando no haya header.
    if (token) {
      // TODO: verificar token con Supabase cuando se configure Auth para admin
    }
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
