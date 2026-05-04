import "server-only";
import { createSupabasePublicClient } from "@/lib/supabase/public-client";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import type { FulfillmentMethod, PaymentMethod, SaleRecord, SaleRecordItem, SalesStatus } from "@/lib/types/panel";

type SalesOrderItemRow = {
  product_id: string;
  product_name: string;
  quantity: number;
  line_total: number;
  size_label: "SIMPLE" | "DOBLE" | null;
};

type SalesOrderRow = {
  id: string;
  created_at: string;
  customer_name: string;
  location_name: string;
  fulfillment_method: FulfillmentMethod;
  total: number;
  item_count: number;
  payment_method: PaymentMethod;
  status: SalesStatus;
  sales_order_items: SalesOrderItemRow[] | null;
};

export async function fetchSalesRecords(): Promise<SaleRecord[]> {
  const supabase = createSupabaseServiceClient() ?? createSupabasePublicClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("sales_orders")
    .select(
      "id,created_at,customer_name,location_name,fulfillment_method,total,item_count,payment_method,status,sales_order_items(product_id,product_name,quantity,line_total,size_label)",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error || !data) {
    return [];
  }

  return data.map(mapSalesOrderRow);
}

function mapSalesOrderRow(row: SalesOrderRow): SaleRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    customerName: row.customer_name,
    location: row.location_name,
    fulfillmentMethod: row.fulfillment_method,
    total: row.total,
    itemCount: row.item_count,
    items: (row.sales_order_items ?? []).map(mapSalesOrderItemRow),
    paymentMethod: row.payment_method,
    status: row.status,
  };
}

function mapSalesOrderItemRow(row: SalesOrderItemRow): SaleRecordItem {
  return {
    productId: row.product_id,
    productName: row.product_name,
    quantity: row.quantity,
    lineTotal: row.line_total,
    sizeLabel: row.size_label,
  };
}
