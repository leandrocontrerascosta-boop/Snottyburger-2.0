import { PanelShell } from "@/components/panel/panel-shell";

export const dynamic = "force-dynamic";

import { fetchDeliveryRates } from "@/lib/data/delivery-rates";
import { fetchDrinkItems } from "@/lib/data/drink-items";
import { fetchExtraItems } from "@/lib/data/extra-items";
import { fetchMenuItems } from "@/lib/data/menu-items";
import { fetchPromoItems } from "@/lib/data/promo-items";
import { fetchSalesRecords } from "@/lib/data/sales-records";
import { fetchStory } from "@/lib/data/story";
import { fetchTransferAlias } from "@/lib/data/transfer-alias";

export default async function PanelPage() {
  const [menuItems, extraItems, drinkItems, promoItems, salesRecords, deliveryRates, story, transferAliasData] = await Promise.all([
    fetchMenuItems(),
    fetchExtraItems(),
    fetchDrinkItems(),
    fetchPromoItems(),
    fetchSalesRecords(),
    fetchDeliveryRates(),
    fetchStory(),
    fetchTransferAlias(),
  ]);

  return (
    <PanelShell
      initialMenuItems={menuItems}
      initialExtraItems={extraItems}
      initialDrinkItems={drinkItems}
      initialPromos={promoItems}
      initialSalesRecords={salesRecords}
      initialDeliveryRates={deliveryRates}
      initialStory={{ id: "story-main", ...story }}
      initialTransferAlias={transferAliasData.alias}
      initialTransferAliasUpdatedAt={transferAliasData.updatedAt}
    />
  );
}