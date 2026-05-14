"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildOrderProducts,
  buildPromoDeals,
  buildRecommendationProducts,
  buildStandalonePromoProducts,
  categories,
  locations,
  promoBanner,
} from "@/lib/order/catalog";
import type { DeliveryRate } from "@/lib/types/delivery";
import type { DrinkItemAdmin, MenuItemAdmin, PromoAdmin } from "@/lib/types/panel";
import type { ModifierGroup, Product } from "@/lib/types/order";
import { CartProvider, useCart } from "@/lib/store/cart-store";
import { SharedCartProvider, useSharedCart } from "@/lib/store/shared-cart-store";
import { formatStoreScheduleLabel } from "@/lib/store/store-availability";
import { useStoreAvailability } from "@/lib/store/use-store-availability";
import { CartDrawer } from "@/components/order/cart-drawer";
import { DiscountPromoRow } from "@/components/order/discount-promo-row";
import { HeroBanner } from "@/components/order/hero-banner";
import { LocationSheet } from "@/components/order/location-sheet";
import { OrderHeader } from "@/components/order/order-header";
import { ProductDetailModal } from "@/components/order/product-detail-modal";
import { ProductGrid } from "@/components/order/product-grid";
import { PromoStrip } from "@/components/order/promo-strip";
import { SharedCartFab } from "@/components/order/shared-cart-fab";

type OrderScreenProps = {
  allProducts: Product[];
  deliveryRates: DeliveryRate[];
  promos: PromoAdmin[];
};

function OrderScreen({
  allProducts,
  deliveryRates,
  promos,
}: OrderScreenProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPromoProduct, setSelectedPromoProduct] = useState<Product | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState(locations[0]?.id ?? "");
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const { items: localItems, itemCount, addItem } = useCart();
  const sharedCart = useSharedCart();
  const { settings: storeSettings, state: storeAvailability } = useStoreAvailability();
  const canOrder = storeAvailability.isOpen;
  const closedMessage = "El local esta cerrado por el momento.";
  const products = allProducts;
  const locationsWithSchedule = useMemo(
    () => locations.map((location) => ({ ...location, hours: formatStoreScheduleLabel(storeSettings) })),
    [storeSettings],
  );

  const selectedLocation = useMemo(
    () => locationsWithSchedule.find((location) => location.id === selectedLocationId) ?? locationsWithSchedule[0],
    [locationsWithSchedule, selectedLocationId],
  );

  const productSections = useMemo(
    () =>
      categories.map((category) => ({
        category,
        products: products.filter((product) => product.categoryId === category.id),
      })).filter((section) => section.products.length > 0),
    [products],
  );

  const recommendationProducts = useMemo(() => buildRecommendationProducts(products), [products]);
  const visibleItemCount = useMemo(() => {
    if (!sharedCart.isActive) {
      return itemCount;
    }

    return sharedCart.items.reduce((total, item) => total + item.quantity, 0);
  }, [itemCount, sharedCart.isActive, sharedCart.items]);

  const productsById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const deals = useMemo(() => buildPromoDeals(promos, products), [products, promos]);
  const activeModalProduct = selectedProduct ?? selectedPromoProduct;

  useEffect(() => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }, []);

  useEffect(() => {
    const shouldLock = Boolean(selectedProduct) || Boolean(selectedPromoProduct) || locationSheetOpen || mobileCartOpen;

    if (!shouldLock) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [locationSheetOpen, mobileCartOpen, selectedProduct, selectedPromoProduct]);

  return (
    <div className="page-shell overflow-x-hidden pb-24 lg:pb-0">
      <LocationSheet
        open={locationSheetOpen}
        locations={locationsWithSchedule}
        activeLocationId={selectedLocation.id}
        onClose={() => setLocationSheetOpen(false)}
        onSelectLocation={setSelectedLocationId}
      />

      <div className="site-frame relative space-y-4 py-3 md:space-y-5 md:py-5">
        <OrderHeader
          location={selectedLocation}
          itemCount={visibleItemCount}
          canOrder={canOrder}
          onOpenLocation={() => setLocationSheetOpen(true)}
          onOpenCart={() => setMobileCartOpen(true)}
        />

        {!canOrder ? (
          <div className="rounded-[20px] border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {closedMessage}
          </div>
        ) : null}

        <HeroBanner />
        <PromoStrip promo={promoBanner} />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_350px] lg:items-start">
          <div className="space-y-8">
            <DiscountPromoRow
              deals={deals}
              productsById={productsById}
              onSelectProduct={setSelectedProduct}
              onSelectPromo={setSelectedPromoProduct}
            />
            <ProductGrid sections={productSections} onSelectProduct={setSelectedProduct} />
          </div>

          <div className="hidden lg:block">
            <CartDrawer
              open
              canOrder={canOrder}
              closedMessage={closedMessage}
              allProducts={products}
              deliveryRates={deliveryRates}
              selectedLocation={selectedLocation}
              recommendationProducts={recommendationProducts}
              onClose={() => undefined}
            />
          </div>
        </div>
      </div>

      <div className="lg:hidden">
        <CartDrawer
          allProducts={products}
          canOrder={canOrder}
          closedMessage={closedMessage}
          deliveryRates={deliveryRates}
          open={mobileCartOpen}
          selectedLocation={selectedLocation}
          recommendationProducts={recommendationProducts}
          onClose={() => setMobileCartOpen(false)}
        />
      </div>

      <button
        type="button"
        onClick={() => setMobileCartOpen(true)}
        className="tap-target fixed bottom-3 right-3 z-20 inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-3 py-3 text-xs font-semibold text-white shadow-[0_18px_40px_rgba(191,36,63,0.28)] transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:bg-[#c9c1c2] sm:bottom-4 sm:right-4 sm:gap-3 sm:px-5 sm:py-4 sm:text-sm lg:hidden"
        aria-label={`Abrir carrito con ${itemCount} productos`}
        disabled={!canOrder}
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/16 text-[13px] sm:hidden">
          🛒
        </span>
        <span className="hidden sm:inline">Abrir carrito</span>
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-[11px] text-[var(--brand)] sm:h-7 sm:min-w-7 sm:px-2">
          {visibleItemCount}
        </span>
      </button>

      <SharedCartFab seedItems={localItems} />

      <ProductDetailModal
        key={activeModalProduct?.id ?? "no-product"}
        product={activeModalProduct}
        canOrder={canOrder}
        closedMessage={closedMessage}
        onClose={() => {
          setSelectedProduct(null);
          setSelectedPromoProduct(null);
        }}
        onAddToCart={(payload) => {
          if (!canOrder) {
            return;
          }

          if (sharedCart.isActive) {
            sharedCart.addItem(payload);
            return;
          }

          addItem(payload);
        }}
      />
    </div>
  );
}

type OrderExperienceProps = {
  initialBurgerModifierGroups: ModifierGroup[];
  initialDeliveryRates: DeliveryRate[];
  initialDrinkItems: DrinkItemAdmin[];
  initialMenuItems: MenuItemAdmin[];
  initialPromos: PromoAdmin[];
};

export function OrderExperience({
  initialBurgerModifierGroups,
  initialDeliveryRates,
  initialDrinkItems,
  initialMenuItems,
  initialPromos,
}: OrderExperienceProps) {
  const products = useMemo(() => {
    const coreProducts = buildOrderProducts(initialMenuItems, initialDrinkItems, initialBurgerModifierGroups);
    const promoProducts = buildStandalonePromoProducts(initialPromos);
    return [...coreProducts, ...promoProducts];
  }, [initialBurgerModifierGroups, initialDrinkItems, initialMenuItems, initialPromos]);

  return (
    <CartProvider products={products}>
      <SharedCartProvider>
        <OrderScreen
          allProducts={products}
          deliveryRates={initialDeliveryRates}
          promos={initialPromos}
        />
      </SharedCartProvider>
    </CartProvider>
  );
}