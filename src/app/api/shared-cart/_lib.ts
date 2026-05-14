import { createHash, randomBytes, randomInt } from "crypto";
import { NextRequest } from "next/server";
import { createCartItemId } from "@/lib/pricing/order-pricing";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import type { CartItem } from "@/lib/types/order";

export const SHARED_CART_DURATION_MS = 60 * 60 * 1000;
const MAX_PIN_ATTEMPTS = 3;
const PIN_ATTEMPT_WINDOW_MS = 60 * 60 * 1000;

type SharedCartSessionRow = {
  id: string;
  pin_4: string;
  owner_token_hash: string;
  expires_at: string;
  status: "active" | "closed";
};

type SharedCartItemRow = {
  item_id: string;
  product_id: string;
  quantity: number;
  selected_choice_ids: string[] | null;
  note: string | null;
};

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

export async function purgeExpiredSharedSessions() {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return;
  }

  await supabase
    .from("shared_cart_sessions")
    .delete()
    .lt("expires_at", new Date().toISOString());
}

export async function countRecentFailedPinAttempts(ipAddress: string): Promise<number> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return 0;
  }

  const sinceIso = new Date(Date.now() - PIN_ATTEMPT_WINDOW_MS).toISOString();
  const { count } = await supabase
    .from("shared_cart_join_attempts")
    .select("id", { head: true, count: "exact" })
    .eq("ip_address", ipAddress)
    .eq("was_success", false)
    .gte("created_at", sinceIso);

  return count ?? 0;
}

export async function registerPinAttempt(ipAddress: string, pin: string, wasSuccess: boolean) {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return;
  }

  await supabase.from("shared_cart_join_attempts").insert({
    ip_address: ipAddress,
    pin_4: pin,
    was_success: wasSuccess,
  });
}

export function hasReachedPinAttemptLimit(attemptCount: number): boolean {
  return attemptCount >= MAX_PIN_ATTEMPTS;
}

export function normalizePinInput(pin: string): string {
  return pin.replace(/\D/g, "").slice(0, 4);
}

function hashToken(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function createPin(): string {
  return String(randomInt(0, 10000)).padStart(4, "0");
}

function createOwnerToken(): string {
  return randomBytes(24).toString("hex");
}

export async function createSharedCartSession(seedItems: CartItem[]) {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return { error: "Faltan las credenciales de Supabase en el entorno" } as const;
  }

  await purgeExpiredSharedSessions();

  let pin = "";
  for (let index = 0; index < 8; index += 1) {
    const candidate = createPin();
    const { data } = await supabase
      .from("shared_cart_sessions")
      .select("id")
      .eq("pin_4", candidate)
      .gt("expires_at", new Date().toISOString())
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (!data) {
      pin = candidate;
      break;
    }
  }

  if (!pin) {
    return { error: "No se pudo generar un PIN disponible" } as const;
  }

  const ownerToken = createOwnerToken();
  const expiresAt = new Date(Date.now() + SHARED_CART_DURATION_MS).toISOString();

  const { data: sessionRow, error: sessionError } = await supabase
    .from("shared_cart_sessions")
    .insert({
      pin_4: pin,
      owner_token_hash: hashToken(ownerToken),
      expires_at: expiresAt,
      status: "active",
    })
    .select("id, pin_4, owner_token_hash, expires_at, status")
    .single<SharedCartSessionRow>();

  if (sessionError || !sessionRow) {
    return { error: "No se pudo crear la sesion compartida" } as const;
  }

  const items = normalizeCartItems(seedItems);
  if (items.length > 0) {
    const payload = items.map((item) => ({
      session_id: sessionRow.id,
      item_id: item.id,
      product_id: item.productId,
      quantity: item.quantity,
      selected_choice_ids: item.selectedChoiceIds,
      note: item.note ?? null,
    }));

    const { error: itemsError } = await supabase.from("shared_cart_items").insert(payload);
    if (itemsError) {
      return { error: "Se creo la sesion pero no se pudieron guardar los items" } as const;
    }
  }

  return {
    session: {
      id: sessionRow.id,
      pin: sessionRow.pin_4,
      expiresAt: sessionRow.expires_at,
      status: sessionRow.status,
    },
    ownerToken,
    items,
  } as const;
}

export async function getActiveSessionById(sessionId: string) {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return { error: "Faltan las credenciales de Supabase en el entorno" } as const;
  }

  await purgeExpiredSharedSessions();

  const { data: sessionRow, error } = await supabase
    .from("shared_cart_sessions")
    .select("id, pin_4, owner_token_hash, expires_at, status")
    .eq("id", sessionId)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle<SharedCartSessionRow>();

  if (error) {
    return { error: "No se pudo consultar la sesion" } as const;
  }

  if (!sessionRow) {
    return { error: "Sesion no encontrada o expirada", status: 404 } as const;
  }

  return { session: sessionRow } as const;
}

export async function getActiveSessionByPin(pin: string) {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return { error: "Faltan las credenciales de Supabase en el entorno" } as const;
  }

  await purgeExpiredSharedSessions();

  const normalizedPin = normalizePinInput(pin);
  const { data: sessionRow, error } = await supabase
    .from("shared_cart_sessions")
    .select("id, pin_4, owner_token_hash, expires_at, status")
    .eq("pin_4", normalizedPin)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle<SharedCartSessionRow>();

  if (error) {
    return { error: "No se pudo consultar la sesion" } as const;
  }

  if (!sessionRow) {
    return { error: "PIN invalido o expirado", status: 404 } as const;
  }

  return { session: sessionRow } as const;
}

export async function getSessionItems(sessionId: string): Promise<CartItem[]> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("shared_cart_items")
    .select("item_id, product_id, quantity, selected_choice_ids, note")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
    .returns<SharedCartItemRow[]>();

  if (!data) {
    return [];
  }

  return data
    .map((item) => ({
      id: item.item_id,
      productId: item.product_id,
      quantity: item.quantity,
      selectedChoiceIds: item.selected_choice_ids ?? [],
      note: item.note ?? undefined,
    }))
    .filter((item) => item.quantity > 0);
}

export async function replaceSessionItems(sessionId: string, items: CartItem[]) {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return { error: "Faltan las credenciales de Supabase en el entorno" } as const;
  }

  const { error: deleteError } = await supabase
    .from("shared_cart_items")
    .delete()
    .eq("session_id", sessionId);

  if (deleteError) {
    return { error: "No se pudo actualizar el carrito compartido" } as const;
  }

  const normalizedItems = normalizeCartItems(items);
  if (normalizedItems.length === 0) {
    return { items: [] } as const;
  }

  const payload = normalizedItems.map((item) => ({
    session_id: sessionId,
    item_id: item.id,
    product_id: item.productId,
    quantity: item.quantity,
    selected_choice_ids: item.selectedChoiceIds,
    note: item.note ?? null,
  }));

  const { error: insertError } = await supabase.from("shared_cart_items").insert(payload);
  if (insertError) {
    return { error: "No se pudieron guardar los cambios del carrito" } as const;
  }

  return { items: normalizedItems } as const;
}

export function verifyOwnerToken(ownerToken: string, ownerTokenHash: string): boolean {
  return hashToken(ownerToken) === ownerTokenHash;
}

type SharedCartMutation =
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

export function applySharedCartMutation(items: CartItem[], mutation: SharedCartMutation): CartItem[] {
  switch (mutation.action) {
    case "add": {
      const quantity = Math.max(1, Math.floor(mutation.payload.quantity || 1));
      const selectedChoiceIds = mutation.payload.selectedChoiceIds ?? [];
      const note = mutation.payload.note?.trim() || undefined;
      const itemId = createCartItemId(mutation.payload.productId, selectedChoiceIds, note);
      const existing = items.find((item) => item.id === itemId);

      if (existing) {
        return items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item,
        );
      }

      return [
        ...items,
        {
          id: itemId,
          productId: mutation.payload.productId,
          quantity,
          selectedChoiceIds,
          note,
        },
      ];
    }
    case "increase":
      return items.map((item) =>
        item.id === mutation.payload.itemId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      );
    case "decrease":
      return items
        .map((item) =>
          item.id === mutation.payload.itemId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0);
    case "remove":
      return items.filter((item) => item.id !== mutation.payload.itemId);
    case "clear":
      return [];
    default:
      return items;
  }
}

function normalizeCartItems(items: CartItem[]): CartItem[] {
  return items
    .map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: Math.max(1, Math.floor(item.quantity || 1)),
      selectedChoiceIds: [...new Set(item.selectedChoiceIds ?? [])],
      note: item.note?.trim() || undefined,
    }))
    .filter((item) => Boolean(item.productId));
}
