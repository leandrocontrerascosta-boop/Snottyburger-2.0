import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

type SalesOrderItemInput = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  sizeLabel?: "SIMPLE" | "DOBLE";
  fries: string[];
  extras: string[];
  observation?: string;
};

type CreateSaleBody = {
  customerName: string;
  contactPhone: string;
  locationName: string;
  locationAddress: string;
  fulfillmentMethod: "pickup" | "delivery";
  paymentMethod: "cash" | "transfer";
  subtotal: number;
  deliveryPrice: number;
  total: number;
  deliveryAddressLabel?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  items: SalesOrderItemInput[];
};

export async function POST(request: Request) {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ error: "Faltan las credenciales de Supabase en el entorno" }, { status: 503 });
  }

  const body = (await request.json()) as CreateSaleBody;

  const { data: orderRow, error: orderError } = await supabase
    .from("sales_orders")
    .insert({
      customer_name: body.customerName.trim(),
      contact_phone: body.contactPhone.trim(),
      location_name: body.locationName.trim(),
      location_address: body.locationAddress.trim(),
      fulfillment_method: body.fulfillmentMethod,
      payment_method: body.paymentMethod,
      status: "paid",
      subtotal: body.subtotal,
      delivery_price: body.deliveryPrice,
      total: body.total,
      item_count: body.items.reduce((acc, item) => acc + item.quantity, 0),
      delivery_address_label: body.deliveryAddressLabel ?? null,
      delivery_lat: body.deliveryLat ?? null,
      delivery_lng: body.deliveryLng ?? null,
    })
    .select("id")
    .single<{ id: string }>();

  if (orderError || !orderRow) {
    return NextResponse.json({ error: "No se pudo registrar la venta" }, { status: 500 });
  }

  if (body.items.length > 0) {
    const itemsPayload = body.items.map((item) => ({
      order_id: orderRow.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      line_total: item.lineTotal,
      size_label: item.sizeLabel ?? null,
      fries: item.fries,
      extras: item.extras,
      observation: item.observation ?? null,
    }));

    const { error: itemsError } = await supabase.from("sales_order_items").insert(itemsPayload);

    if (itemsError) {
      return NextResponse.json({ error: "La venta se creo pero no se pudieron guardar los items" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, saleId: orderRow.id });
}
