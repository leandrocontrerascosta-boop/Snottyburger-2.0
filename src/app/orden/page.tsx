import { OrderExperience } from "@/components/order/order-experience";
import { fetchBurgerModifierGroups } from "@/lib/data/burger-modifier-groups";
import { fetchDeliveryRates } from "@/lib/data/delivery-rates";
import { fetchDrinkItems } from "@/lib/data/drink-items";
import { fetchMenuItems } from "@/lib/data/menu-items";
import { fetchPromoItems } from "@/lib/data/promo-items";
import { fetchSalesRecords } from "@/lib/data/sales-records";

export default async function OrderPage() {
  const [menuItems, drinkItems, promoItems, modifierGroups, deliveryRates, salesRecords] = await Promise.all([
    fetchMenuItems({ activeOnly: true }),
    fetchDrinkItems({ activeOnly: true }),
    fetchPromoItems({ activeOnly: true }),
    fetchBurgerModifierGroups(),
    fetchDeliveryRates({ activeOnly: true }),
    fetchSalesRecords(),
  ]);

  return (
    <OrderExperience
      initialMenuItems={menuItems}
      initialDrinkItems={drinkItems}
      initialPromos={promoItems}
      initialBurgerModifierGroups={modifierGroups}
      initialDeliveryRates={deliveryRates}
      initialSalesRecords={salesRecords}
    />
  );
}