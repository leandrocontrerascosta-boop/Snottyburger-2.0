import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/api/admin/sales") {
    return NextResponse.next();
  }

  // All other /api/admin routes require no extra handling for now
  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*", "/api/admin/:path*"],
};
