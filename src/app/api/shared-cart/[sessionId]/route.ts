import { NextRequest, NextResponse } from "next/server";
import {
  applySharedCartMutation,
  getActiveSessionById,
  getSessionItems,
  replaceSessionItems,
  verifyOwnerToken,
} from "@/app/api/shared-cart/_lib";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

type RouteParams = {
  params: Promise<{ sessionId: string }>;
};

type ItemsMutationBody =
  | {
      action: "add";
      payload: {
        productId: string;
        quantity: number;
        selectedChoiceIds: string[];
        note?: string;
      };
    }
  | { action: "increase"; payload: { itemId: string } }
  | { action: "decrease"; payload: { itemId: string } }
  | { action: "remove"; payload: { itemId: string } }
  | { action: "clear" };

type PostBody =
  | {
      kind: "mutate-items";
      mutation: ItemsMutationBody;
    }
  | {
      kind: "finalize";
      ownerToken: string;
    };

export async function GET(request: NextRequest, context: RouteParams) {
  const { sessionId } = await context.params;
  const sessionResult = await getActiveSessionById(sessionId);
  if ("error" in sessionResult) {
    return NextResponse.json({ error: sessionResult.error }, { status: sessionResult.status ?? 404 });
  }

  const ownerToken = request.headers.get("x-owner-token") ?? "";
  const isOwner = ownerToken
    ? verifyOwnerToken(ownerToken, sessionResult.session.owner_token_hash)
    : false;
  const items = await getSessionItems(sessionResult.session.id);

  return NextResponse.json({
    sessionId: sessionResult.session.id,
    pin: sessionResult.session.pin_4,
    expiresAt: sessionResult.session.expires_at,
    items,
    isOwner,
  });
}

export async function POST(request: Request, context: RouteParams) {
  const { sessionId } = await context.params;
  const sessionResult = await getActiveSessionById(sessionId);
  if ("error" in sessionResult) {
    return NextResponse.json({ error: sessionResult.error }, { status: sessionResult.status ?? 404 });
  }

  const body = (await request.json().catch(() => null)) as PostBody | null;
  if (!body || !("kind" in body)) {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  if (body.kind === "mutate-items") {
    const currentItems = await getSessionItems(sessionResult.session.id);
    const nextItems = applySharedCartMutation(currentItems, body.mutation);
    const persistResult = await replaceSessionItems(sessionResult.session.id, nextItems);
    if ("error" in persistResult) {
      return NextResponse.json({ error: persistResult.error }, { status: 500 });
    }

    return NextResponse.json({ items: persistResult.items });
  }

  const ownerToken = body.ownerToken?.trim();
  if (!ownerToken) {
    return NextResponse.json({ error: "Falta token de propietario" }, { status: 400 });
  }

  const isOwner = verifyOwnerToken(ownerToken, sessionResult.session.owner_token_hash);
  if (!isOwner) {
    return NextResponse.json({ error: "Solo el creador puede confirmar el pedido" }, { status: 403 });
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Faltan las credenciales de Supabase en el entorno" }, { status: 503 });
  }

  const { error: closeError } = await supabase
    .from("shared_cart_sessions")
    .update({ status: "closed" })
    .eq("id", sessionResult.session.id)
    .eq("status", "active");

  if (closeError) {
    return NextResponse.json({ error: "No se pudo cerrar la sesion compartida" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
