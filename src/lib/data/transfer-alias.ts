import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export type TransferAliasData = {
  alias: string;
  updatedAt: string;
};

const defaultAlias: TransferAliasData = {
  alias: "Emicarrizo73",
  updatedAt: new Date().toISOString(),
};

export async function fetchTransferAlias(): Promise<TransferAliasData> {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return defaultAlias;
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "transfer-alias")
    .single();

  if (error || !data?.value) {
    return defaultAlias;
  }

  const value = data.value as Partial<TransferAliasData>;

  return {
    alias: typeof value.alias === "string" ? value.alias : defaultAlias.alias,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : defaultAlias.updatedAt,
  };
}
