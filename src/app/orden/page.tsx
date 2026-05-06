import { OrderExperience } from "@/components/order/order-experience";

export const dynamic = "force-dynamic";
import { fetchBurgerModifierGroups } from "@/lib/data/burger-modifier-groups";
import { fetchDeliveryRates } from "@/lib/data/delivery-rates";
import { fetchDrinkItems } from "@/lib/data/drink-items";
import { fetchMenuItems } from "@/lib/data/menu-items";
import { fetchPromoItems } from "@/lib/data/promo-items";

export default async function OrderPage() {
  const [menuItems, drinkItems, promoItems, modifierGroups, deliveryRates] = await Promise.all([
    fetchMenuItems({ activeOnly: true }),
    fetchDrinkItems({ activeOnly: true }),
    fetchPromoItems({ activeOnly: true }),
    fetchBurgerModifierGroups(),
    fetchDeliveryRates({ activeOnly: true }),
  ]);

  return (
    <OrderExperience
      initialMenuItems={menuItems}
      initialDrinkItems={drinkItems}
      initialPromos={promoItems}
      initialBurgerModifierGroups={modifierGroups}
      initialDeliveryRates={deliveryRates}
    />
  );
}