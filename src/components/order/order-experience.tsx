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
import type { DrinkItemAdmin, MenuItemAdmin, PromoAdmin, SaleRecord } from "@/lib/types/panel";
import type { ModifierGroup, Product } from "@/lib/types/order";
import { CartProvider, useCart } from "@/lib/store/cart-store";
import { useStoreAvailability } from "@/lib/store/use-store-availability";
import { CartDrawer } from "@/components/order/cart-drawer";
import { DiscountPromoRow } from "@/components/order/discount-promo-row";
import { HeroBanner } from "@/components/order/hero-banner";
import { LocationSheet } from "@/components/order/location-sheet";
import { OrderHeader } from "@/components/order/order-header";
import { ProductDetailModal } from "@/components/order/product-detail-modal";
import { ProductGrid } from "@/components/order/product-grid";
import { PromoStrip } from "@/components/order/promo-strip";

type OrderScreenProps = {
  allProducts: Product[];
  deliveryRates: DeliveryRate[];
  promos: PromoAdmin[];
  salesRecords: SaleRecord[];
};

function OrderScreen({
  allProducts,
  deliveryRates,
  promos,
  salesRecords,
}: OrderScreenProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPromoProduct, setSelectedPromoProduct] = useState<Product | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState(locations[0]?.id ?? "");
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const { itemCount, addItem } = useCart();
  const { state: storeAvailability } = useStoreAvailability();
  const canOrder = storeAvailability.isOpen;
  const closedMessage = "El local esta cerrado por el momento.";
  const products = allProducts;

  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === selectedLocationId) ?? locations[0],
    [selectedLocationId],
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

  const productsById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const deals = useMemo(() => buildPromoDeals(promos, products), [products, promos]);
  const activeModalProduct = selectedProduct ?? selectedPromoProduct;
  const topProductIds = useMemo(() => {
    const quantityByProduct = new Map<string, number>();

    for (const record of salesRecords) {
      if (record.status !== "paid") {
        continue;
      }

      for (const item of record.items) {
        const product = productsById.get(item.productId);
        if (!product || product.categoryId !== "burgers") {
          continue;
        }

        quantityByProduct.set(item.productId, (quantityByProduct.get(item.productId) ?? 0) + item.quantity);
      }
    }

    return new Set(
      Array.from(quantityByProduct.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([productId]) => productId),
    );
  }, [productsById, salesRecords]);

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
        locations={locations}
        activeLocationId={selectedLocation.id}
        onClose={() => setLocationSheetOpen(false)}
        onSelectLocation={setSelectedLocationId}
      />

      <div className="site-frame relative space-y-4 py-3 md:space-y-5 md:py-5">
        <OrderHeader
          location={selectedLocation}
          itemCount={itemCount}
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
            <ProductGrid sections={productSections} topProductIds={topProductIds} onSelectProduct={setSelectedProduct} />
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
          {itemCount}
        </span>
      </button>

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
  initialSalesRecords: SaleRecord[];
};

export function OrderExperience({
  initialBurgerModifierGroups,
  initialDeliveryRates,
  initialDrinkItems,
  initialMenuItems,
  initialPromos,
  initialSalesRecords,
}: OrderExperienceProps) {
  const products = useMemo(() => {
    const coreProducts = buildOrderProducts(initialMenuItems, initialDrinkItems, initialBurgerModifierGroups);
    const promoProducts = buildStandalonePromoProducts(initialPromos);
    return [...coreProducts, ...promoProducts];
  }, [initialBurgerModifierGroups, initialDrinkItems, initialMenuItems, initialPromos]);

  return (
    <CartProvider products={products}>
      <OrderScreen
        allProducts={products}
        deliveryRates={initialDeliveryRates}
        promos={initialPromos}
        salesRecords={initialSalesRecords}
      />
    </CartProvider>
  );
}