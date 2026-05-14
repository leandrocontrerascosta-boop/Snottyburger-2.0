import { NextResponse } from "next/server";
import { createSharedCartSession } from "@/app/api/shared-cart/_lib";
import type { CartItem } from "@/lib/types/order";

type CreateSessionBody = {
  seedItems?: CartItem[];
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CreateSessionBody;
  const seedItems = Array.isArray(body.seedItems) ? body.seedItems : [];

  const result = await createSharedCartSession(seedItems);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    sessionId: result.session.id,
    pin: result.session.pin,
    expiresAt: result.session.expiresAt,
    ownerToken: result.ownerToken,
    items: result.items,
  });
}
