import { NextResponse } from "next/server";
import { saveMenuItemOffer } from "@/lib/data/menu-item-offers";
import type { MenuDiscountTarget } from "@/lib/types/panel";

type RouteContext = {
  params: Promise<{
    itemId: string;
  }>;
};

type SaveOfferBody = {
  discountPercent?: number;
  discountTarget?: MenuDiscountTarget;
};

export async function PUT(request: Request, context: RouteContext) {
  const { itemId } = await context.params;
  const body = (await request.json()) as SaveOfferBody;

  const discountPercent = Number(body.discountPercent ?? 0);
  const discountTarget = normalizeDiscountTarget(body.discountTarget);

  if (!itemId || !Number.isFinite(discountPercent) || discountPercent <= 0) {
    return NextResponse.json({ error: "Oferta invalida" }, { status: 400 });
  }

  await saveMenuItemOffer(itemId, {
    discountPercent,
    discountTarget,
  });

  return NextResponse.json({
    offer: {
      itemId,
      discountPercent: Math.max(0, Math.min(90, Math.round(discountPercent))),
      discountTarget,
    },
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { itemId } = await context.params;

  if (!itemId) {
    return NextResponse.json({ error: "Producto invalido" }, { status: 400 });
  }

  await saveMenuItemOffer(itemId, undefined);

  return NextResponse.json({ ok: true });
}

function normalizeDiscountTarget(value: unknown): MenuDiscountTarget {
  if (value === "simple" || value === "double" || value === "both") {
    return value;
  }

  return "simple";
}
